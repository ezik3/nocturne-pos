import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { payment_type, amount, currency = 'usd' } = await req.json();

    if (!payment_type || !amount || amount <= 0) {
      throw new Error('Invalid payment details');
    }

    let jv_tokens = 0;
    let transaction_id = '';

    if (payment_type === 'fiat') {
      // Stripe integration for fiat deposits
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2023-10-16',
      });

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        metadata: {
          user_id: user.id,
          type: 'jv_token_purchase',
        },
      });

      transaction_id = paymentIntent.id;
      
      // Conversion: 1 USD = 10 JV Tokens
      jv_tokens = amount * 10;

      console.log(`Fiat payment created: ${transaction_id}, amount: ${amount}, tokens: ${jv_tokens}`);

    } else if (payment_type === 'crypto') {
      // TODO: Implement XRP Ledger integration for crypto deposits
      // This is a placeholder for future XRPL integration
      // 
      // Steps to implement:
      // 1. Accept crypto wallet address and transaction signature
      // 2. Verify transaction on XRP Ledger
      // 3. Calculate conversion rate to JV Tokens
      // 4. Update user wallet
      //
      // For now, we'll simulate crypto exchange
      transaction_id = `crypto_${Date.now()}_${user.id}`;
      jv_tokens = amount * 10; // Placeholder conversion rate
      
      console.log(`Crypto payment placeholder: ${transaction_id}, tokens: ${jv_tokens}`);
    }

    // Create transaction record
    const { data: wallet, error: walletError } = await supabaseClient
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError && walletError.code !== 'PGRST116') {
      throw walletError;
    }

    // Update or create wallet
    const newBalance = {
      user_id: user.id,
      balance_jv_token: (wallet?.balance_jv_token || 0) + jv_tokens,
      balance_usd: payment_type === 'fiat' ? (wallet?.balance_usd || 0) + amount : wallet?.balance_usd || 0,
    };

    const { error: upsertError } = await supabaseClient
      .from('user_wallets')
      .upsert(newBalance);

    if (upsertError) {
      throw upsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id,
        jv_tokens,
        new_balance: newBalance.balance_jv_token,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});