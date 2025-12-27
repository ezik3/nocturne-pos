import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw } from "lucide-react";
import { useVenueOrdersDB } from "@/hooks/useVenueOrdersDB";
import { formatDistanceToNow } from "date-fns";

export default function Orders() {
  const [venueId, setVenueId] = useState<string | null>(null);
  
  useEffect(() => {
    const storedVenueId = localStorage.getItem('jv_current_venue_id');
    if (storedVenueId) setVenueId(storedVenueId);
  }, []);

  const { orders, updateOrderStatus, loading } = useVenueOrdersDB(venueId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500";
      case "preparing": return "bg-blue-500/20 text-blue-500";
      case "ready": return "bg-green-500/20 text-green-500";
      case "served": return "bg-muted text-muted-foreground";
      default: return "bg-muted";
    }
  };

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
        <h1 className="text-4xl font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground">Manage all venue orders</p>
      </div>

      <Card className="glass border-border">
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground">
                Create an order from New Order or wait for customer orders.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-left">
                    <th className="p-4 font-semibold">Order #</th>
                    <th className="p-4 font-semibold">Table</th>
                    <th className="p-4 font-semibold">Items</th>
                    <th className="p-4 font-semibold">Total</th>
                    <th className="p-4 font-semibold">Time</th>
                    <th className="p-4 font-semibold">Source</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="p-4 font-mono font-semibold">#{order.orderNumber}</td>
                      <td className="p-4">{order.tableNumber}</td>
                      <td className="p-4">{order.items.length} items</td>
                      <td className="p-4 font-semibold text-primary">${order.total.toFixed(2)}</td>
                      <td className="p-4 text-muted-foreground">{formatTime(order.createdAt)}</td>
                      <td className="p-4">
                        <Badge variant="outline">{order.source.toUpperCase()}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, "preparing")}
                            >
                              Start
                            </Button>
                          )}
                          {order.status === "preparing" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, "ready")}
                            >
                              Ready
                            </Button>
                          )}
                          {order.status === "ready" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, "served")}
                            >
                              Served
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
