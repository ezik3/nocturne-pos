import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface WalletBalance {
  jvc: number;
  usd: number;
  rewards: number;
  xrpAddress?: string;
}

interface DepositResult {
  success: boolean;
  transaction_id?: string;
  jv_tokens?: number;
  payment_url?: string;
  client_secret?: string;
  instructions?: {
    payid?: string;
    address?: string;
    reference?: string;
    message?: string;
  };
  error?: string;
}

export const useJVCoinWallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WalletBalance>({ jvc: 0, usd: 0, rewards: 0 });
  const [loading, setLoading] = useState(true);
  const [xrpAddress, setXrpAddress] = useState<string | null>(null);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!user) {
      setBalance({ jvc: 0, usd: 0, rewards: 0 });
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
          rewards: data.reward_points || 0
        });
      }
    } catch (error) {
      console.error('Wallet fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize or get XRP wallet
  const initializeXRPWallet = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    try {
      // Check if user already has an XRP address stored
      const storedAddress = localStorage.getItem(`jv_xrp_address_${user.id}`);
      if (storedAddress) {
        setXrpAddress(storedAddress);
        return storedAddress;
      }

      // Generate new wallet via XRP service
      const { data, error } = await supabase.functions.invoke('xrp-service', {
        body: { action: 'generate_wallet' }
      });

      if (error) throw error;

      if (data?.success && data?.wallet?.address) {
        const address = data.wallet.address;
        localStorage.setItem(`jv_xrp_address_${user.id}`, address);
        setXrpAddress(address);
        
        // Setup trustline for JVC
        await supabase.functions.invoke('xrp-service', {
          body: { 
            action: 'setup_trustline', 
            userAddress: address,
            limit: 1000000
          }
        });

        return address;
      }

      return null;
    } catch (error) {
      console.error('XRP wallet initialization error:', error);
      return null;
    }
  }, [user]);

  // Deposit with card
  const depositWithCard = async (amount: number, paymentMethodId?: string): Promise<DepositResult> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('bank-deposit', {
        body: {
          deposit_type: 'card',
          amount,
          currency: 'usd',
          payment_method_id: paymentMethodId
        }
      });

      if (error) throw error;

      if (data?.success && data?.status === 'completed') {
        await fetchBalance();
        toast({
          title: 'Deposit Successful!',
          description: `${data.jv_tokens} JVC has been added to your wallet`,
        });
      }

      return data;
    } catch (error) {
      console.error('Card deposit error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Deposit failed' };
    }
  };

  // Deposit with bank transfer
  const depositWithBankTransfer = async (amount: number): Promise<DepositResult> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('bank-deposit', {
        body: {
          deposit_type: 'bank_transfer',
          amount,
          currency: 'usd',
          return_url: window.location.origin + '/app/wallet'
        }
      });

      if (error) throw error;

      // Redirect to Stripe checkout for bank transfer
      if (data?.payment_url) {
        window.open(data.payment_url, '_blank');
      }

      return data;
    } catch (error) {
      console.error('Bank transfer error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Bank transfer failed' };
    }
  };

  // Deposit with PayID
  const depositWithPayID = async (amount: number): Promise<DepositResult> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('bank-deposit', {
        body: {
          deposit_type: 'payid',
          amount
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('PayID deposit error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'PayID deposit failed' };
    }
  };

  // Deposit with crypto
  const depositWithCrypto = async (amount: number): Promise<DepositResult> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Initialize XRP wallet if not exists
      await initializeXRPWallet();

      const { data, error } = await supabase.functions.invoke('bank-deposit', {
        body: {
          deposit_type: 'crypto',
          amount
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
  const transferJVC = async (recipientAddress: string, amount: number): Promise<boolean> => {
    if (!user || !xrpAddress) {
      toast({ title: 'Error', description: 'Wallet not initialized', variant: 'destructive' });
      return false;
    }

    if (amount > balance.jvc) {
      toast({ title: 'Insufficient Balance', description: 'You don\'t have enough JVC', variant: 'destructive' });
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('xrp-service', {
        body: {
          action: 'transfer_jvc',
          senderAddress: xrpAddress,
          receiverAddress: recipientAddress,
          amount
        }
      });

      if (error) throw error;

      if (data?.success) {
        // Update local balance
        const { error: updateError } = await supabase
          .from('user_wallets')
          .update({ 
            balance_jv_token: balance.jvc - amount 
          })
          .eq('user_id', user.id);

        if (!updateError) {
          await fetchBalance();
          toast({
            title: 'Transfer Successful!',
            description: `${amount} JVC sent to ${recipientAddress.slice(0, 8)}...`,
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Transfer error:', error);
      toast({ title: 'Transfer Failed', description: 'Please try again', variant: 'destructive' });
      return false;
    }
  };

  // Verify balance before transaction
  const verifyBalance = async (requiredAmount: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('xrp-service', {
        body: {
          action: 'verify_balance',
          requiredAmount
        }
      });

      if (error) throw error;
      return data?.verified || false;
    } catch (error) {
      console.error('Balance verification error:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (user) {
      // Check for stored XRP address
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
    initializeXRPWallet,
    depositWithCard,
    depositWithBankTransfer,
    depositWithPayID,
    depositWithCrypto,
    transferJVC,
    verifyBalance
  };
};
