import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Transaction fee in USD (flat $0.10)
export const TRANSACTION_FEE_USD = 0.10;

interface VenueWalletBalance {
  jvc: number;
  usd: number;
  pending: number;
  isFrozen: boolean;
}

interface WithdrawalResult {
  success: boolean;
  withdrawal_id?: string;
  amount?: number;
  fee?: number;
  net_payout?: number;
  status?: string;
  message?: string;
  error?: string;
}

export const useVenueWallet = (venueId: string | null) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<VenueWalletBalance>({ 
    jvc: 0, 
    usd: 0, 
    pending: 0,
    isFrozen: false 
  });
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Fetch venue wallet balance
  const fetchBalance = useCallback(async () => {
    if (!venueId) {
      setBalance({ jvc: 0, usd: 0, pending: 0, isFrozen: false });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('venue_wallets')
        .select('*')
        .eq('venue_id', venueId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching venue wallet:', error);
      }

      if (data) {
        setBalance({
          jvc: data.balance_jvc || 0,
          usd: data.balance_usd || 0,
          pending: data.pending_balance || 0,
          isFrozen: data.is_frozen || false
        });
      }
    } catch (error) {
      console.error('Venue wallet fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  // Fetch recent transactions
  const fetchTransactions = useCallback(async () => {
    if (!venueId) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`from_wallet_id.eq.${venueId},to_wallet_id.eq.${venueId}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [venueId]);

  // Request withdrawal
  const requestWithdrawal = async (
    amount: number, 
    method: 'bank' | 'crypto',
    bankDetails?: { account_last4: string; bank_name: string },
    cryptoAddress?: string
  ): Promise<WithdrawalResult> => {
    if (!user || !venueId) {
      return { success: false, error: 'Not authenticated' };
    }

    if (balance.isFrozen) {
      toast({ title: 'Wallet Frozen', description: 'Venue wallet is frozen. Contact support.', variant: 'destructive' });
      return { success: false, error: 'Wallet frozen' };
    }

    if (amount > balance.jvc) {
      toast({ title: 'Insufficient Balance', description: `Available: ${balance.jvc.toFixed(2)} JVC`, variant: 'destructive' });
      return { success: false, error: 'Insufficient balance' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          amount,
          withdrawal_method: method,
          venue_id: venueId,
          bank_details: bankDetails,
          crypto_address: cryptoAddress
        }
      });

      if (error) throw error;

      if (data?.success) {
        await fetchBalance();
        toast({
          title: 'Withdrawal Requested',
          description: data.message,
        });
      }

      return data;
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({ title: 'Withdrawal Failed', description: 'Please try again', variant: 'destructive' });
      return { success: false, error: error instanceof Error ? error.message : 'Withdrawal failed' };
    }
  };

  // Get withdrawal history
  const getWithdrawals = useCallback(async () => {
    if (!venueId) return [];

    try {
      const { data, error } = await supabase
        .from('withdrawal_records')
        .select('*')
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      return [];
    }
  }, [venueId]);

  // Get deposit/payment history
  const getPayments = useCallback(async () => {
    if (!venueId) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('to_wallet_id', venueId)
        .eq('to_wallet_type', 'venue')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }, [venueId]);

  return {
    balance,
    loading,
    transactions,
    fetchBalance,
    fetchTransactions,
    requestWithdrawal,
    getWithdrawals,
    getPayments,
    TRANSACTION_FEE_USD
  };
};
