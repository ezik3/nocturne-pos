import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownLeft, ArrowUpRight, ArrowRight, Coins, History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
  id: string;
  transaction_type: string;
  amount_jvc: number;
  amount_usd: number;
  fee_amount: number;
  status: string;
  description: string | null;
  created_at: string;
  from_wallet_type: string | null;
  to_wallet_type: string | null;
}

interface TransactionHistoryProps {
  venueId?: string;
}

export default function TransactionHistory({ venueId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { formatCurrency, jvcToLocal, userCurrency } = useCurrency();

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (venueId) {
        // Venue transactions
        query = query.or(`from_wallet_id.eq.${venueId},to_wallet_id.eq.${venueId}`);
      } else {
        // User transactions
        query = query.or(`from_wallet_id.eq.${user.id},to_wallet_id.eq.${user.id}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, venueId]);

  const getTransactionIcon = (type: string, isIncoming: boolean) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'transfer':
      case 'payment':
        return isIncoming 
          ? <ArrowDownLeft className="h-4 w-4 text-green-500" />
          : <ArrowUpRight className="h-4 w-4 text-orange-500" />;
      default:
        return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isIncomingTransaction = (tx: Transaction) => {
    const walletId = venueId || user?.id;
    return tx.to_wallet_type === (venueId ? 'venue' : 'user') || tx.transaction_type === 'deposit';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchTransactions}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No transactions yet</p>
            <p className="text-xs mt-1">Start by depositing funds to your wallet!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const incoming = isIncomingTransaction(tx);
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      incoming ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {getTransactionIcon(tx.transaction_type, incoming)}
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">
                        {tx.transaction_type}
                        {tx.fee_amount > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (fee: ${tx.fee_amount.toFixed(2)})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.description || formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${incoming ? 'text-green-500' : 'text-red-500'}`}>
                      {incoming ? '+' : '-'}{tx.amount_jvc.toFixed(2)} JVC
                    </p>
                    {userCurrency !== 'USD' && (
                      <p className="text-xs text-muted-foreground">
                        ≈ {formatCurrency(jvcToLocal(tx.amount_jvc))}
                      </p>
                    )}
                    <div className="mt-1">
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
