import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, Eye, RefreshCw } from "lucide-react";
import { useVenueOrdersDB } from "@/hooks/useVenueOrdersDB";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  preparing: "bg-blue-500/20 text-blue-400",
  ready: "bg-green-500/20 text-green-400",
  served: "bg-muted text-muted-foreground",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function VenueOrders() {
  const [venueId, setVenueId] = useState<string | null>(null);
  
  useEffect(() => {
    const storedVenueId = localStorage.getItem('jv_current_venue_id');
    if (storedVenueId) setVenueId(storedVenueId);
  }, []);

  const { orders, stats, updateOrderStatus, loading } = useVenueOrdersDB(venueId);

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-primary mb-2">Orders</h1>
        <p className="text-muted-foreground">Track and manage all venue orders in real-time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Pending", count: stats.pending, icon: AlertCircle, color: "text-yellow-400" },
          { label: "Preparing", count: stats.preparing, icon: Clock, color: "text-blue-400" },
          { label: "Ready", count: stats.ready, icon: CheckCircle, color: "text-green-400" },
          { label: "Served Today", count: stats.served, icon: CheckCircle, color: "text-muted-foreground" },
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
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground">
                Orders will appear here when created from POS or by customers through AI.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-bold text-primary">#{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="font-medium">{order.tableNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {order.source.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold">${order.total.toFixed(2)}</p>
                    <Badge className={statusColors[order.status]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, "preparing")}
                        >
                          Start
                        </Button>
                      )}
                      {order.status === "preparing" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, "ready")}
                        >
                          Ready
                        </Button>
                      )}
                      {order.status === "ready" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, "served")}
                        >
                          Served
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
