import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Withdrawal fee (flat $0.10 platform fee)
const WITHDRAWAL_FEE = 0.10;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-WITHDRAWAL] ${step}${detailsStr}`);
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
    logStep('User authenticated', { userId: user.id });

    const { 
      amount,
      withdrawal_method, // 'bank' | 'crypto'
      venue_id,          // If venue withdrawal
      bank_details,      // { account_last4, bank_name, routing_number, account_number }
      crypto_address     // For crypto withdrawals
    } = await req.json();

    if (!amount || amount <= WITHDRAWAL_FEE) {
      throw new Error(`Minimum withdrawal is $${(WITHDRAWAL_FEE + 0.01).toFixed(2)}`);
    }

    const isVenueWithdrawal = !!venue_id;
    const totalWithdrawal = amount;
    const netPayout = amount - WITHDRAWAL_FEE;

    logStep('Processing INSTANT withdrawal', { amount, fee: WITHDRAWAL_FEE, netPayout, isVenue: isVenueWithdrawal });

    // 1. Verify wallet and balance
    let wallet: any;
    let walletType: 'user' | 'venue';

    if (isVenueWithdrawal) {
      // Verify user owns this venue
      const { data: venue, error: venueError } = await supabaseAdmin
        .from('venues')
        .select('owner_user_id')
        .eq('id', venue_id)
        .single();

      if (venueError || venue?.owner_user_id !== user.id) {
        throw new Error('Not authorized to withdraw from this venue');
      }

      const { data: venueWallet, error: walletError } = await supabaseAdmin
        .from('venue_wallets')
        .select('*')
        .eq('venue_id', venue_id)
        .single();

      if (walletError || !venueWallet) {
        throw new Error('Venue wallet not found');
      }

      if (venueWallet.is_frozen) {
        throw new Error('Venue wallet is frozen. Contact support.');
      }

      if (venueWallet.balance_jvc < totalWithdrawal) {
        throw new Error(`Insufficient balance. Available: ${venueWallet.balance_jvc.toFixed(2)} JVC`);
      }

      wallet = venueWallet;
      walletType = 'venue';
      logStep('Venue wallet verified', { balance: wallet.balance_jvc });
    } else {
      const { data: userWallet, error: walletError } = await supabaseAdmin
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError || !userWallet) {
        throw new Error('Wallet not found');
      }

      if (userWallet.is_frozen) {
        throw new Error('Your wallet is frozen. Contact support.');
      }

      if (userWallet.balance_jv_token < totalWithdrawal) {
        throw new Error(`Insufficient balance. Available: ${userWallet.balance_jv_token.toFixed(2)} JVC`);
      }

      wallet = userWallet;
      walletType = 'user';
      logStep('User wallet verified', { balance: wallet.balance_jv_token });
    }

    const balanceBefore = walletType === 'venue' ? wallet.balance_jvc : wallet.balance_jv_token;
    const balanceAfter = balanceBefore - totalWithdrawal;

    // 2. IMMEDIATELY debit the wallet (no pending state - instant processing)
    if (walletType === 'venue') {
      await supabaseAdmin
        .from('venue_wallets')
        .update({ 
          balance_jvc: balanceAfter,
          updated_at: new Date().toISOString()
        })
        .eq('venue_id', venue_id);
    } else {
      await supabaseAdmin
        .from('user_wallets')
        .update({ 
          balance_jv_token: balanceAfter,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    }

    logStep('Wallet debited immediately', { balanceBefore, balanceAfter });

    // 3. Create withdrawal record (completed status - instant approval)
    const { data: withdrawalRecord, error: recordError } = await supabaseAdmin
      .from('withdrawal_records')
      .insert({
        user_id: isVenueWithdrawal ? null : user.id,
        venue_id: isVenueWithdrawal ? venue_id : null,
        amount_jvc: totalWithdrawal,
        amount_usd: totalWithdrawal, // 1:1 peg
        amount_local: totalWithdrawal,
        fee_amount: WITHDRAWAL_FEE,
        net_payout: netPayout,
        withdrawal_method: withdrawal_method,
        status: 'completed', // Instant - no approval needed
        bank_account_last4: bank_details?.account_last4,
        bank_name: bank_details?.bank_name,
        crypto_to_address: crypto_address,
        metadata: { requested_by: user.id, instant_approval: true },
        approved_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (recordError) {
      // Rollback wallet debit on failure
      if (walletType === 'venue') {
        await supabaseAdmin.from('venue_wallets').update({ balance_jvc: balanceBefore }).eq('venue_id', venue_id);
      } else {
        await supabaseAdmin.from('user_wallets').update({ balance_jv_token: balanceBefore }).eq('user_id', user.id);
      }
      throw new Error('Failed to create withdrawal request');
    }

    logStep('Withdrawal record created (instant)', { withdrawalId: withdrawalRecord.id });

    // 4. BURN the JVC (remove from circulation)
    const { data: treasury } = await supabaseAdmin
      .from('platform_treasury')
      .select('*')
      .limit(1)
      .single();

    const newTotalSupply = (treasury?.total_jvc_supply || 0) - totalWithdrawal;
    const newUsdBacking = (treasury?.total_usd_backing || 0) - totalWithdrawal;
    const newCollectedFees = (treasury?.collected_fees || 0) + WITHDRAWAL_FEE;

    await supabaseAdmin
      .from('platform_treasury')
      .upsert({
        id: treasury?.id || undefined,
        total_jvc_supply: Math.max(0, newTotalSupply),
        total_usd_backing: Math.max(0, newUsdBacking),
        collected_fees: newCollectedFees,
        updated_at: new Date().toISOString()
      });

    logStep('JVC burned from supply', { burned: totalWithdrawal, newSupply: newTotalSupply });

    // 5. Create mint/burn audit record
    await supabaseAdmin.from('mint_burn_audit').insert({
      operation_type: 'burn',
      amount_jvc: totalWithdrawal,
      amount_usd: totalWithdrawal,
      wallet_id: isVenueWithdrawal ? venue_id : user.id,
      wallet_type: walletType,
      triggered_by: 'withdrawal',
      withdrawal_id: withdrawalRecord.id,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      total_supply_before: treasury?.total_jvc_supply || 0,
      total_supply_after: newTotalSupply
    });

    // 6. Create ledger entries
    await supabaseAdmin.from('ledger_entries').insert([
      {
        transaction_id: withdrawalRecord.id,
        wallet_id: isVenueWithdrawal ? venue_id : user.id,
        wallet_type: walletType,
        entry_type: 'debit',
        amount: totalWithdrawal,
        balance_before: balanceBefore,
        balance_after: balanceAfter
      },
      {
        transaction_id: withdrawalRecord.id,
        wallet_id: 'platform_treasury',
        wallet_type: 'treasury',
        entry_type: 'credit',
        amount: WITHDRAWAL_FEE,
        balance_before: treasury?.collected_fees || 0,
        balance_after: newCollectedFees
      }
    ]);

    // 7. Create transaction record (completed)
    await supabaseAdmin.from('transactions').insert({
      from_wallet_id: isVenueWithdrawal ? venue_id : user.id,
      from_wallet_type: walletType,
      amount_jvc: totalWithdrawal,
      amount_usd: totalWithdrawal,
      fee_amount: WITHDRAWAL_FEE,
      fee_collected: true,
      transaction_type: 'withdrawal',
      status: 'completed',
      description: `Instant withdrawal of ${netPayout.toFixed(2)} USD (fee: $${WITHDRAWAL_FEE})`,
      reference_id: withdrawalRecord.id,
      reference_type: 'withdrawal',
      created_by: user.id,
      completed_at: new Date().toISOString()
    });

    logStep('Withdrawal completed successfully', { withdrawalId: withdrawalRecord.id });

    return new Response(
      JSON.stringify({
        success: true,
        withdrawal_id: withdrawalRecord.id,
        amount: totalWithdrawal,
        fee: WITHDRAWAL_FEE,
        net_payout: netPayout,
        status: 'completed',
        message: `Withdrawal of ${netPayout.toFixed(2)} USD processed successfully!`,
        estimated_time: withdrawal_method === 'crypto' ? '1-2 hours' : '1-3 business days'
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
