import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, ArrowUpRight, ArrowDownRight, Megaphone } from "lucide-react";
import PushNotificationDealsModal from "@/components/Venue/PushNotificationDealsModal";
import DealCreatorModal from "@/components/Venue/DealCreatorModal";

const transactions = [
  { id: "1", type: "received", amount: 150, from: "Table 5 Order", time: "2 min ago" },
  { id: "2", type: "received", amount: 86.50, from: "Bar Order", time: "15 min ago" },
  { id: "3", type: "withdrawal", amount: 500, from: "Bank Transfer", time: "1 hour ago" },
  { id: "4", type: "received", amount: 234, from: "Table 2 Order", time: "2 hours ago" },
  { id: "5", type: "received", amount: 45, from: "Tips", time: "3 hours ago" },
];

export default function VenueCredits() {
  const [showDealsModal, setShowDealsModal] = useState(false);
  const [showDealCreator, setShowDealCreator] = useState(false);
  const availableCredits = 15;

  return (
    <>
      <PushNotificationDealsModal isOpen={showDealsModal} onClose={() => setShowDealsModal(false)} />
      <DealCreatorModal isOpen={showDealCreator} onClose={() => setShowDealCreator(false)} availableCredits={availableCredits} />
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-primary mb-2">Credits & Payments</h1>
        <p className="text-muted-foreground">Manage your JV Coin balance and transactions</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass border-border border-primary/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Coins className="h-8 w-8 text-primary" />
              <span className="text-sm text-green-400">+12.5% today</span>
            </div>
            <p className="text-4xl font-bold mb-1">4,280.50</p>
            <p className="text-muted-foreground">JV Coin Balance</p>
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="flex-1 bg-primary text-primary-foreground">
                Withdraw
              </Button>
              <Button size="sm" variant="outline" className="flex-1 border-border">
                Transfer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-4xl font-bold mb-1">$12,450</p>
            <p className="text-muted-foreground">This Week's Revenue</p>
            <p className="text-sm text-green-400 mt-2">+18% vs last week</p>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Coins className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-4xl font-bold mb-1">156</p>
            <p className="text-muted-foreground">Transactions Today</p>
            <p className="text-sm text-muted-foreground mt-2">Avg. $27.50 per order</p>
          </CardContent>
        </Card>

        {/* Push Notifications Card */}
        <Card className="glass border-border border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Megaphone className="h-8 w-8 text-cyan-400" />
              <span className="text-sm text-cyan-400">{availableCredits} credits</span>
            </div>
            <p className="text-2xl font-bold mb-1">Push Deals</p>
            <p className="text-muted-foreground text-sm mb-4">Promote deals to nearby customers</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black" onClick={() => setShowDealsModal(true)}>
                Buy Credits
              </Button>
              <Button size="sm" variant="outline" className="flex-1 border-cyan-500 text-cyan-400" onClick={() => setShowDealCreator(true)}>
                Create Deal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="glass border-border">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-primary mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'received' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {tx.type === 'received' ? (
                      <ArrowDownRight className="h-4 w-4 text-green-400" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tx.from}</p>
                    <p className="text-sm text-muted-foreground">{tx.time}</p>
                  </div>
                </div>
                <p className={`font-bold ${tx.type === 'received' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'received' ? '+' : '-'}{tx.amount} JV
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
