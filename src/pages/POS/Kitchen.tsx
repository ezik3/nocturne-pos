import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";
import { usePOS } from "@/contexts/POSContext";

export default function Kitchen() {
  const { orders } = usePOS();
  const [filter, setFilter] = useState<"all" | "pending" | "preparing" | "ready">("all");

  const mockOrders = [
    { id: "1001", table: "Table 5", items: ["Cappuccino x2", "Croissant x1"], status: "pending", time: "2m ago" },
    { id: "1002", table: "Table 3", items: ["Latte x1", "Muffin x2"], status: "preparing", time: "5m ago" },
    { id: "1003", table: "Table 8", items: ["Espresso x3", "Croissant x2"], status: "pending", time: "1m ago" },
    { id: "1004", table: "Table 1", items: ["Americano x1"], status: "ready", time: "8m ago" },
  ];

  const filteredOrders = filter === "all" 
    ? mockOrders 
    : mockOrders.filter(order => order.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "preparing": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "ready": return "bg-green-500/20 text-green-500 border-green-500/30";
      default: return "bg-muted";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-4">Kitchen Display</h1>
        
        <div className="flex gap-2">
          {["all", "pending", "preparing", "ready"].map(status => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status as any)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map(order => (
          <Card key={order.id} className="glass border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">#{order.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">{order.table}</p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{order.time}</span>
              </div>

              <div className="flex gap-2">
                {order.status === "pending" && (
                  <Button className="w-full" variant="default">
                    Start Preparing
                  </Button>
                )}
                {order.status === "preparing" && (
                  <Button className="w-full neon-glow">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Ready
                  </Button>
                )}
                {order.status === "ready" && (
                  <Button className="w-full" variant="outline">
                    Complete Order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No orders in this status</p>
        </div>
      )}
    </div>
  );
}
