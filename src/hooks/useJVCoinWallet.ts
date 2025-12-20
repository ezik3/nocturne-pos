import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Transaction fee in USD (flat $0.10 per transaction)
export const TRANSACTION_FEE_USD = 0.10;

interface WalletBalance {
  jvc: number;
  usd: number;
  rewards: number;
  pending: number;
  isFrozen: boolean;
}

interface DepositResult {
  success: boolean;
  transaction_id?: string;
  jvc_amount?: number;
  payment_url?: string;
  client_secret?: string;
  status?: string;
  instructions?: {
    payid?: string;
    address?: string;
    reference?: string;
    message?: string;
  };
  error?: string;
}

interface TransferResult {
  success: boolean;
  transaction_id?: string;
  amount?: number;
  fee?: number;
  total_deducted?: number;
  sender_balance?: number;
  error?: string;
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

export const useJVCoinWallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WalletBalance>({ 
    jvc: 0, 
    usd: 0, 
    rewards: 0, 
    pending: 0,
    isFrozen: false 
  });
  const [loading, setLoading] = useState(true);
  const [xrpAddress, setXrpAddress] = useState<string | null>(null);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!user) {
      setBalance({ jvc: 0, usd: 0, rewards: 0, pending: 0, isFrozen: false });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching wallet:', error);
      }

      if (data) {
        setBalance({
          jvc: data.balance_jv_token || 0,
          usd: data.balance_usd || 0,
          rewards: data.reward_points || 0,
          pending: data.pending_balance || 0,
          isFrozen: data.is_frozen || false
        });
      }
    } catch (error) {
      console.error('Wallet fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize wallet if doesn't exist
  const initializeWallet = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: existing } = await supabase
        .from('user_wallets')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase
          .from('user_wallets')
          .insert({
            user_id: user.id,
            balance_jv_token: 0,
            balance_usd: 0,
            reward_points: 0
          });

        if (error) {
          console.error('Wallet creation error:', error);
          return false;
        }
      }

      // Generate XRP address locally for display
      const address = `r${user.id.replace(/-/g, '').slice(0, 24)}`;
      localStorage.setItem(`jv_xrp_address_${user.id}`, address);
      setXrpAddress(address);
      
      await fetchBalance();
      return true;
    } catch (error) {
      console.error('Wallet initialization error:', error);
      return false;
    }
  }, [user, fetchBalance]);

  // Initialize or get XRP wallet (legacy support)
  const initializeXRPWallet = initializeWallet;

  // Deposit with card (Stripe)
  const depositWithCard = async (amountUsd: number, paymentMethodId?: string): Promise<DepositResult> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('deposit-funds', {
        body: {
          deposit_type: 'card',
          amount: amountUsd,
          currency: 'usd',
          payment_method_id: paymentMethodId
        }
      });

      if (error) throw error;

      if (data?.success && data?.status === 'completed') {
        await fetchBalance();
        toast({
          title: 'Deposit Successful!',
          description: `${data.jvc_amount} JVC has been added to your wallet`,
        });
      }

      return data;
    } catch (error) {
      console.error('Card deposit error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Deposit failed' };
    }
  };

  // Deposit with bank transfer (ACH/BECS - NO FEES)
  const depositWithBankTransfer = async (amountUsd: number): Promise<DepositResult> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('deposit-funds', {
        body: {
          deposit_type: 'bank_transfer',
          amount: amountUsd,
          currency: 'usd',
          return_url: window.location.origin + '/app/wallet'
        }
      });

      if (error) throw error;

      if (data?.payment_url) {
        window.open(data.payment_url, '_blank');
      }

      return data;
    } catch (error) {
      console.error('Bank transfer error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Bank transfer failed' };
    }
  };

  // Deposit with PayID (Australian instant transfer - NO FEES)
  const depositWithPayID = async (amountUsd: number): Promise<DepositResult> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('deposit-funds', {
        body: {
          deposit_type: 'payid',
          amount: amountUsd
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('PayID deposit error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'PayID deposit failed' };
    }
  };

  // Deposit with crypto (XRP)
  const depositWithCrypto = async (amountUsd: number): Promise<DepositResult> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('deposit-funds', {
        body: {
          deposit_type: 'crypto',
          amount: amountUsd
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Crypto deposit error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Crypto deposit failed' };
    }
  };

  // Transfer JVC to another user
  const transferJVC = async (recipientId: string, amount: number, description?: string): Promise<TransferResult> => {
    if (!user) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      return { success: false, error: 'Not authenticated' };
    }

    if (balance.isFrozen) {
      toast({ title: 'Wallet Frozen', description: 'Your wallet is frozen. Contact support.', variant: 'destructive' });
      return { success: false, error: 'Wallet frozen' };
    }

    const totalRequired = amount + TRANSACTION_FEE_USD;
    
    if (totalRequired > balance.jvc) {
      toast({ 
        title: 'Insufficient Balance', 
        description: `Need ${totalRequired.toFixed(2)} JVC (${amount} + $0.10 fee)`, 
        variant: 'destructive' 
      });
      return { success: false, error: 'Insufficient balance' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('transfer-jvc', {
        body: {
          recipient_id: recipientId,
          amount: amount,
          description: description
        }
      });

      if (error) throw error;

      if (data?.success) {
        await fetchBalance();
        toast({
          title: 'Transfer Successful!',
          description: `Sent ${amount} JVC (Fee: $0.10)`,
        });
      }

      return data;
    } catch (error) {
      console.error('Transfer error:', error);
      toast({ title: 'Transfer Failed', description: 'Please try again', variant: 'destructive' });
      return { success: false, error: error instanceof Error ? error.message : 'Transfer failed' };
    }
  };

  // Pay at venue (user to venue payment)
  const payVenue = async (venueId: string, amount: number, orderId?: string): Promise<TransferResult> => {
    if (!user) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      return { success: false, error: 'Not authenticated' };
    }

    if (balance.isFrozen) {
      toast({ title: 'Wallet Frozen', description: 'Your wallet is frozen. Contact support.', variant: 'destructive' });
      return { success: false, error: 'Wallet frozen' };
    }

    const totalRequired = amount + TRANSACTION_FEE_USD;

    if (totalRequired > balance.jvc) {
      toast({ 
        title: 'Insufficient Balance', 
        description: `Need ${totalRequired.toFixed(2)} JVC. Please deposit more funds.`, 
        variant: 'destructive' 
      });
      return { success: false, error: 'Insufficient balance' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('transfer-jvc', {
        body: {
          recipient_venue_id: venueId,
          amount: amount,
          order_id: orderId,
          description: `Payment at venue`
        }
      });

      if (error) throw error;

      if (data?.success) {
        await fetchBalance();
        toast({
          title: 'Payment Successful!',
          description: `Paid ${amount} JVC + $0.10 fee`,
        });
      }

      return data;
    } catch (error) {
      console.error('Payment error:', error);
      toast({ title: 'Payment Failed', description: 'Please try again', variant: 'destructive' });
      return { success: false, error: error instanceof Error ? error.message : 'Payment failed' };
    }
  };

  // Request withdrawal
  const requestWithdrawal = async (
    amount: number, 
    method: 'bank' | 'crypto',
    bankDetails?: { account_last4: string; bank_name: string },
    cryptoAddress?: string
  ): Promise<WithdrawalResult> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (balance.isFrozen) {
      return { success: false, error: 'Wallet frozen' };
    }

    if (amount > balance.jvc) {
      return { success: false, error: 'Insufficient balance' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          amount,
          withdrawal_method: method,
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
      return { success: false, error: error instanceof Error ? error.message : 'Withdrawal failed' };
    }
  };

  // Verify balance before transaction
  const verifyBalance = async (requiredAmount: number): Promise<boolean> => {
    await fetchBalance();
    return balance.jvc >= (requiredAmount + TRANSACTION_FEE_USD);
  };

  // Legacy processPayment function (now uses payVenue)
  const processPayment = async (venueAddress: string, amount: number, orderId: string): Promise<boolean> => {
    const result = await payVenue(venueAddress, amount, orderId);
    return result.success;
  };

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (user) {
      const storedAddress = localStorage.getItem(`jv_xrp_address_${user.id}`);
      if (storedAddress) {
        setXrpAddress(storedAddress);
      }
    }
  }, [user]);

  return {
    balance,
    loading,
    xrpAddress,
    fetchBalance,
    initializeWallet,
    initializeXRPWallet,
    depositWithCard,
    depositWithBankTransfer,
    depositWithPayID,
    depositWithCrypto,
    transferJVC,
    payVenue,
    requestWithdrawal,
    verifyBalance,
    processPayment,
    TRANSACTION_FEE_USD
  };
};
