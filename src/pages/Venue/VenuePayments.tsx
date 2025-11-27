import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, CreditCard, Coins, ArrowUpRight, ArrowDownRight } from "lucide-react";

const transactions = [
  { id: 1, type: "incoming", description: "Table 12 - Order #1247", amount: 156.50, method: "JV Coin", time: "2 min ago" },
  { id: 2, type: "incoming", description: "Table 8 - Order #1246", amount: 89.00, method: "Card", time: "15 min ago" },
  { id: 3, type: "incoming", description: "Bar - Order #1245", amount: 42.00, method: "JV Coin", time: "32 min ago" },
  { id: 4, type: "outgoing", description: "Supplier Payment - Liquor Co", amount: 2450.00, method: "Bank", time: "1 hour ago" },
  { id: 5, type: "incoming", description: "VIP Section - Order #1244", amount: 520.00, method: "JV Coin", time: "2 hours ago" },
];

export default function VenuePayments() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Track revenue and manage payments</p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-border bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">JV Coin Balance</span>
            </div>
            <p className="text-3xl font-bold">12,450</p>
            <p className="text-sm text-muted-foreground mt-1">≈ $12,450 USD</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-green-500" />
              <span className="text-sm text-muted-foreground">Today's Revenue</span>
            </div>
            <p className="text-3xl font-bold">$3,842</p>
            <p className="text-sm text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> +12% vs yesterday
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-6 w-6 text-blue-500" />
              <span className="text-sm text-muted-foreground">Pending Payouts</span>
            </div>
            <p className="text-3xl font-bold">$8,240</p>
            <p className="text-sm text-muted-foreground mt-1">Next payout: Tomorrow</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="incoming">Incoming</TabsTrigger>
              <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      tx.type === "incoming" ? "bg-green-500/20" : "bg-red-500/20"
                    }`}>
                      {tx.type === "incoming" ? (
                        <ArrowDownRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      tx.type === "incoming" ? "text-green-500" : "text-red-500"
                    }`}>
                      {tx.type === "incoming" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {tx.method}
                    </Badge>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="incoming" className="space-y-3">
              {transactions.filter(t => t.type === "incoming").map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <ArrowDownRight className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-500">+${tx.amount.toFixed(2)}</p>
                    <Badge variant="secondary" className="text-xs">{tx.method}</Badge>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="outgoing" className="space-y-3">
              {transactions.filter(t => t.type === "outgoing").map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <ArrowUpRight className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-500">-${tx.amount.toFixed(2)}</p>
                    <Badge variant="secondary" className="text-xs">{tx.method}</Badge>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
