import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, ArrowUpRight, ArrowDownLeft, History, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Wallet() {
  const [balance, setBalance] = useState({ jv_token: 0, usd: 0, rewards: 0 });
  const [amount, setAmount] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchBalance();
    
    // Load pending offline transactions
    const queue = JSON.parse(localStorage.getItem('offline_transactions') || '[]');
    setPendingTransactions(queue);
    
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const fetchBalance = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("user_wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setBalance({
        jv_token: Number(data.balance_jv_token) || 0,
        usd: Number(data.balance_usd) || 0,
        rewards: data.reward_points || 0
      });
    }

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching balance:", error);
    }
  };

  const handleDeposit = async (type: "fiat" | "crypto") => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (!isOnline) {
      // Queue offline transaction
      const transaction = {
        type: 'deposit',
        payment_type: type,
        amount: parseFloat(amount),
        timestamp: Date.now(),
        status: 'pending'
      };
      queueOfflineTransaction(transaction);
      toast({
        title: "Offline Mode",
        description: "Transaction queued. Will process when online.",
      });
      setAmount("");
      return;
    }

    toast({
      title: "Processing Payment",
      description: `Converting ${amount} ${type === "fiat" ? "USD" : "crypto"} to JV Tokens...`,
    });

    try {
      const { data, error } = await supabase.functions.invoke('deposit-funds', {
        body: {
          payment_type: type,
          amount: parseFloat(amount),
          currency: 'usd'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: `Deposited ${data.jv_tokens} JV Tokens`,
        });
        setAmount("");
        fetchBalance();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // TODO: Implement offline transaction queue
  // This would store transactions locally when offline and sync when back online
  const queueOfflineTransaction = (transaction: any) => {
    const queue = JSON.parse(localStorage.getItem('offline_transactions') || '[]');
    queue.push({ ...transaction, timestamp: Date.now(), status: 'pending' });
    localStorage.setItem('offline_transactions', JSON.stringify(queue));
    setPendingTransactions(queue);
  };

  const syncOfflineTransactions = async () => {
    const queue = JSON.parse(localStorage.getItem('offline_transactions') || '[]');
    
    if (queue.length === 0) return;

    toast({
      title: "Syncing Transactions",
      description: `Processing ${queue.length} pending transaction(s)...`,
    });

    const successfulTxs: number[] = [];
    
    for (let i = 0; i < queue.length; i++) {
      const tx = queue[i];
      try {
        if (tx.type === 'deposit') {
          const { data, error } = await supabase.functions.invoke('deposit-funds', {
            body: {
              payment_type: tx.payment_type,
              amount: tx.amount,
              currency: 'usd'
            }
          });

          if (!error && data.success) {
            successfulTxs.push(i);
          }
        }
      } catch (error) {
        console.error(`Failed to sync transaction ${i}:`, error);
      }
    }

    // Remove successful transactions from queue
    const remainingQueue = queue.filter((_: any, index: number) => !successfulTxs.includes(index));
    localStorage.setItem('offline_transactions', JSON.stringify(remainingQueue));
    setPendingTransactions(remainingQueue);

    if (successfulTxs.length > 0) {
      toast({
        title: "Sync Complete",
        description: `Successfully processed ${successfulTxs.length} transaction(s)`,
      });
      fetchBalance();
    }
  };

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingTransactions.length > 0) {
      syncOfflineTransactions();
    }
  }, [isOnline]);

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              JV Tokens
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">Primary Currency</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{balance.jv_token.toFixed(2)}</p>
            <p className="text-sm text-primary-foreground/60 mt-1">≈ ${(balance.jv_token / 10).toFixed(2)} USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>USD Balance</CardTitle>
            <CardDescription>Fiat Currency</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">${balance.usd.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reward Points</CardTitle>
            <CardDescription>Loyalty Rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{balance.rewards}</p>
          </CardContent>
        </Card>
      </div>

      {/* Offline Transaction Warning */}
      {!isOnline && pendingTransactions.length > 0 && (
        <Card className="border-orange-500 bg-orange-500/10">
          <CardHeader>
            <CardTitle className="text-orange-500">Pending Transactions</CardTitle>
            <CardDescription>
              You have {pendingTransactions.length} transaction(s) waiting to sync when back online.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Deposit/Withdraw */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Funds</CardTitle>
          <CardDescription>Add or withdraw JV Tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fiat" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fiat">Fiat Deposit</TabsTrigger>
              <TabsTrigger value="crypto">Crypto Exchange</TabsTrigger>
            </TabsList>
            <TabsContent value="fiat" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (USD)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You'll receive {(parseFloat(amount || "0") * 10).toFixed(2)} JV Tokens
                </p>
              </div>
              <Button onClick={() => handleDeposit("fiat")} className="w-full" disabled={!isOnline}>
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Deposit via Card
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Conversion Rate: 1 USD = 10 JV Tokens
              </p>
            </TabsContent>
            <TabsContent value="crypto" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (Crypto)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Exchange crypto for JV Tokens at market rate
                </p>
              </div>
              <Button onClick={() => handleDeposit("crypto")} className="w-full" variant="secondary" disabled={!isOnline}>
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Exchange Crypto
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Supports BTC, ETH, XRP and other major cryptocurrencies
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No transactions yet. Start by adding funds to your wallet!
          </p>
          {/* TODO: Implement transaction history from database */}
        </CardContent>
      </Card>

      {/* Offline Payment Info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Offline Payments</CardTitle>
          <CardDescription>
            JV Tokens support offline transactions. Payments made without internet will be queued and processed automatically when you're back online.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>Transactions are securely stored locally</li>
            <li>Auto-sync when connection restored</li>
            <li>Venues accept offline payments with JV Tokens</li>
            <li>No transaction is lost</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
