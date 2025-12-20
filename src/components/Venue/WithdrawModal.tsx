import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, Bitcoin, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  venueId?: string;
  onSuccess?: () => void;
}

const WITHDRAWAL_FEE = 0.10;

export default function WithdrawModal({ open, onClose, balance, venueId, onSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bank" | "crypto">("bank");
  const [bankDetails, setBankDetails] = useState({
    account_last4: "",
    bank_name: "",
    routing_number: "",
    account_number: ""
  });
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const { formatCurrency, jvcToLocal, userCurrency } = useCurrency();

  const numAmount = parseFloat(amount) || 0;
  const netPayout = numAmount - WITHDRAWAL_FEE;
  const isValid = numAmount > WITHDRAWAL_FEE && numAmount <= balance;

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          amount: numAmount,
          withdrawal_method: method,
          venue_id: venueId,
          bank_details: method === 'bank' ? {
            account_last4: bankDetails.account_number.slice(-4),
            bank_name: bankDetails.bank_name,
            routing_number: bankDetails.routing_number,
            account_number: bankDetails.account_number
          } : undefined,
          crypto_address: method === 'crypto' ? cryptoAddress : undefined
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setSuccess(true);
      toast({
        title: "Withdrawal Successful!",
        description: `${netPayout.toFixed(2)} USD is on its way to your ${method === 'bank' ? 'bank account' : 'crypto wallet'}.`,
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
        setAmount("");
      }, 2000);

    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Withdrawal Complete!</h3>
            <p className="text-muted-foreground text-center">
              ${netPayout.toFixed(2)} USD will arrive in {method === 'crypto' ? '1-2 hours' : '1-3 business days'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Convert your JVC balance to fiat currency. A flat ${WITHDRAWAL_FEE} fee applies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Display */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">{balance.toFixed(2)} JVC</p>
            {userCurrency !== 'USD' && (
              <p className="text-sm text-muted-foreground">≈ {formatCurrency(jvcToLocal(balance))}</p>
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label>Withdrawal Amount (JVC)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={balance}
              step="0.01"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Min: ${(WITHDRAWAL_FEE + 0.01).toFixed(2)}</span>
              <button 
                className="text-primary hover:underline"
                onClick={() => setAmount(balance.toString())}
              >
                Max: {balance.toFixed(2)} JVC
              </button>
            </div>
          </div>

          {/* Fee Breakdown */}
          {numAmount > 0 && (
            <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span>{numAmount.toFixed(2)} JVC</span>
              </div>
              <div className="flex justify-between text-amber-500">
                <span>Platform Fee:</span>
                <span>-${WITHDRAWAL_FEE}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border pt-2 mt-2">
                <span>You'll Receive:</span>
                <span className={netPayout > 0 ? 'text-green-500' : 'text-red-500'}>
                  ${Math.max(0, netPayout).toFixed(2)} USD
                </span>
              </div>
            </div>
          )}

          {/* Withdrawal Method */}
          <div className="space-y-3">
            <Label>Withdrawal Method</Label>
            <RadioGroup value={method} onValueChange={(v) => setMethod(v as 'bank' | 'crypto')}>
              <div className="flex gap-3">
                <label className={`flex-1 flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  method === 'bank' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                }`}>
                  <RadioGroupItem value="bank" />
                  <Building2 className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">1-3 business days</p>
                  </div>
                </label>
                <label className={`flex-1 flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  method === 'crypto' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                }`}>
                  <RadioGroupItem value="crypto" />
                  <Bitcoin className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Crypto</p>
                    <p className="text-xs text-muted-foreground">1-2 hours</p>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Method-specific fields */}
          {method === 'bank' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Bank Name</Label>
                  <Input
                    placeholder="Bank of America"
                    value={bankDetails.bank_name}
                    onChange={(e) => setBankDetails(p => ({ ...p, bank_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Routing Number</Label>
                  <Input
                    placeholder="021000021"
                    value={bankDetails.routing_number}
                    onChange={(e) => setBankDetails(p => ({ ...p, routing_number: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Account Number</Label>
                <Input
                  placeholder="123456789012"
                  value={bankDetails.account_number}
                  onChange={(e) => setBankDetails(p => ({ ...p, account_number: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <Label className="text-xs">USDT/USDC Wallet Address (ERC-20 or TRC-20)</Label>
              <Input
                placeholder="0x... or T..."
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 text-sm text-amber-500 bg-amber-500/10 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Withdrawals are processed instantly. Please verify your {method === 'bank' ? 'bank details' : 'wallet address'} carefully.</p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!isValid || loading || (method === 'bank' && !bankDetails.account_number) || (method === 'crypto' && !cryptoAddress)}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Withdraw $${Math.max(0, netPayout).toFixed(2)} USD`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
