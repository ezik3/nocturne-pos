import { useState } from "react";
import { usePOS } from "@/contexts/POSContext";
import { useVenueOrders } from "@/hooks/useVenueOrders";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Minus, Trash2, Search, ShoppingCart, AlertCircle, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

interface MenuItemSize {
  id: string;
  name: string;
  price: number;
}

export default function NewOrder() {
  const { menu, cart, addToCart, removeFromCart, updateCartItem, clearCart } = usePOS();
  const { addOrder } = useVenueOrders();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sizeSelectItem, setSizeSelectItem] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState("Table 1");

  const categories = ["All", ...new Set(menu.map(item => item.category))];
  
  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const getItemPrice = (item: any) => {
    if (item.selectedSize) {
      return item.selectedSize.price * item.quantity;
    }
    return (item.menuItem.basePrice || item.menuItem.price) * item.quantity;
  };

  const cartTotal = cart.reduce((sum, item) => sum + getItemPrice(item), 0);
  const tax = cartTotal * 0.1;
  const total = cartTotal + tax;

  const handleItemClick = (item: any) => {
    // If item has sizes, show size selector
    if (item.sizes && item.sizes.length > 0) {
      setSizeSelectItem(item);
    } else {
      addToCart(item);
    }
  };

  const handleSizeSelect = (size: MenuItemSize) => {
    if (sizeSelectItem) {
      addToCart(sizeSelectItem, 1, size);
      setSizeSelectItem(null);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({ title: "Cart is empty", description: "Add items to place an order" });
      return;
    }

    // Create order using the shared hook
    const orderItems = cart.map(item => ({
      id: item.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      price: item.selectedSize?.price || item.menuItem.basePrice || item.menuItem.price,
      size: item.selectedSize?.name,
    }));

    const newOrder = addOrder({
      tableNumber: selectedTable,
      items: orderItems,
      total,
      status: "pending",
      source: "pos",
      priority: "normal",
    });

    clearCart();
    
    sonnerToast.success(`Order #${newOrder.orderNumber} Created`, {
      description: `Sent to kitchen - ${selectedTable}`,
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
            <TabsList className="glass flex-wrap">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {filteredMenu.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No menu items found</p>
            <p className="text-sm text-muted-foreground">
              Add items in Menu Management to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenu.map(item => (
              <Card 
                key={item.id} 
                className="glass glass-hover cursor-pointer border-border relative"
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-4">
                  {/* Size indicator */}
                  {item.sizes && item.sizes.length > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                        <Layers className="h-3 w-3 mr-1" />
                        {item.sizes.length} sizes
                      </Badge>
                    </div>
                  )}
                  
                  <div className="aspect-square bg-secondary/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<span class="text-4xl">🍽️</span>';
                        }}
                      />
                    ) : (
                      <span className="text-4xl">🍽️</span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {item.description || item.category}
                  </p>
                  
                  {/* Price display */}
                  {item.sizes && item.sizes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-sm text-muted-foreground">From </span>
                      <span className="text-lg font-bold text-primary">
                        ${Math.min(...item.sizes.map((s: MenuItemSize) => s.price)).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-primary">
                      ${(item.basePrice || item.price).toFixed(2)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="w-96 glass border-l border-border p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Current Order</h2>
        </div>

        <div className="flex-1 overflow-auto mb-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Cart is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Tap items to add</p>
            </div>
          ) : (
            cart.map(item => (
              <Card key={item.id} className="glass border-border">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.menuItem.name}</h4>
                      {item.selectedSize && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.selectedSize.name}
                        </Badge>
                      )}
                      <p className="text-sm text-primary">
                        ${(item.selectedSize?.price || item.menuItem.basePrice || item.menuItem.price).toFixed(2)}
                      </p>
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
                      ${getItemPrice(item).toFixed(2)}
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

      {/* Size Selection Modal */}
      <Dialog open={!!sizeSelectItem} onOpenChange={() => setSizeSelectItem(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Size</DialogTitle>
          </DialogHeader>
          
          {sizeSelectItem && (
            <div className="space-y-3">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">{sizeSelectItem.name}</h3>
                <p className="text-sm text-muted-foreground">{sizeSelectItem.description}</p>
              </div>
              
              <div className="space-y-2">
                {sizeSelectItem.sizes?.map((size: MenuItemSize) => (
                  <Button
                    key={size.id}
                    variant="outline"
                    className="w-full justify-between h-14 border-slate-600 hover:border-primary"
                    onClick={() => handleSizeSelect(size)}
                  >
                    <span className="font-medium">{size.name}</span>
                    <span className="text-primary font-bold">${size.price.toFixed(2)}</span>
                  </Button>
                ))}
              </div>
              
              {/* Also allow base price if exists */}
              {sizeSelectItem.basePrice > 0 && (
                <Button
                  variant="outline"
                  className="w-full justify-between h-14 border-slate-600 hover:border-primary"
                  onClick={() => {
                    addToCart(sizeSelectItem, 1, null);
                    setSizeSelectItem(null);
                  }}
                >
                  <span className="font-medium">Regular</span>
                  <span className="text-primary font-bold">${sizeSelectItem.basePrice.toFixed(2)}</span>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
