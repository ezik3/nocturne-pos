import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Withdrawal fee: flat $1.00 (changed from $0.10)
const WITHDRAWAL_FEE = 1.00;

// Minimum venue withdrawal
const MIN_VENUE_WITHDRAWAL = 20.00;

// Eligibility: 7 days in milliseconds
const ELIGIBILITY_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

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

    logStep('Processing withdrawal REQUEST', { amount, fee: WITHDRAWAL_FEE, netPayout, isVenue: isVenueWithdrawal });

    // 1. Verify wallet and balance + eligibility
    let wallet: any;
    let walletType: 'user' | 'venue';
    let availableBalance: number;

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

      // Available balance = total - locked
      availableBalance = (venueWallet.balance_jvc || 0) - (venueWallet.locked_balance || 0);

      // VENUE ELIGIBILITY: Minimum balance check
      if (venueWallet.balance_jvc < MIN_VENUE_WITHDRAWAL) {
        throw new Error(`Minimum venue withdrawal is $${MIN_VENUE_WITHDRAWAL}. Current balance: $${venueWallet.balance_jvc.toFixed(2)}`);
      }

      if (availableBalance < totalWithdrawal) {
        throw new Error(`Insufficient available balance. Available: ${availableBalance.toFixed(2)} JVC (${venueWallet.locked_balance?.toFixed(2) || 0} JVC locked)`);
      }

      wallet = venueWallet;
      walletType = 'venue';
      logStep('Venue wallet verified', { balance: wallet.balance_jvc, locked: wallet.locked_balance, available: availableBalance });
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

      // Available balance = total - locked
      availableBalance = (userWallet.balance_jv_token || 0) - (userWallet.locked_balance || 0);

      // USER ELIGIBILITY CHECK
      const now = Date.now();
      const firstDepositAt = userWallet.first_deposit_at ? new Date(userWallet.first_deposit_at).getTime() : null;
      const lastDepositAt = userWallet.last_deposit_at ? new Date(userWallet.last_deposit_at).getTime() : null;
      const lastSpendAt = userWallet.last_spend_at ? new Date(userWallet.last_spend_at).getTime() : null;

      // Rule: first deposit >= 7 days ago OR last spend > last deposit
      const sevenDaysEligible = firstDepositAt && (now - firstDepositAt >= ELIGIBILITY_DAYS_MS);
      const spendEligible = lastSpendAt && lastDepositAt && (lastSpendAt > lastDepositAt);

      if (!sevenDaysEligible && !spendEligible) {
        const daysRemaining = firstDepositAt 
          ? Math.ceil((ELIGIBILITY_DAYS_MS - (now - firstDepositAt)) / (24 * 60 * 60 * 1000))
          : 7;
        
        throw new Error(
          `Withdrawals not available yet. Either wait ${daysRemaining} more day(s) from your first deposit, or make a purchase at a venue to unlock withdrawals immediately.`
        );
      }

      if (availableBalance < totalWithdrawal) {
        throw new Error(`Insufficient available balance. Available: ${availableBalance.toFixed(2)} JVC (${userWallet.locked_balance?.toFixed(2) || 0} JVC locked)`);
      }

      wallet = userWallet;
      walletType = 'user';
      logStep('User wallet verified and eligible', { 
        balance: wallet.balance_jv_token, 
        locked: wallet.locked_balance, 
        available: availableBalance,
        sevenDaysEligible,
        spendEligible 
      });
    }

    // 2. LOCK the funds (don't debit yet - withdrawal is just a request)
    const newLockedBalance = (wallet.locked_balance || 0) + totalWithdrawal;

    if (walletType === 'venue') {
      await supabaseAdmin
        .from('venue_wallets')
        .update({ 
          locked_balance: newLockedBalance,
          updated_at: new Date().toISOString()
        })
        .eq('venue_id', venue_id);
    } else {
      await supabaseAdmin
        .from('user_wallets')
        .update({ 
          locked_balance: newLockedBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    }

    logStep('Funds locked for withdrawal', { previousLocked: wallet.locked_balance || 0, newLockedBalance });

    // 3. Create withdrawal record with PENDING status (NOT completed)
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
        status: 'pending', // REQUEST-BASED: starts as pending
        bank_account_last4: bank_details?.account_last4,
        bank_name: bank_details?.bank_name,
        crypto_to_address: crypto_address,
        metadata: { requested_by: user.id }
        // No approved_at or completed_at - these are set later
      })
      .select()
      .single();

    if (recordError) {
      // Rollback locked balance on failure
      if (walletType === 'venue') {
        await supabaseAdmin.from('venue_wallets').update({ locked_balance: wallet.locked_balance || 0 }).eq('venue_id', venue_id);
      } else {
        await supabaseAdmin.from('user_wallets').update({ locked_balance: wallet.locked_balance || 0 }).eq('user_id', user.id);
      }
      throw new Error('Failed to create withdrawal request');
    }

    logStep('Withdrawal request created (PENDING)', { withdrawalId: withdrawalRecord.id });

    // 4. Create transaction record (pending - not completed)
    await supabaseAdmin.from('transactions').insert({
      from_wallet_id: isVenueWithdrawal ? venue_id : user.id,
      from_wallet_type: walletType,
      amount_jvc: totalWithdrawal,
      amount_usd: totalWithdrawal,
      fee_amount: WITHDRAWAL_FEE,
      fee_collected: false, // Not collected until paid
      transaction_type: 'withdrawal',
      status: 'pending', // Pending until admin approves
      description: `Withdrawal request of ${netPayout.toFixed(2)} USD (fee: $${WITHDRAWAL_FEE}) - Awaiting approval`,
      reference_id: withdrawalRecord.id,
      reference_type: 'withdrawal',
      created_by: user.id
    });

    logStep('Withdrawal request submitted successfully', { withdrawalId: withdrawalRecord.id });

    return new Response(
      JSON.stringify({
        success: true,
        withdrawal_id: withdrawalRecord.id,
        amount: totalWithdrawal,
        fee: WITHDRAWAL_FEE,
        net_payout: netPayout,
        status: 'pending',
        message: `Withdrawal request for ${netPayout.toFixed(2)} USD submitted. You will be notified once it's processed (typically 5-7 business days).`,
        estimated_time: '5-7 business days'
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
