import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle } from "lucide-react";

export default function Inventory() {
  const mockInventory = [
    { id: "1", name: "Coffee Beans", sku: "CF-001", quantity: 50, unit: "kg", lowThreshold: 20, status: "good" },
    { id: "2", name: "Milk", sku: "ML-001", quantity: 15, unit: "L", lowThreshold: 20, status: "low" },
    { id: "3", name: "Sugar", sku: "SG-001", quantity: 80, unit: "kg", lowThreshold: 30, status: "good" },
    { id: "4", name: "Flour", sku: "FL-001", quantity: 8, unit: "kg", lowThreshold: 15, status: "critical" },
    { id: "5", name: "Butter", sku: "BT-001", quantity: 25, unit: "kg", lowThreshold: 10, status: "good" },
  ];

  const getStatusBadge = (status: string, quantity: number, threshold: number) => {
    if (status === "critical" || quantity < threshold * 0.5) {
      return <Badge className="bg-destructive/20 text-destructive"><AlertTriangle className="h-3 w-3 mr-1" />Critical</Badge>;
    }
    if (status === "low" || quantity < threshold) {
      return <Badge className="bg-yellow-500/20 text-yellow-500">Low Stock</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-500">Good</Badge>;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Inventory</h1>
          <p className="text-muted-foreground">Track and manage stock levels</p>
        </div>
        <Button className="neon-glow">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Card className="glass border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-4 font-semibold">SKU</th>
                  <th className="p-4 font-semibold">Item Name</th>
                  <th className="p-4 font-semibold">Quantity</th>
                  <th className="p-4 font-semibold">Low Threshold</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockInventory.map(item => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="p-4 font-mono text-sm">{item.sku}</td>
                    <td className="p-4 font-semibold">{item.name}</td>
                    <td className="p-4">
                      <span className="font-semibold">{item.quantity}</span> {item.unit}
                    </td>
                    <td className="p-4 text-muted-foreground">{item.lowThreshold} {item.unit}</td>
                    <td className="p-4">
                      {getStatusBadge(item.status, item.quantity, item.lowThreshold)}
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">
                        Adjust
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
