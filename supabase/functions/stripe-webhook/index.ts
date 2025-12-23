import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2025-08-27.basil',
  });

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    logStep('Received webhook', { hasSignature: !!signature });

    // Parse the event
    const event = JSON.parse(body);

    logStep('Event received', { type: event.type, id: event.id });

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        logStep('Payment succeeded', { 
          paymentIntentId: paymentIntent.id, 
          amount: paymentIntent.amount,
          metadata: paymentIntent.metadata 
        });

        // IDEMPOTENCY CHECK: Find the deposit record by payment intent ID
        const { data: deposit, error: depositError } = await supabaseAdmin
          .from('deposit_records')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (depositError || !deposit) {
          logStep('No pending deposit found for payment intent', { paymentIntentId: paymentIntent.id });
          break;
        }

        // IDEMPOTENCY: Skip if already completed
        if (deposit.status === 'completed') {
          logStep('IDEMPOTENCY: Deposit already completed, skipping', { depositId: deposit.id });
          break;
        }

        // Use wallet_credit_amount (the intended amount user wants to receive)
        // NOT net_amount which was deducted by fees
        const walletCreditAmount = deposit.wallet_credit_amount || deposit.amount_jvc;
        const stripeChargeAmount = deposit.stripe_charge_amount || (paymentIntent.amount / 100);
        const stripeFee = deposit.stripe_fee || (stripeChargeAmount * 0.029 + 0.30);

        logStep('Minting JVC', { walletCreditAmount, stripeChargeAmount, stripeFee });

        // Update deposit record to completed FIRST (prevents duplicate processing)
        const { error: updateError } = await supabaseAdmin
          .from('deposit_records')
          .update({
            status: 'completed',
            stripe_charge_id: paymentIntent.latest_charge,
            completed_at: new Date().toISOString()
          })
          .eq('id', deposit.id)
          .eq('status', 'pending'); // Only update if still pending (double-check idempotency)

        if (updateError) {
          logStep('Error updating deposit or already processed', { error: updateError });
          break;
        }

        // Credit the wallet with the intended amount (wallet_credit_amount)
        const isVenueDeposit = !!deposit.venue_id;
        
        if (isVenueDeposit) {
          const { data: wallet } = await supabaseAdmin
            .from('venue_wallets')
            .select('balance_jvc')
            .eq('venue_id', deposit.venue_id)
            .single();

          const balanceBefore = wallet?.balance_jvc || 0;
          const newBalance = balanceBefore + walletCreditAmount;

          await supabaseAdmin
            .from('venue_wallets')
            .update({ 
              balance_jvc: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('venue_id', deposit.venue_id);

          // Create mint audit
          await supabaseAdmin.from('mint_burn_audit').insert({
            operation_type: 'mint',
            amount_jvc: walletCreditAmount,
            amount_usd: walletCreditAmount,
            wallet_id: deposit.venue_id,
            wallet_type: 'venue',
            triggered_by: 'deposit',
            deposit_id: deposit.id,
            balance_before: balanceBefore,
            balance_after: newBalance,
            total_supply_before: 0,
            total_supply_after: 0
          });

          logStep('Venue wallet credited', { balanceBefore, newBalance, credited: walletCreditAmount });
        } else {
          const { data: wallet } = await supabaseAdmin
            .from('user_wallets')
            .select('balance_jv_token, first_deposit_at')
            .eq('user_id', deposit.user_id)
            .single();

          const balanceBefore = wallet?.balance_jv_token || 0;
          const newBalance = balanceBefore + walletCreditAmount;
          const now = new Date().toISOString();

          // Update wallet with eligibility tracking
          await supabaseAdmin
            .from('user_wallets')
            .update({ 
              balance_jv_token: newBalance,
              updated_at: now,
              last_deposit_at: now,
              first_deposit_at: wallet?.first_deposit_at || now // Only set if first deposit
            })
            .eq('user_id', deposit.user_id);

          // Create mint audit
          await supabaseAdmin.from('mint_burn_audit').insert({
            operation_type: 'mint',
            amount_jvc: walletCreditAmount,
            amount_usd: walletCreditAmount,
            wallet_id: deposit.user_id,
            wallet_type: 'user',
            triggered_by: 'deposit',
            deposit_id: deposit.id,
            balance_before: balanceBefore,
            balance_after: newBalance,
            total_supply_before: 0,
            total_supply_after: 0
          });

          logStep('User wallet credited', { balanceBefore, newBalance, credited: walletCreditAmount });
        }

        // Update treasury - mint JVC
        const { data: treasury } = await supabaseAdmin
          .from('platform_treasury')
          .select('*')
          .limit(1)
          .single();

        const newSupply = (treasury?.total_jvc_supply || 0) + walletCreditAmount;
        const newBacking = (treasury?.total_usd_backing || 0) + walletCreditAmount;

        await supabaseAdmin
          .from('platform_treasury')
          .upsert({
            id: treasury?.id || undefined,
            total_jvc_supply: newSupply,
            total_usd_backing: newBacking,
            stripe_balance: (treasury?.stripe_balance || 0) + stripeChargeAmount,
            pending_deposits: Math.max(0, (treasury?.pending_deposits || 0) - stripeChargeAmount),
            updated_at: new Date().toISOString()
          });

        // Create transaction record
        await supabaseAdmin.from('transactions').insert({
          to_wallet_id: isVenueDeposit ? deposit.venue_id : deposit.user_id,
          to_wallet_type: isVenueDeposit ? 'venue' : 'user',
          amount_jvc: walletCreditAmount,
          amount_usd: walletCreditAmount,
          fee_amount: stripeFee,
          transaction_type: 'deposit',
          status: 'completed',
          description: `Deposit via ${deposit.deposit_method} - Received ${walletCreditAmount.toFixed(2)} JVC (Stripe charged: $${stripeChargeAmount.toFixed(2)}, fee: $${stripeFee.toFixed(2)})`,
          reference_id: deposit.id,
          reference_type: 'deposit',
          completed_at: new Date().toISOString()
        });

        logStep('Deposit completed successfully', { depositId: deposit.id, credited: walletCreditAmount });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        logStep('Payment failed', { paymentIntentId: paymentIntent.id });

        await supabaseAdmin
          .from('deposit_records')
          .update({
            status: 'failed',
            failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed'
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object;
        logStep('Checkout session completed', { sessionId: session.id, paymentIntentId: session.payment_intent });
        
        // For bank transfers via checkout, process similarly
        if (session.payment_intent && session.metadata?.type === 'jvc_deposit') {
          // The payment_intent.succeeded event will handle the actual crediting
          logStep('Bank transfer checkout completed, payment_intent.succeeded will process');
        }
        break;
      }

      default:
        logStep('Unhandled event type', { type: event.type });
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    logStep('ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
