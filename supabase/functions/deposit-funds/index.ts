import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Conversion rate: 1 USD = 1 JVC (stablecoin model)
const USD_TO_JVC_RATE = 1;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DEPOSIT-FUNDS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('Not authenticated');
    }
    const user = userData.user;
    logStep('User authenticated', { userId: user.id, email: user.email });

    const { 
      deposit_type, // 'card' | 'bank_transfer' | 'payid' | 'crypto'
      amount, 
      currency = 'usd',
      payment_method_id,
      return_url
    } = await req.json();

    if (!deposit_type || !amount || amount <= 0) {
      throw new Error('Invalid deposit details');
    }

    logStep('Processing deposit', { deposit_type, amount, currency });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    let transaction_id = '';
    let status = 'pending';
    let jvc_amount = amount * USD_TO_JVC_RATE;
    let client_secret = null;
    let payment_url = null;
    let stripe_fee = 0;

    // Check if Stripe customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep('Found existing Stripe customer', { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      logStep('Created new Stripe customer', { customerId });
    }

    switch (deposit_type) {
      case 'card': {
        // Card payment - Stripe charges ~2.9% + $0.30
        stripe_fee = (amount * 0.029) + 0.30;
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: currency,
          customer: customerId,
          payment_method: payment_method_id,
          confirm: payment_method_id ? true : false,
          automatic_payment_methods: payment_method_id ? undefined : { enabled: true },
          metadata: {
            user_id: user.id,
            type: 'jvc_deposit',
            deposit_type: 'card',
            jvc_amount: jvc_amount.toString()
          },
        });

        transaction_id = paymentIntent.id;
        client_secret = paymentIntent.client_secret;
        
        if (paymentIntent.status === 'succeeded') {
          status = 'completed';
          logStep('Card payment succeeded immediately', { paymentIntentId: paymentIntent.id });
        } else {
          status = 'pending';
          logStep('Card payment pending', { paymentIntentId: paymentIntent.id, status: paymentIntent.status });
        }
        break;
      }

      case 'bank_transfer': {
        // Bank transfer via Stripe Checkout - no additional Stripe fees for ACH
        stripe_fee = 0;
        
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['us_bank_account', 'card'],
          line_items: [{
            price_data: {
              currency: currency,
              product_data: {
                name: 'JV Coin Deposit',
                description: `${jvc_amount} JVC tokens`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: return_url ? `${return_url}?success=true&session_id={CHECKOUT_SESSION_ID}` : `${req.headers.get('origin')}/app/wallet?success=true`,
          cancel_url: return_url ? `${return_url}?canceled=true` : `${req.headers.get('origin')}/app/wallet?canceled=true`,
          metadata: {
            user_id: user.id,
            type: 'jvc_deposit',
            deposit_type: 'bank_transfer',
            jvc_amount: jvc_amount.toString()
          },
        });

        transaction_id = session.id;
        payment_url = session.url;
        status = 'pending';
        logStep('Bank transfer checkout session created', { sessionId: session.id });
        break;
      }

      case 'payid': {
        // PayID - Australian instant transfer
        stripe_fee = 0;
        const reference = `JV${user.id.slice(-6).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
        transaction_id = `payid_${reference}`;
        status = 'awaiting_transfer';
        
        // Create pending deposit record
        await supabaseAdmin.from('deposit_records').insert({
          user_id: user.id,
          amount_local: amount,
          amount_usd: amount,
          amount_jvc: jvc_amount,
          deposit_method: 'payid',
          status: 'awaiting_transfer',
          local_currency: 'AUD',
          metadata: { reference }
        });

        logStep('PayID deposit created', { reference });
        
        return new Response(JSON.stringify({
          success: true,
          deposit_type: 'payid',
          transaction_id,
          status,
          instructions: {
            payid: 'joinvibe@payid.com.au',
            amount: amount,
            reference: reference,
            message: `Transfer $${amount} AUD to the PayID above with reference: ${reference}. Your JVC will be credited within 1-2 business days after verification.`
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case 'crypto': {
        // Crypto deposit - XRP
        stripe_fee = 0;
        const depositAddress = `r${user.id.replace(/-/g, '').slice(0, 20)}DEPOSIT`;
        transaction_id = `crypto_${Date.now()}_${user.id.slice(-8)}`;
        status = 'awaiting_deposit';

        // Create pending deposit record
        await supabaseAdmin.from('deposit_records').insert({
          user_id: user.id,
          amount_local: amount,
          amount_usd: amount,
          amount_jvc: jvc_amount,
          deposit_method: 'crypto',
          status: 'awaiting_deposit',
          metadata: { depositAddress, currency: 'XRP' }
        });

        logStep('Crypto deposit created', { depositAddress });
        
        return new Response(JSON.stringify({
          success: true,
          deposit_type: 'crypto',
          transaction_id,
          status,
          instructions: {
            address: depositAddress,
            currency: 'XRP',
            amount: amount,
            rate: '1 XRP ≈ 1 JVC (market rate)',
            message: `Send ${amount} XRP to the address above. Your JVC will be credited automatically after 3 confirmations.`
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      default:
        throw new Error(`Unsupported deposit type: ${deposit_type}`);
    }

    // Create deposit record for card/bank payments
    const depositRecord = {
      user_id: user.id,
      amount_local: amount,
      amount_usd: amount,
      amount_jvc: jvc_amount,
      deposit_method: deposit_type,
      status: status,
      local_currency: currency.toUpperCase(),
      stripe_payment_intent_id: deposit_type === 'card' ? transaction_id : null,
      stripe_fee: stripe_fee,
      net_amount: amount - stripe_fee,
      metadata: { stripe_customer_id: customerId }
    };

    const { data: depositData, error: depositError } = await supabaseAdmin
      .from('deposit_records')
      .insert(depositRecord)
      .select()
      .single();

    if (depositError) {
      logStep('Error creating deposit record', { error: depositError });
    } else {
      logStep('Deposit record created', { depositId: depositData?.id });
    }

    // If payment completed immediately (card with payment_method_id), process the deposit
    if (status === 'completed') {
      await processCompletedDeposit(supabaseAdmin, user.id, jvc_amount, amount, depositData?.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id,
        deposit_type,
        status,
        amount,
        jvc_amount: status === 'completed' ? jvc_amount : 0,
        client_secret,
        payment_url,
        message: status === 'completed' 
          ? `Successfully deposited ${jvc_amount} JVC` 
          : 'Deposit initiated, complete payment to receive JVC'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    logStep('ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Helper function to process completed deposits - mints JVC and updates treasury
async function processCompletedDeposit(
  supabase: any,
  userId: string,
  jvcAmount: number,
  usdAmount: number,
  depositId?: string
) {
  logStep('Processing completed deposit', { userId, jvcAmount, usdAmount });

  // 1. Get or create user wallet
  const { data: wallet, error: walletError } = await supabase
    .from('user_wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  const balanceBefore = wallet?.balance_jv_token || 0;
  const newBalance = balanceBefore + jvcAmount;

  // 2. Update user wallet
  const { error: upsertError } = await supabase
    .from('user_wallets')
    .upsert({
      user_id: userId,
      balance_jv_token: newBalance,
      balance_usd: (wallet?.balance_usd || 0) + usdAmount,
    }, { onConflict: 'user_id' });

  if (upsertError) {
    logStep('Error updating wallet', { error: upsertError });
    throw upsertError;
  }
  logStep('Wallet updated', { balanceBefore, newBalance });

  // 3. Get current treasury state
  const { data: treasury } = await supabase
    .from('platform_treasury')
    .select('*')
    .limit(1)
    .single();

  const supplyBefore = treasury?.total_jvc_supply || 0;
  const newSupply = supplyBefore + jvcAmount;

  // 4. Update treasury - MINT JVC
  await supabase
    .from('platform_treasury')
    .upsert({
      id: treasury?.id || undefined,
      total_jvc_supply: newSupply,
      total_usd_backing: (treasury?.total_usd_backing || 0) + usdAmount,
      stripe_balance: (treasury?.stripe_balance || 0) + usdAmount,
      updated_at: new Date().toISOString()
    });

  logStep('Treasury updated - JVC minted', { supplyBefore, newSupply, usdBacking: usdAmount });

  // 5. Create mint audit record
  await supabase.from('mint_burn_audit').insert({
    wallet_id: userId,
    wallet_type: 'user',
    operation_type: 'mint',
    amount_jvc: jvcAmount,
    amount_usd: usdAmount,
    balance_before: balanceBefore,
    balance_after: newBalance,
    total_supply_before: supplyBefore,
    total_supply_after: newSupply,
    triggered_by: 'deposit',
    deposit_id: depositId
  });

  // 6. Create transaction record
  await supabase.from('transactions').insert({
    to_wallet_id: userId,
    to_wallet_type: 'user',
    amount_jvc: jvcAmount,
    amount_usd: usdAmount,
    transaction_type: 'deposit',
    status: 'completed',
    description: `Deposited ${jvcAmount} JVC`,
    completed_at: new Date().toISOString()
  });

  // 7. Create ledger entry
  await supabase.from('ledger_entries').insert({
    wallet_id: userId,
    wallet_type: 'user',
    transaction_id: depositId || crypto.randomUUID(),
    entry_type: 'credit',
    amount: jvcAmount,
    balance_before: balanceBefore,
    balance_after: newBalance
  });

  // 8. Update deposit record to completed
  if (depositId) {
    await supabase
      .from('deposit_records')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', depositId);
  }

  logStep('Deposit fully processed');
}
