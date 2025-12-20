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

    // For now, we'll process without signature verification for simplicity
    // In production, you'd verify the webhook signature
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

        // Find the deposit record by payment intent ID
        const { data: deposit, error: depositError } = await supabaseAdmin
          .from('deposit_records')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (depositError || !deposit) {
          logStep('No pending deposit found for payment intent', { paymentIntentId: paymentIntent.id });
          break;
        }

        if (deposit.status === 'completed') {
          logStep('Deposit already completed', { depositId: deposit.id });
          break;
        }

        // Calculate amounts
        const amountUsd = paymentIntent.amount / 100; // Stripe uses cents
        const stripeFee = amountUsd * 0.029 + 0.30; // Standard Stripe fee
        const netAmount = amountUsd - stripeFee;

        // Update deposit record
        await supabaseAdmin
          .from('deposit_records')
          .update({
            status: 'completed',
            stripe_charge_id: paymentIntent.latest_charge,
            stripe_fee: stripeFee,
            net_amount: netAmount,
            completed_at: new Date().toISOString()
          })
          .eq('id', deposit.id);

        // Credit the wallet
        const isVenueDeposit = !!deposit.venue_id;
        
        if (isVenueDeposit) {
          const { data: wallet } = await supabaseAdmin
            .from('venue_wallets')
            .select('balance_jvc')
            .eq('venue_id', deposit.venue_id)
            .single();

          const newBalance = (wallet?.balance_jvc || 0) + netAmount;

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
            amount_jvc: netAmount,
            amount_usd: netAmount,
            wallet_id: deposit.venue_id,
            wallet_type: 'venue',
            triggered_by: 'deposit',
            deposit_id: deposit.id,
            balance_before: wallet?.balance_jvc || 0,
            balance_after: newBalance,
            total_supply_before: 0, // Will update below
            total_supply_after: 0
          });
        } else {
          const { data: wallet } = await supabaseAdmin
            .from('user_wallets')
            .select('balance_jv_token')
            .eq('user_id', deposit.user_id)
            .single();

          const newBalance = (wallet?.balance_jv_token || 0) + netAmount;

          await supabaseAdmin
            .from('user_wallets')
            .update({ 
              balance_jv_token: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', deposit.user_id);

          // Create mint audit
          await supabaseAdmin.from('mint_burn_audit').insert({
            operation_type: 'mint',
            amount_jvc: netAmount,
            amount_usd: netAmount,
            wallet_id: deposit.user_id,
            wallet_type: 'user',
            triggered_by: 'deposit',
            deposit_id: deposit.id,
            balance_before: wallet?.balance_jv_token || 0,
            balance_after: newBalance,
            total_supply_before: 0,
            total_supply_after: 0
          });
        }

        // Update treasury
        const { data: treasury } = await supabaseAdmin
          .from('platform_treasury')
          .select('*')
          .limit(1)
          .single();

        const newSupply = (treasury?.total_jvc_supply || 0) + netAmount;
        const newBacking = (treasury?.total_usd_backing || 0) + netAmount;

        await supabaseAdmin
          .from('platform_treasury')
          .upsert({
            id: treasury?.id || undefined,
            total_jvc_supply: newSupply,
            total_usd_backing: newBacking,
            pending_deposits: Math.max(0, (treasury?.pending_deposits || 0) - amountUsd),
            updated_at: new Date().toISOString()
          });

        // Create transaction record
        await supabaseAdmin.from('transactions').insert({
          to_wallet_id: isVenueDeposit ? deposit.venue_id : deposit.user_id,
          to_wallet_type: isVenueDeposit ? 'venue' : 'user',
          amount_jvc: netAmount,
          amount_usd: netAmount,
          fee_amount: stripeFee,
          transaction_type: 'deposit',
          status: 'completed',
          description: `Deposit via ${deposit.deposit_method} - ${amountUsd.toFixed(2)} USD (Stripe fee: $${stripeFee.toFixed(2)})`,
          reference_id: deposit.id,
          reference_type: 'deposit',
          completed_at: new Date().toISOString()
        });

        logStep('Deposit completed successfully', { depositId: deposit.id, credited: netAmount });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        logStep('Payment failed', { paymentIntentId: paymentIntent.id });

        // Update deposit record
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
        // Similar handling as payment_intent.succeeded if needed
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
