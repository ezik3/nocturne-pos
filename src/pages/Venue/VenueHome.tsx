import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, ShoppingCart, DollarSign, Clock, Star } from "lucide-react";

const stats = [
  { title: "Today's Revenue", value: "$4,280", icon: DollarSign, trend: "+12.5%" },
  { title: "Active Orders", value: "23", icon: ShoppingCart, trend: "+8" },
  { title: "Customers Today", value: "156", icon: Users, trend: "+24" },
  { title: "Avg. Wait Time", value: "12 min", icon: Clock, trend: "-2 min" },
  { title: "Rating", value: "4.8", icon: Star, trend: "+0.2" },
  { title: "Growth", value: "+18%", icon: TrendingUp, trend: "vs last week" },
];

export default function VenueHome() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">Here's what's happening at your venue today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className="text-xs text-green-400">{stat.trend}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { time: "2 min ago", action: "New order #1234 received", type: "order" },
                { time: "5 min ago", action: "Table 4 checked out", type: "checkout" },
                { time: "12 min ago", action: "Staff member John clocked in", type: "staff" },
                { time: "18 min ago", action: "New reservation for 8 PM", type: "reservation" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Top Selling Items</h2>
            <div className="space-y-3">
              {[
                { name: "Signature Cocktail", sales: 45, revenue: "$675" },
                { name: "Wagyu Burger", sales: 32, revenue: "$896" },
                { name: "Truffle Fries", sales: 28, revenue: "$308" },
                { name: "House Wine", sales: 24, revenue: "$288" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.sales} sold</p>
                  </div>
                  <p className="text-primary font-bold">{item.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
