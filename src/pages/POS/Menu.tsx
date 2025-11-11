import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { usePOS } from "@/contexts/POSContext";

export default function Menu() {
  const { menu } = usePOS();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Menu Management</h1>
          <p className="text-muted-foreground">Manage your venue's menu items</p>
        </div>
        <Button className="neon-glow">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {menu.map(item => (
          <Card key={item.id} className="glass glass-hover border-border">
            <CardContent className="p-4">
              <div className="aspect-square bg-secondary/30 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-5xl">🍽️</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
              <p className="text-xl font-bold text-primary mb-3">${item.price.toFixed(2)}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
