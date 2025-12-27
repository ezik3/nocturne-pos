import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Minus, ShoppingCart, Trash2, Flame, MapPin, Truck, ShoppingBag, UtensilsCrossed, Clock, ChefHat, CheckCircle2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useDeliveryFee } from "@/hooks/useDeliveryFee";
import { OrderTrackingModal } from "./OrderTrackingModal";
import { AddressAutocomplete } from "./AddressAutocomplete";
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

interface RemoteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId: string;
  venueName: string;
  venueLatitude?: number;
  venueLongitude?: number;
  venueAddress?: string;
  deliveryEnabled?: boolean;
  maxDeliveryRadius?: number;
  initialDeliveryFee?: number;
  distanceToUser?: number;
}

type OrderType = "pickup" | "delivery";

const RemoteOrderModal = ({ 
  isOpen, 
  onClose, 
  venueId, 
  venueName,
  venueLatitude,
  venueLongitude,
  venueAddress,
  deliveryEnabled = true,
  maxDeliveryRadius = 20,
  initialDeliveryFee = 0,
  distanceToUser
}: RemoteOrderModalProps) => {
  const { user } = useAuth();
  const { latitude: userLat, longitude: userLng } = useGeolocation({ enableHighAccuracy: true });
  const { calculateDeliveryFee, calculateDistance } = useDeliveryFee();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  
  // Order type and delivery details
  const [orderType, setOrderType] = useState<OrderType>(deliveryEnabled ? "delivery" : "pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  
  // Calculate delivery fee
  const distance = distanceToUser || (
    venueLatitude && venueLongitude && userLat && userLng
      ? calculateDistance(venueLatitude, venueLongitude, userLat, userLng)
      : 0
  );
  const deliveryFeeCalc = calculateDeliveryFee(distance);
  const deliveryFee = orderType === "delivery" ? deliveryFeeCalc.fare : 0;

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

  const cartSubtotal = cart.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
  const cartTax = cartSubtotal * 0.1;
  const cartTotal = cartSubtotal + cartTax + deliveryFee;
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

    if (orderType === "delivery" && !deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    setPlacingOrder(true);
    
    try {
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          venue_id: venueId,
          customer_name: user.email?.split('@')[0] || 'Customer',
          subtotal: cartSubtotal,
          tax: cartTax,
          total: cartTotal,
          status: 'pending',
          notes: orderType === "delivery" 
            ? `DELIVERY ORDER - Address: ${deliveryAddress}${deliveryNotes ? ` | Notes: ${deliveryNotes}` : ''}`
            : `PICKUP ORDER${deliveryNotes ? ` | Notes: ${deliveryNotes}` : ''}`
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

      // If delivery, create food_delivery_orders entry
      if (orderType === "delivery") {
        const { error: deliveryError } = await supabase
          .from("food_delivery_orders")
          .insert({
            order_id: order.id,
            customer_id: user.id,
            venue_id: venueId,
            pickup_address: venueAddress || venueName,
            pickup_latitude: venueLatitude,
            pickup_longitude: venueLongitude,
            delivery_address: deliveryAddress,
            delivery_latitude: deliveryCoordinates?.lat || userLat,
            delivery_longitude: deliveryCoordinates?.lng || userLng,
            delivery_fee: deliveryFee,
            calculated_delivery_fee: deliveryFee,
            driver_earnings: deliveryFeeCalc.driverEarnings,
            platform_fee: deliveryFeeCalc.platformFee,
            special_instructions: deliveryNotes,
            status: 'pending'
          });

        if (deliveryError) {
          console.error("Delivery order error:", deliveryError);
        }
      }

      toast.success(
        orderType === "delivery" 
          ? "Order placed! Waiting for venue confirmation..." 
          : "Order placed! Waiting for venue to prepare it."
      );
      setPlacedOrderId(order.id);
      setShowTracking(true);
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
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div 
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div
          className="relative w-full max-w-md h-[90vh] sm:h-[85vh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="relative p-5 pb-4 bg-gradient-to-b from-slate-800/80 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{venueName}</h2>
                <p className="text-sm text-white/50 flex items-center gap-1">
                  {distance > 0 && <><MapPin className="w-3 h-3" /> {distance.toFixed(1)} km away</>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button 
                  className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/30"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCart(!showCart)}
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                  {cartItemCount > 0 && (
                    <motion.span 
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </motion.button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10"
                  onClick={onClose}
                >
                  <X className="w-5 h-5 text-white/70" />
                </Button>
              </div>
            </div>

            {/* Order Type Selector */}
            {!showCart && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setOrderType("pickup")}
                  className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    orderType === "pickup"
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Pickup
                </button>
                {deliveryEnabled && (
                  <button
                    onClick={() => setOrderType("delivery")}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                      orderType === "delivery"
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Delivery (${deliveryFee.toFixed(2)})
                  </button>
                )}
              </div>
            )}

            {!showCart && (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-white/5 border-0 rounded-2xl text-white placeholder:text-white/40 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {categories.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                        selectedCategory === null 
                          ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      All
                    </motion.button>
                    {categories.map((cat) => (
                      <motion.button
                        key={cat}
                        whileTap={{ scale: 0.95 }}
                        className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                          selectedCategory === cat 
                            ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </motion.button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {showCart ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Your Order</h3>
                  <button 
                    className="text-sm text-primary"
                    onClick={() => setShowCart(false)}
                  >
                    ← Back to Menu
                  </button>
                </div>

                {/* Order Type Badge */}
                <div className={`py-2 px-4 rounded-xl text-center ${
                  orderType === "delivery" 
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}>
                  {orderType === "delivery" ? (
                    <span className="flex items-center justify-center gap-2">
                      <Truck className="w-4 h-4" /> Delivery Order
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingBag className="w-4 h-4" /> Pickup Order
                    </span>
                  )}
                </div>

                {/* Delivery Address Input - FIRST at top */}
                {orderType === "delivery" && (
                  <div className="space-y-3 bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
                    <div>
                      <Label className="text-white/70 text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        Delivery Address *
                      </Label>
                      <AddressAutocomplete
                        value={deliveryAddress}
                        onChange={(address, coords) => {
                          setDeliveryAddress(address);
                          if (coords) setDeliveryCoordinates(coords);
                        }}
                        placeholder="Start typing your address..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">Special Instructions (optional)</Label>
                      <Textarea
                        placeholder="Any special delivery instructions?"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[60px]"
                      />
                    </div>
                  </div>
                )}
                
                {cart.length === 0 ? (
                  <motion.div 
                    className="text-center py-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10 text-white/20" />
                    </div>
                    <p className="text-white/50 text-lg">Your cart is empty</p>
                    <Button 
                      className="mt-6 bg-primary hover:bg-primary/90 rounded-full px-8"
                      onClick={() => setShowCart(false)}
                    >
                      Browse Menu
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/5 rounded-2xl p-4 border border-white/5"
                      >
                        <div className="flex gap-4">
                          {item.menuItem.imageUrl ? (
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                              <img
                                src={item.menuItem.imageUrl}
                                alt={item.menuItem.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <Flame className="w-6 h-6 text-primary/50" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white truncate text-sm">{item.menuItem.name}</h4>
                            {item.selectedSize && (
                              <p className="text-xs text-white/40">{item.selectedSize.name}</p>
                            )}
                            <p className="text-primary font-bold">${(getItemPrice(item) * item.quantity).toFixed(2)}</p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <button
                              className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center"
                                onClick={() => updateCartQuantity(item.id, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </motion.button>
                              <span className="w-6 text-center font-bold text-white text-sm">{item.quantity}</span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center"
                                onClick={() => updateCartQuantity(item.id, 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-16">
                    <UtensilsCrossed className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No menu items found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all group"
                      >
                        {item.imageUrl ? (
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                            <Flame className="w-12 h-12 text-primary/30" />
                          </div>
                        )}
                        
                        <div className="p-3">
                          <h4 className="font-semibold text-white text-sm truncate">{item.name}</h4>
                          <p className="text-white/40 text-xs line-clamp-1 mt-1">{item.description}</p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-primary font-bold">${item.basePrice.toFixed(2)}</span>
                            
                            {item.sizes && item.sizes.length > 0 ? (
                              <div className="flex gap-1">
                                {item.sizes.slice(0, 3).map((size) => (
                                  <motion.button
                                    key={size.id}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                    onClick={() => addToCart(item, size)}
                                    title={`${size.name} - $${size.price.toFixed(2)}`}
                                  >
                                    {size.name.charAt(0)}
                                  </motion.button>
                                ))}
                              </div>
                            ) : (
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30"
                                onClick={() => addToCart(item, null)}
                              >
                                <Plus className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - Order Summary */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-900/90 border-t border-white/10">
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Tax (10%)</span>
                  <span>${cartTax.toFixed(2)}</span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between text-orange-400">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <Button
                className={`w-full h-14 text-lg font-semibold rounded-xl ${
                  orderType === "delivery"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                }`}
                onClick={showCart ? placeOrder : () => setShowCart(true)}
                disabled={placingOrder || (showCart && orderType === "delivery" && !deliveryAddress.trim())}
              >
                {placingOrder ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Placing Order...
                  </div>
                ) : showCart ? (
                  <>
                    {orderType === "delivery" ? <Truck className="w-5 h-5 mr-2" /> : <ShoppingBag className="w-5 h-5 mr-2" />}
                    Place {orderType === "delivery" ? "Delivery" : "Pickup"} Order
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    View Cart (${cartTotal.toFixed(2)})
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={showTracking}
        onClose={() => {
          setShowTracking(false);
          setPlacedOrderId(null);
          setDeliveryAddress("");
          setDeliveryNotes("");
          onClose();
        }}
        orderId={placedOrderId}
        orderType={orderType}
      />
    </AnimatePresence>
  );
};

export default RemoteOrderModal;
