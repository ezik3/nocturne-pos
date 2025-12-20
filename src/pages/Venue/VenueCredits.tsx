import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, Megaphone, Loader2 } from "lucide-react";
import PushNotificationDealsModal from "@/components/Venue/PushNotificationDealsModal";
import DealCreatorModal from "@/components/Venue/DealCreatorModal";
import WithdrawModal from "@/components/Venue/WithdrawModal";
import TransactionHistory from "@/components/Wallet/TransactionHistory";
import { useVenueWallet } from "@/hooks/useVenueWallet";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function VenueCredits() {
  const [showDealsModal, setShowDealsModal] = useState(false);
  const [showDealCreator, setShowDealCreator] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [venueId, setVenueId] = useState<string | null>(null);
  const availableCredits = 15;
  
  const { user } = useAuth();
  const { balance, loading, fetchBalance } = useVenueWallet(venueId);
  const { formatCurrency, jvcToLocal, userCurrency } = useCurrency();

  useEffect(() => {
    const getVenue = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('venues')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle();
      
      if (data) setVenueId(data.id);
    };
    getVenue();
  }, [user]);

  useEffect(() => {
    if (venueId) fetchBalance();
  }, [venueId, fetchBalance]);

  return (
    <>
      <PushNotificationDealsModal isOpen={showDealsModal} onClose={() => setShowDealsModal(false)} />
      <DealCreatorModal isOpen={showDealCreator} onClose={() => setShowDealCreator(false)} availableCredits={availableCredits} />
      {venueId && (
        <WithdrawModal 
          open={showWithdrawModal} 
          onClose={() => setShowWithdrawModal(false)}
          balance={balance.jvc}
          venueId={venueId}
          onSuccess={fetchBalance}
        />
      )}
      
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Credits & Payments</h1>
          <p className="text-muted-foreground">Manage your JV Coin balance and transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass border-border border-primary/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Coins className="h-8 w-8 text-primary" />
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              <p className="text-4xl font-bold mb-1">{loading ? '...' : balance.jvc.toFixed(2)}</p>
              <p className="text-muted-foreground">JV Coin Balance</p>
              {userCurrency !== 'USD' && (
                <p className="text-sm text-muted-foreground mt-1">≈ {formatCurrency(jvcToLocal(balance.jvc))}</p>
              )}
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1" onClick={() => setShowWithdrawModal(true)} disabled={balance.jvc <= 0.10}>
                  Withdraw
                </Button>
                <Button size="sm" variant="outline" className="flex-1">Transfer</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-green-400 mb-4" />
              <p className="text-4xl font-bold mb-1">${balance.usd.toFixed(2)}</p>
              <p className="text-muted-foreground">USD Equivalent</p>
            </CardContent>
          </Card>

          <Card className="glass border-border border-cyan-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Megaphone className="h-8 w-8 text-cyan-400" />
                <span className="text-sm text-cyan-400">{availableCredits} credits</span>
              </div>
              <p className="text-2xl font-bold mb-1">Push Deals</p>
              <p className="text-muted-foreground text-sm mb-4">Promote to nearby customers</p>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black" onClick={() => setShowDealsModal(true)}>Buy</Button>
                <Button size="sm" variant="outline" className="flex-1 border-cyan-500 text-cyan-400" onClick={() => setShowDealCreator(true)}>Create</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {venueId && <TransactionHistory venueId={venueId} />}
      </div>
    </>
  );
}
