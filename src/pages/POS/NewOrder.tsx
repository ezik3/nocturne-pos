import { useState } from "react";
import { usePOS } from "@/contexts/POSContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewOrder() {
  const { menu, cart, addToCart, removeFromCart, updateCartItem, clearCart, createOrder } = usePOS();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(menu.map(item => item.category))];
  
  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const tax = cartTotal * 0.1;
  const total = cartTotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({ title: "Cart is empty", description: "Add items to place an order" });
      return;
    }

    await createOrder({
      subtotal: cartTotal,
      tax,
      total,
      table: "Table 1", // Mock
    });

    toast({
      title: "Order created!",
      description: "Order sent to kitchen",
    });
  };

  return (
    <div className="flex h-screen">
      {/* Menu Section */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">New Order</h1>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="glass">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMenu.map(item => (
            <Card 
              key={item.id} 
              className="glass glass-hover cursor-pointer border-border"
              onClick={() => addToCart(item)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-secondary/30 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-4xl">🍽️</span>
                </div>
                <h3 className="font-semibold mb-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <p className="text-lg font-bold text-primary">${item.price.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 glass border-l border-border p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Current Order</h2>

        <div className="flex-1 overflow-auto mb-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Cart is empty</p>
          ) : (
            cart.map(item => (
              <Card key={item.id} className="glass border-border">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.menuItem.name}</h4>
                      <p className="text-sm text-primary">${item.menuItem.price.toFixed(2)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateCartItem(item.id, item.quantity - 1)}
                        className="h-8 w-8"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-bold">
                      ${(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>

          <div className="space-y-2 pt-2">
            <Button 
              className="w-full neon-glow" 
              size="lg"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Place Order
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
