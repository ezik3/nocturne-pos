import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, ShoppingCart, Receipt } from "lucide-react";

export default function Sales() {
  const todayStats = {
    revenue: 5243.50,
    orders: 87,
    avgOrder: 60.27,
    growth: 12.5
  };

  const salesByHour = [
    { hour: "9 AM", amount: 145 },
    { hour: "10 AM", amount: 320 },
    { hour: "11 AM", amount: 580 },
    { hour: "12 PM", amount: 890 },
    { hour: "1 PM", amount: 1050 },
    { hour: "2 PM", amount: 780 },
    { hour: "3 PM", amount: 450 },
    { hour: "4 PM", amount: 380 },
    { hour: "5 PM", amount: 650 },
  ];

  const topItems = [
    { name: "Signature Cocktail", sold: 45, revenue: 675.00 },
    { name: "House Wine", sold: 38, revenue: 570.00 },
    { name: "Premium Beer", sold: 52, revenue: 416.00 },
    { name: "Appetizer Platter", sold: 28, revenue: 420.00 },
    { name: "Dessert Special", sold: 31, revenue: 465.00 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Sales & Reports</h1>
          <p className="text-muted-foreground">Track revenue and performance</p>
        </div>
        <Button className="neon-glow">
          <Receipt className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass glass-hover border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${todayStats.revenue.toFixed(2)}</div>
            <p className="text-xs text-accent mt-1">+{todayStats.growth}% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayStats.orders}</div>
            <p className="text-xs text-accent mt-1">+8 from yesterday</p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Order
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${todayStats.avgOrder.toFixed(2)}</div>
            <p className="text-xs text-accent mt-1">+5.3% trend</p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Peak Hour
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1 PM</div>
            <p className="text-xs text-accent mt-1">$1,050 revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Sales by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salesByHour.map(item => {
                const maxAmount = Math.max(...salesByHour.map(s => s.amount));
                const percentage = (item.amount / maxAmount) * 100;
                
                return (
                  <div key={item.hour}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{item.hour}</span>
                      <span className="font-semibold">${item.amount}</span>
                    </div>
                    <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.sold} sold</p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">${item.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
