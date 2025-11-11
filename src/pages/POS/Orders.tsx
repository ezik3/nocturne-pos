import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function Orders() {
  const mockOrders = [
    { id: "1001", table: "Table 5", total: 45.50, status: "completed", time: "10:30 AM" },
    { id: "1002", table: "Table 3", total: 62.00, status: "preparing", time: "10:45 AM" },
    { id: "1003", table: "Table 8", total: 38.75, status: "pending", time: "11:00 AM" },
    { id: "1004", table: "Table 1", total: 55.20, status: "completed", time: "11:15 AM" },
    { id: "1005", table: "Table 12", total: 71.50, status: "preparing", time: "11:30 AM" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500";
      case "preparing": return "bg-blue-500/20 text-blue-500";
      case "completed": return "bg-green-500/20 text-green-500";
      default: return "bg-muted";
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-4 font-semibold">Order #</th>
                  <th className="p-4 font-semibold">Table</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Time</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map(order => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="p-4 font-mono font-semibold">#{order.id}</td>
                    <td className="p-4">{order.table}</td>
                    <td className="p-4 font-semibold text-primary">${order.total.toFixed(2)}</td>
                    <td className="p-4 text-muted-foreground">{order.time}</td>
                    <td className="p-4">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
