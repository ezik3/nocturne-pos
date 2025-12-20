import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform transaction fee in USD (flat $0.10)
const PLATFORM_FEE = 0.10;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRANSFER-JVC] ${step}${detailsStr}`);
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
    const sender = userData.user;
    logStep('Sender authenticated', { userId: sender.id });

    const { 
      recipient_id,      // For user-to-user transfer
      recipient_venue_id, // For user-to-venue payment
      amount,
      order_id,          // Optional: for venue payments
      description
    } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }
    if (!recipient_id && !recipient_venue_id) {
      throw new Error('Recipient required');
    }

    const totalRequired = amount + PLATFORM_FEE;
    const isVenuePayment = !!recipient_venue_id;

    logStep('Processing transfer', { amount, fee: PLATFORM_FEE, totalRequired, isVenuePayment });

    // 1. Get sender's wallet
    const { data: senderWallet, error: senderError } = await supabaseAdmin
      .from('user_wallets')
      .select('*')
      .eq('user_id', sender.id)
      .single();

    if (senderError || !senderWallet) {
      throw new Error('Sender wallet not found');
    }

    if (senderWallet.is_frozen) {
      throw new Error('Your wallet is frozen. Contact support.');
    }

    if (senderWallet.balance_jv_token < totalRequired) {
      throw new Error(`Insufficient balance. Need ${totalRequired.toFixed(2)} JVC (including $0.10 fee)`);
    }

    logStep('Sender wallet verified', { balance: senderWallet.balance_jv_token });

    // 2. Get recipient wallet
    let recipientWallet: any;
    let recipientType: 'user' | 'venue';

    if (isVenuePayment) {
      const { data: venueWallet, error: venueError } = await supabaseAdmin
        .from('venue_wallets')
        .select('*')
        .eq('venue_id', recipient_venue_id)
        .single();

      if (venueError) {
        // Create venue wallet if doesn't exist
        const { data: newWallet, error: createError } = await supabaseAdmin
          .from('venue_wallets')
          .insert({ venue_id: recipient_venue_id, balance_jvc: 0, balance_usd: 0 })
          .select()
          .single();
        
        if (createError) throw new Error('Failed to create venue wallet');
        recipientWallet = newWallet;
      } else {
        recipientWallet = venueWallet;
      }

      if (recipientWallet.is_frozen) {
        throw new Error('Venue wallet is frozen. Payment cannot be processed.');
      }
      recipientType = 'venue';
      logStep('Venue wallet verified', { venueId: recipient_venue_id, balance: recipientWallet.balance_jvc });
    } else {
      const { data: userWallet, error: userWalletError } = await supabaseAdmin
        .from('user_wallets')
        .select('*')
        .eq('user_id', recipient_id)
        .single();

      if (userWalletError || !userWallet) {
        throw new Error('Recipient wallet not found');
      }

      if (userWallet.is_frozen) {
        throw new Error('Recipient wallet is frozen');
      }
      recipientWallet = userWallet;
      recipientType = 'user';
      logStep('Recipient wallet verified', { recipientId: recipient_id, balance: recipientWallet.balance_jv_token });
    }

    // 3. Calculate balances
    const senderBalanceBefore = senderWallet.balance_jv_token;
    const senderBalanceAfter = senderBalanceBefore - totalRequired;
    
    const recipientBalanceBefore = recipientType === 'venue' 
      ? recipientWallet.balance_jvc 
      : recipientWallet.balance_jv_token;
    const recipientBalanceAfter = recipientBalanceBefore + amount;

    // 4. Begin transaction - Update sender wallet
    const { error: senderUpdateError } = await supabaseAdmin
      .from('user_wallets')
      .update({ 
        balance_jv_token: senderBalanceAfter,
        balance_usd: senderWallet.balance_usd - totalRequired,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', sender.id);

    if (senderUpdateError) {
      throw new Error('Failed to debit sender wallet');
    }
    logStep('Sender wallet debited', { before: senderBalanceBefore, after: senderBalanceAfter });

    // 5. Update recipient wallet
    if (recipientType === 'venue') {
      const { error: recipientUpdateError } = await supabaseAdmin
        .from('venue_wallets')
        .update({ 
          balance_jvc: recipientBalanceAfter,
          balance_usd: recipientWallet.balance_usd + amount,
          updated_at: new Date().toISOString()
        })
        .eq('venue_id', recipient_venue_id);

      if (recipientUpdateError) {
        // Rollback sender
        await supabaseAdmin
          .from('user_wallets')
          .update({ balance_jv_token: senderBalanceBefore, balance_usd: senderWallet.balance_usd })
          .eq('user_id', sender.id);
        throw new Error('Failed to credit venue wallet');
      }
    } else {
      const { error: recipientUpdateError } = await supabaseAdmin
        .from('user_wallets')
        .update({ 
          balance_jv_token: recipientBalanceAfter,
          balance_usd: recipientWallet.balance_usd + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', recipient_id);

      if (recipientUpdateError) {
        // Rollback sender
        await supabaseAdmin
          .from('user_wallets')
          .update({ balance_jv_token: senderBalanceBefore, balance_usd: senderWallet.balance_usd })
          .eq('user_id', sender.id);
        throw new Error('Failed to credit recipient wallet');
      }
    }
    logStep('Recipient wallet credited', { before: recipientBalanceBefore, after: recipientBalanceAfter });

    // 6. Update treasury - collect fee
    const { data: treasury } = await supabaseAdmin
      .from('platform_treasury')
      .select('*')
      .limit(1)
      .single();

    await supabaseAdmin
      .from('platform_treasury')
      .upsert({
        id: treasury?.id || undefined,
        collected_fees: (treasury?.collected_fees || 0) + PLATFORM_FEE,
        updated_at: new Date().toISOString()
      });

    logStep('Platform fee collected', { fee: PLATFORM_FEE });

    // 7. Create transaction record
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        from_wallet_id: sender.id,
        from_wallet_type: 'user',
        to_wallet_id: recipientType === 'venue' ? recipient_venue_id : recipient_id,
        to_wallet_type: recipientType,
        amount_jvc: amount,
        amount_usd: amount, // 1:1 peg
        fee_amount: PLATFORM_FEE,
        fee_collected: true,
        transaction_type: isVenuePayment ? 'venue_payment' : 'transfer',
        status: 'completed',
        description: description || (isVenuePayment ? `Payment at venue` : `Transfer to user`),
        reference_id: order_id || null,
        reference_type: order_id ? 'order' : null,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    logStep('Transaction recorded', { transactionId: transaction?.id });

    // 8. Create ledger entries for both parties
    await supabaseAdmin.from('ledger_entries').insert([
      {
        transaction_id: transaction?.id,
        wallet_id: sender.id,
        wallet_type: 'user',
        entry_type: 'debit',
        amount: totalRequired,
        balance_before: senderBalanceBefore,
        balance_after: senderBalanceAfter
      },
      {
        transaction_id: transaction?.id,
        wallet_id: recipientType === 'venue' ? recipient_venue_id : recipient_id,
        wallet_type: recipientType,
        entry_type: 'credit',
        amount: amount,
        balance_before: recipientBalanceBefore,
        balance_after: recipientBalanceAfter
      }
    ]);

    // 9. If venue payment with order_id, update order status
    if (order_id) {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', order_id);

      // Also create payment record
      await supabaseAdmin.from('payments').insert({
        order_id: order_id,
        amount: amount,
        payment_method: 'jvc',
        status: 'completed',
        transaction_id: transaction?.id,
        staff_id: sender.id
      });

      logStep('Order marked as paid', { orderId: order_id });
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction?.id,
        amount,
        fee: PLATFORM_FEE,
        total_deducted: totalRequired,
        sender_balance: senderBalanceAfter,
        message: isVenuePayment 
          ? `Payment of ${amount} JVC successful` 
          : `Transfer of ${amount} JVC successful`
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
