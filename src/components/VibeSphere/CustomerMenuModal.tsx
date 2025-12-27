import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

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

interface CustomerMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId: string;
  venueName: string;
}

const CustomerMenuModal = ({ isOpen, onClose, venueId, venueName }: CustomerMenuModalProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
        .order("created_at", { ascending: false });

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
      
      // Extract unique categories
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

  // Realtime subscription
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

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
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
          className="relative w-full max-w-lg max-h-[85vh] bg-secondary/95 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-border/30 sticky top-0 bg-secondary/95 backdrop-blur-xl z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-foreground">{venueName}</h2>
                <p className="text-sm text-muted-foreground">Menu</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>

            {/* Category Tabs */}
            {categories.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Badge>
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <ScrollArea className="h-[60vh]">
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
                  <div
                    key={item.id}
                    className="bg-background/50 rounded-xl border border-border/30 overflow-hidden"
                  >
                    <div 
                      className="p-3 cursor-pointer"
                      onClick={() => toggleExpanded(item.id)}
                    >
                      <div className="flex gap-3">
                        {/* Image */}
                        {item.imageUrl && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
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
                            <div>
                              <h3 className="font-semibold text-foreground truncate">
                                {item.name}
                              </h3>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {item.category}
                              </Badge>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-primary">
                                ${item.basePrice.toFixed(2)}
                              </p>
                              {item.preparationTime && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  {item.preparationTime}m
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Expand indicator */}
                          {(item.description || item.sizes.length > 0) && (
                            <div className="flex items-center justify-end mt-2">
                              {expandedItems.has(item.id) ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded content */}
                    {expandedItems.has(item.id) && (
                      <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border/20">
                        {item.description && (
                          <p className="text-sm text-muted-foreground pt-2">
                            {item.description}
                          </p>
                        )}
                        
                        {item.sizes.length > 0 && (
                          <div className="pt-2">
                            <p className="text-xs text-muted-foreground mb-2">Available sizes:</p>
                            <div className="flex flex-wrap gap-2">
                              {item.sizes.map((size) => (
                                <Badge key={size.id} variant="outline" className="text-xs">
                                  {size.name}: ${size.price.toFixed(2)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerMenuModal;
