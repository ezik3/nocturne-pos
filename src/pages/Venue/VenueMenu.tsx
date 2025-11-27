import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";

const menuItems = [
  { id: "1", name: "Signature Cocktail", category: "Drinks", price: 15, available: true },
  { id: "2", name: "Wagyu Burger", category: "Mains", price: 28, available: true },
  { id: "3", name: "Truffle Fries", category: "Sides", price: 11, available: true },
  { id: "4", name: "House Wine", category: "Drinks", price: 12, available: false },
  { id: "5", name: "Caesar Salad", category: "Starters", price: 14, available: true },
  { id: "6", name: "Chocolate Fondant", category: "Desserts", price: 16, available: true },
];

const categories = ["All", "Drinks", "Starters", "Mains", "Sides", "Desserts"];

export default function VenueMenu() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Menu Management</h1>
          <p className="text-muted-foreground">Manage your venue's menu items and pricing</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant="outline"
            size="sm"
            className="border-border hover:border-primary hover:text-primary"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {menuItems.map((item) => (
          <Card key={item.id} className={`glass border-border ${!item.available ? 'opacity-50' : ''}`}>
            <CardContent className="p-4">
              <div className="aspect-video bg-secondary/30 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${item.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-xl font-bold text-primary mb-3">${item.price.toFixed(2)}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-border">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="border-border text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
