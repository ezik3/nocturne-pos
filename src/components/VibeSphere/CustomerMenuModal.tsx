import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Clock, Plus, Minus, ShoppingCart, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItemSize {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  sizes: MenuItemSize[];
  imageUrl: string;
  available: boolean;
  preparationTime?: number;
}

interface CartItem {
  id: string;
  menuItem: MenuItem;
  selectedSize: MenuItemSize | null;
  quantity: number;
}

interface CustomerMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId: string;
  venueName: string;
}

const CustomerMenuModal = ({ isOpen, onClose, venueId, venueName }: CustomerMenuModalProps) => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const fetchMenuItems = useCallback(async () => {
    if (!venueId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("venue_menu_items")
        .select("*")
        .eq("venue_id", venueId)
        .eq("available", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;

      const items: MenuItem[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        category: item.category,
        basePrice: Number(item.base_price),
        sizes: item.sizes || [],
        imageUrl: item.image_url || "",
        available: item.available,
        preparationTime: item.preparation_time,
      }));

      setMenuItems(items);
      
      const uniqueCategories = [...new Set(items.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }

    setLoading(false);
  }, [venueId]);

  useEffect(() => {
    if (isOpen && venueId) {
      setLoading(true);
      fetchMenuItems();
    }
  }, [isOpen, venueId, fetchMenuItems]);

  useEffect(() => {
    if (!venueId || !isOpen) return;

    const channel = supabase
      .channel(`customer-menu-${venueId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "venue_menu_items",
          filter: `venue_id=eq.${venueId}`,
        },
        () => {
          fetchMenuItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId, isOpen, fetchMenuItems]);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: MenuItem, size: MenuItemSize | null = null) => {
    const cartItemId = size ? `${item.id}-${size.id}` : item.id;
    
    setCart(prev => {
      const existing = prev.find(c => 
        size 
          ? c.menuItem.id === item.id && c.selectedSize?.id === size.id 
          : c.menuItem.id === item.id && !c.selectedSize
      );
      
      if (existing) {
        return prev.map(c => 
          c.id === existing.id 
            ? { ...c, quantity: c.quantity + 1 } 
            : c
        );
      }
      
      return [...prev, {
        id: cartItemId,
        menuItem: item,
        selectedSize: size,
        quantity: 1
      }];
    });
    
    toast.success(`Added ${item.name}${size ? ` (${size.name})` : ''} to cart`);
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty <= 0 ? null : { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const getItemPrice = (item: CartItem) => {
    return item.selectedSize?.price ?? item.menuItem.basePrice;
  };

  const cartTotal = cart.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      return;
    }
    
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setPlacingOrder(true);
    
    try {
      // Create order
      const subtotal = cartTotal;
      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          venue_id: venueId,
          customer_name: user.email?.split('@')[0] || 'Customer',
          subtotal,
          tax,
          total,
          status: 'pending',
          notes: 'Order placed via VibeSphere'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        name: item.menuItem.name + (item.selectedSize ? ` (${item.selectedSize.name})` : ''),
        quantity: item.quantity,
        price: getItemPrice(item),
        image_url: item.menuItem.imageUrl || null,
        notes: item.selectedSize ? `Size: ${item.selectedSize.name}` : null
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success("Order placed successfully! The venue will prepare it shortly.");
      setCart([]);
      setShowCart(false);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg max-h-[85vh] bg-gradient-to-b from-secondary/95 to-background/95 backdrop-blur-xl rounded-3xl border border-primary/20 overflow-hidden shadow-2xl shadow-primary/10"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-border/30 sticky top-0 bg-secondary/95 backdrop-blur-xl z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                  {venueName}
                </h2>
                <p className="text-sm text-muted-foreground">Order from the menu</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Cart Button */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="relative border-primary/30 hover:bg-primary/10"
                  onClick={() => setShowCart(!showCart)}
                >
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {!showCart && (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-border/30 focus:border-primary/50"
                  />
                </div>

                {/* Category Tabs */}
                {categories.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                    <Badge
                      variant={selectedCategory === null ? "default" : "outline"}
                      className={`cursor-pointer whitespace-nowrap transition-all ${
                        selectedCategory === null 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-primary/10 border-primary/30'
                      }`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      All
                    </Badge>
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className={`cursor-pointer whitespace-nowrap transition-all ${
                          selectedCategory === cat 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-primary/10 border-primary/30'
                        }`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Content */}
          <ScrollArea className="h-[55vh]">
            {showCart ? (
              /* Cart View */
              <div className="p-4 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Your Order</h3>
                
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Add items from the menu to get started</p>
                    <Button 
                      variant="outline" 
                      className="mt-4 border-primary/30"
                      onClick={() => setShowCart(false)}
                    >
                      Browse Menu
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-background/50 rounded-xl border border-border/30 p-3"
                      >
                        <div className="flex items-center gap-3">
                          {item.menuItem.imageUrl && (
                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.menuItem.imageUrl}
                                alt={item.menuItem.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">
                              {item.menuItem.name}
                            </h4>
                            {item.selectedSize && (
                              <p className="text-xs text-muted-foreground">{item.selectedSize.name}</p>
                            )}
                            <p className="text-sm font-semibold text-primary">
                              ${(getItemPrice(item) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-8 h-8 border-border/50"
                              onClick={() => updateCartQuantity(item.id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-8 h-8 border-border/50"
                              onClick={() => updateCartQuantity(item.id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Menu View */
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {menuItems.length === 0 
                        ? "No menu items available yet"
                        : "No items match your search"
                      }
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-background/50 rounded-xl border border-border/30 overflow-hidden hover:border-primary/30 transition-colors"
                    >
                      <div className="p-3">
                        <div className="flex gap-3">
                          {/* Image */}
                          {item.imageUrl && (
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border/20">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground truncate">
                                  {item.name}
                                </h3>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                    {item.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1.5">
                                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                                    {item.category}
                                  </Badge>
                                  {item.preparationTime && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {item.preparationTime}m
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Price and Add Button */}
                            <div className="flex items-center justify-between mt-2">
                              <p className="font-bold text-lg text-primary">
                                ${item.basePrice.toFixed(2)}
                              </p>
                              
                              {item.sizes.length > 0 ? (
                                <div className="flex gap-1">
                                  {item.sizes.map((size) => (
                                    <Button
                                      key={size.id}
                                      size="sm"
                                      variant="outline"
                                      className="text-xs px-2 py-1 h-7 border-primary/30 hover:bg-primary hover:text-primary-foreground"
                                      onClick={() => addToCart(item, size)}
                                    >
                                      {size.name} ${size.price.toFixed(0)}
                                    </Button>
                                  ))}
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90"
                                  onClick={() => addToCart(item, null)}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </ScrollArea>

          {/* Footer - Checkout */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-border/30 bg-secondary/95 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-lg font-bold text-foreground">${cartTotal.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Tax (10%)</p>
                  <p className="text-sm text-muted-foreground">${(cartTotal * 0.1).toFixed(2)}</p>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-primary-foreground font-semibold py-6"
                onClick={placeOrder}
                disabled={placingOrder}
              >
                {placingOrder ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Placing Order...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Place Order - ${(cartTotal * 1.1).toFixed(2)}
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerMenuModal;
