import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, Users, TrendingUp, RefreshCw } from "lucide-react";
import { useVenueOrdersDB } from "@/hooks/useVenueOrdersDB";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [venueId, setVenueId] = useState<string | null>(null);
  
  useEffect(() => {
    const storedVenueId = localStorage.getItem('jv_current_venue_id');
    if (storedVenueId) setVenueId(storedVenueId);
  }, []);

  const { orders, stats, getRecentOrders, loading } = useVenueOrdersDB(venueId);
  
  const recentOrders = getRecentOrders(5);
  const todayRevenue = orders
    .filter(o => o.status === "served")
    .reduce((sum, o) => sum + o.total, 0);
  const avgOrder = orders.length > 0 ? todayRevenue / Math.max(stats.served, 1) : 0;

  const dashboardStats = [
    { title: "Today's Sales", value: `$${todayRevenue.toFixed(2)}`, icon: DollarSign, trend: "Live" },
    { title: "Total Orders", value: stats.total.toString(), icon: ShoppingCart, trend: `${stats.pending} pending` },
    { title: "Active Orders", value: (stats.pending + stats.preparing).toString(), icon: Users, trend: `${stats.ready} ready` },
    { title: "Avg. Order", value: `$${avgOrder.toFixed(2)}`, icon: TrendingUp, trend: "Today" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      case "preparing": return "bg-blue-500/20 text-blue-400";
      case "ready": return "bg-green-500/20 text-green-400";
      case "served": return "bg-muted text-muted-foreground";
      default: return "bg-muted";
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to JV POS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <Card key={stat.title} className="glass glass-hover border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-accent mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No recent orders</p>
                <p className="text-xs text-muted-foreground">Orders will appear here in real-time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">Order #{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.tableNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total.toFixed(2)}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Order Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Pending", count: stats.pending, color: "text-yellow-400" },
                { label: "Preparing", count: stats.preparing, color: "text-blue-400" },
                { label: "Ready for Pickup", count: stats.ready, color: "text-green-400" },
                { label: "Served Today", count: stats.served, color: "text-muted-foreground" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className={`font-medium ${item.color}`}>{item.label}</span>
                  <span className="text-2xl font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
