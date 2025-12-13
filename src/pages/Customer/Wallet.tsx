import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, ArrowDownLeft, History, Wifi, WifiOff, Wallet as WalletIcon, Copy, Check, Send, Globe, ChevronDown, Info, Zap, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJVCoinWallet } from "@/hooks/useJVCoinWallet";
import { useCurrency, CURRENCIES } from "@/hooks/useCurrency";
import { DepositModal } from "@/components/Customer/DepositModal";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function Wallet() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [copied, setCopied] = useState(false);
  
  const { toast } = useToast();
  const { 
    balance, 
    loading, 
    xrpAddress, 
    fetchBalance, 
    initializeXRPWallet,
    transferJVC 
  } = useJVCoinWallet();

  const {
    userCurrency,
    jvcToLocal,
    formatCurrency,
    formatJVC,
    setDisplayCurrency,
    getCurrencyInfo,
    getTransactionFeeLocal,
    TRANSACTION_FEE_USD,
    availableCurrencies,
  } = useCurrency();

  useEffect(() => {
    const queue = JSON.parse(localStorage.getItem('offline_transactions') || '[]');
    setPendingTransactions(queue);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInitializeWallet = async () => {
    const address = await initializeXRPWallet();
    if (address) {
      toast({
        title: "Wallet Created!",
        description: "Your XRP wallet has been initialized with JVC trustline",
      });
    }
  };

  const copyAddress = () => {
    if (xrpAddress) {
      navigator.clipboard.writeText(xrpAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Wallet address copied to clipboard" });
    }
  };

  const handleTransfer = async () => {
    if (!transferAddress || !transferAmount) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const amount = parseFloat(transferAmount);
    const totalWithFee = amount + TRANSACTION_FEE_USD;

    if (totalWithFee > balance.jvc) {
      toast({ 
        title: "Insufficient Balance", 
        description: `Need ${totalWithFee.toFixed(2)} JVC (including $0.10 fee)`, 
        variant: "destructive" 
      });
      return;
    }

    const success = await transferJVC(transferAddress, amount);
    if (success) {
      setShowTransferModal(false);
      setTransferAddress("");
      setTransferAmount("");
    }
  };

  // Calculate local currency equivalents
  const localBalance = jvcToLocal(balance.jvc);
  const localFee = getTransactionFeeLocal();
  const currencyInfo = getCurrencyInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        {/* Header with Currency Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                JV Wallet
              </h1>
              <p className="text-muted-foreground text-sm">Manage your JV Coins</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Currency Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Globe className="h-4 w-4" />
                  {userCurrency}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-64 overflow-y-auto">
                {availableCurrencies.map((code) => (
                  <DropdownMenuItem 
                    key={code} 
                    onClick={() => setDisplayCurrency(code)}
                    className={userCurrency === code ? 'bg-primary/10' : ''}
                  >
                    {CURRENCIES[code].symbol} {code} - {CURRENCIES[code].name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Online Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isOnline 
                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* XRP Wallet Address */}
        {xrpAddress ? (
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <WalletIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Your XRP Address (JVC Wallet)</p>
                    <p className="font-mono text-sm">{xrpAddress.slice(0, 12)}...{xrpAddress.slice(-8)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={copyAddress}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="pt-6 text-center">
              <WalletIcon className="h-12 w-12 mx-auto text-primary/50 mb-3" />
              <h3 className="font-semibold mb-1">No Wallet Connected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Initialize your XRP wallet to receive and send JV Coins
              </p>
              <Button onClick={handleInitializeWallet} className="bg-primary text-primary-foreground">
                Initialize Wallet
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Balance Cards - Showing BOTH JVC and Local Currency */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* JVC Balance with Local Currency */}
          <Card className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground border-0 shadow-lg shadow-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coins className="h-5 w-5" />
                JV Coins
              </CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Pegged to USDT (1 JVC = $1 USD)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{loading ? '...' : balance.jvc.toFixed(2)}</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-primary-foreground/80">
                  ≈ ${balance.jvc.toFixed(2)} USD
                </p>
                {userCurrency !== 'USD' && (
                  <p className="text-sm text-primary-foreground/60 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    ≈ {formatCurrency(localBalance)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deposited Value */}
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Deposited</CardTitle>
              <CardDescription>Your deposits in {currencyInfo.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {loading ? '...' : formatCurrency(localBalance)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                = ${balance.usd.toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          {/* Reward Points */}
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Reward Points</CardTitle>
              <CardDescription>Loyalty Rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{loading ? '...' : balance.rewards}</p>
              <p className="text-sm text-muted-foreground mt-1">Redeem for perks</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Fee Info */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium text-sm">Platform Transaction Fee</p>
                <p className="text-xs text-muted-foreground">Flat fee on all transactions</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                $0.10 USD
              </Badge>
              {userCurrency !== 'USD' && (
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {formatCurrency(localFee)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Offline Transaction Warning */}
        {!isOnline && pendingTransactions.length > 0 && (
          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardHeader className="py-4">
              <CardTitle className="text-orange-500 text-base flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                {pendingTransactions.length} Pending Transaction(s)
              </CardTitle>
              <CardDescription className="text-orange-500/70">
                Will sync automatically when back online
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            size="lg" 
            className="h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold"
            onClick={() => setShowDepositModal(true)}
          >
            <ArrowDownLeft className="h-5 w-5 mr-2" />
            Deposit
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="h-14 border-2 font-semibold"
            onClick={() => setShowTransferModal(true)}
            disabled={!xrpAddress || balance.jvc <= 0}
          >
            <Send className="h-5 w-5 mr-2" />
            Send JVC
          </Button>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Start by depositing funds to your wallet!</p>
            </div>
          </CardContent>
        </Card>

        {/* JVC Info Card */}
        <Card className="bg-muted/30 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              About JV Coin
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>1 JVC = $1 USD</strong> - Pegged to USDT stablecoin</p>
            <p>• Built on <strong>XRP Ledger</strong> for fast, low-cost transactions</p>
            <p>• <strong>$0.10 flat fee</strong> per transaction (99% cheaper than card fees)</p>
            <p>• <strong>Offline payments</strong> supported - transactions sync when online</p>
            <p>• <strong>Multi-currency display</strong> - See balance in your local currency</p>
            <p>• Use JVC at all venues for food, drinks, rides, and deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Deposit Modal */}
      <DepositModal 
        open={showDepositModal} 
        onClose={() => {
          setShowDepositModal(false);
          fetchBalance();
        }} 
      />

      {/* Transfer Modal */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle>Send JV Coins</DialogTitle>
            <DialogDescription>
              Transfer JVC to another wallet. A flat $0.10 USD fee applies.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Recipient XRP Address</label>
              <Input
                placeholder="rXXXXXXXXXXXXXXXXXX"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Amount (JVC)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {balance.jvc.toFixed(2)} JVC
              </p>
            </div>

            {/* Fee Breakdown */}
            {transferAmount && parseFloat(transferAmount) > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span>{parseFloat(transferAmount).toFixed(2)} JVC</span>
                </div>
                <div className="flex justify-between text-amber-500">
                  <span>Platform Fee:</span>
                  <span>0.10 JVC</span>
                </div>
                <div className="flex justify-between font-bold border-t border-border/50 pt-1 mt-1">
                  <span>Total:</span>
                  <span>{(parseFloat(transferAmount) + 0.10).toFixed(2)} JVC</span>
                </div>
                {userCurrency !== 'USD' && (
                  <p className="text-xs text-muted-foreground text-right">
                    ≈ {formatCurrency(jvcToLocal(parseFloat(transferAmount) + 0.10))}
                  </p>
                )}
              </div>
            )}

            <Button 
              onClick={handleTransfer} 
              className="w-full"
              disabled={!transferAddress || !transferAmount || (parseFloat(transferAmount) + 0.10) > balance.jvc}
            >
              <Send className="h-4 w-4 mr-2" />
              Send {transferAmount || '0'} JVC + $0.10 fee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
