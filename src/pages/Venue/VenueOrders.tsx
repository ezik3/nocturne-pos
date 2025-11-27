import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

const orders = [
  { id: "#1234", table: "Table 5", items: 4, total: 86.50, status: "preparing", time: "5 min ago" },
  { id: "#1233", table: "Bar", items: 2, total: 34.00, status: "ready", time: "8 min ago" },
  { id: "#1232", table: "Table 2", items: 6, total: 142.00, status: "served", time: "12 min ago" },
  { id: "#1231", table: "Table 8", items: 3, total: 67.50, status: "preparing", time: "15 min ago" },
  { id: "#1230", table: "Table 1", items: 5, total: 98.00, status: "pending", time: "18 min ago" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  preparing: "bg-blue-500/20 text-blue-400",
  ready: "bg-green-500/20 text-green-400",
  served: "bg-muted text-muted-foreground",
};

export default function VenueOrders() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-primary mb-2">Orders</h1>
        <p className="text-muted-foreground">Track and manage all venue orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Pending", count: 3, icon: AlertCircle, color: "text-yellow-400" },
          { label: "Preparing", count: 5, icon: Clock, color: "text-blue-400" },
          { label: "Ready", count: 2, icon: CheckCircle, color: "text-green-400" },
          { label: "Served Today", count: 45, icon: CheckCircle, color: "text-muted-foreground" },
        ].map((stat) => (
          <Card key={stat.label} className="glass border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders List */}
      <Card className="glass border-border">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-bold text-primary">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.time}</p>
                  </div>
                  <div>
                    <p className="font-medium">{order.table}</p>
                    <p className="text-sm text-muted-foreground">{order.items} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold">${order.total.toFixed(2)}</p>
                  <Badge className={statusColors[order.status]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <Button variant="outline" size="sm" className="border-border">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
