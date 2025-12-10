import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Building2, Smartphone, Bitcoin, Copy, Check, Loader2 } from 'lucide-react';
import { useJVCoinWallet } from '@/hooks/useJVCoinWallet';
import { toast } from '@/hooks/use-toast';

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_AMOUNTS = [10, 25, 50, 100, 500];

export const DepositModal: React.FC<DepositModalProps> = ({ open, onClose }) => {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [depositMethod, setDepositMethod] = useState<'card' | 'bank' | 'payid' | 'crypto'>('card');
  const [instructions, setInstructions] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { depositWithCard, depositWithBankTransfer, depositWithPayID, depositWithCrypto } = useJVCoinWallet();

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(prev => prev + quickAmount);
  };

  const handleDeposit = async () => {
    if (amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setInstructions(null);

    try {
      let result;

      switch (depositMethod) {
        case 'card':
          result = await depositWithCard(amount);
          if (result.success && result.client_secret) {
            // For card payments without saved payment method, we'd show Stripe Elements here
            // For now, simulate success
            toast({ title: 'Card Payment', description: 'Card payment processing... Please complete on Stripe' });
          }
          break;

        case 'bank':
          result = await depositWithBankTransfer(amount);
          if (result.success && result.payment_url) {
            toast({ title: 'Bank Transfer', description: 'Redirecting to complete bank transfer...' });
          }
          break;

        case 'payid':
          result = await depositWithPayID(amount);
          if (result.success && result.instructions) {
            setInstructions(result.instructions);
          }
          break;

        case 'crypto':
          result = await depositWithCrypto(amount);
          if (result.success && result.instructions) {
            setInstructions(result.instructions);
          }
          break;
      }

      if (result?.success && !result?.instructions) {
        if (depositMethod === 'card' && result.status === 'completed') {
          onClose();
        }
      } else if (!result?.success) {
        toast({ title: 'Deposit Failed', description: result?.error || 'Please try again', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Deposit error:', error);
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!', description: 'Address copied to clipboard' });
  };

  const resetModal = () => {
    setAmount(0);
    setInstructions(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { resetModal(); onClose(); } }}>
      <DialogContent className="bg-background/95 backdrop-blur-xl border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Deposit to Wallet</DialogTitle>
        </DialogHeader>

        {!instructions ? (
          <div className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Amount (USD)</label>
              <Input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount"
                className="text-2xl h-14 text-center font-bold bg-background/50 border-border/50"
              />

              {/* Quick Amount Buttons */}
              <div className="flex gap-2 flex-wrap">
                {QUICK_AMOUNTS.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="flex-1 min-w-[60px] border-primary/30 hover:bg-primary/10 hover:border-primary"
                  >
                    +${quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Conversion Preview */}
            {amount > 0 && (
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">You'll receive:</span>
                  <span className="text-xl font-bold text-primary">{amount} JVC</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">1 USD = 1 JVC (Stablecoin)</p>
              </div>
            )}

            {/* Payment Methods */}
            <Tabs value={depositMethod} onValueChange={(v) => setDepositMethod(v as any)}>
              <TabsList className="grid grid-cols-4 w-full bg-muted/50">
                <TabsTrigger value="card" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <CreditCard className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="bank" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Building2 className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="payid" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Smartphone className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="crypto" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Bitcoin className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="mt-4">
                <div className="text-center text-sm text-muted-foreground">
                  <p>Pay with Visa, Mastercard, or American Express</p>
                  <p className="text-xs mt-1">Instant deposit • 2.9% + $0.30 fee</p>
                </div>
              </TabsContent>

              <TabsContent value="bank" className="mt-4">
                <div className="text-center text-sm text-muted-foreground">
                  <p>Direct bank transfer via ACH</p>
                  <p className="text-xs mt-1">1-3 business days • No fees</p>
                </div>
              </TabsContent>

              <TabsContent value="payid" className="mt-4">
                <div className="text-center text-sm text-muted-foreground">
                  <p>Australian instant bank transfer</p>
                  <p className="text-xs mt-1">Usually within minutes • No fees</p>
                </div>
              </TabsContent>

              <TabsContent value="crypto" className="mt-4">
                <div className="text-center text-sm text-muted-foreground">
                  <p>Deposit with XRP cryptocurrency</p>
                  <p className="text-xs mt-1">3 confirmations • 1 XRP = 1 JVC</p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Deposit Button */}
            <Button
              onClick={handleDeposit}
              disabled={amount <= 0 || loading}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Deposit $${amount || 0}`
              )}
            </Button>
          </div>
        ) : (
          /* Instructions View for PayID/Crypto */
          <div className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-4 space-y-4">
              {instructions.payid && (
                <div>
                  <label className="text-xs text-muted-foreground uppercase">PayID</label>
                  <div className="flex items-center justify-between bg-background/50 rounded p-3 mt-1">
                    <span className="font-mono text-sm">{instructions.payid}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(instructions.payid)}
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {instructions.address && (
                <div>
                  <label className="text-xs text-muted-foreground uppercase">XRP Address</label>
                  <div className="flex items-center justify-between bg-background/50 rounded p-3 mt-1">
                    <span className="font-mono text-xs break-all">{instructions.address}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(instructions.address)}
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {instructions.reference && (
                <div>
                  <label className="text-xs text-muted-foreground uppercase">Reference</label>
                  <div className="flex items-center justify-between bg-background/50 rounded p-3 mt-1">
                    <span className="font-mono font-bold">{instructions.reference}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(instructions.reference)}
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground uppercase">Amount</label>
                <p className="text-xl font-bold text-primary mt-1">${amount} USD = {amount} JVC</p>
              </div>

              {instructions.message && (
                <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                  {instructions.message}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setInstructions(null)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 bg-primary text-primary-foreground"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
