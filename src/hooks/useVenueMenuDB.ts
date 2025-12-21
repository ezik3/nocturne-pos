import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MenuItemSize {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
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

const DEFAULT_CATEGORIES = ["Drinks", "Food", "Desserts"];

export function useVenueMenuDB(venueId: string | null) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Fetch menu items from database
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
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to load menu items");
    }

    setLoading(false);
  }, [venueId]);

  // Fetch categories from database
  const fetchCategories = useCallback(async () => {
    if (!venueId) return;

    try {
      const { data, error } = await supabase
        .from("venue_menu_categories")
        .select("name")
        .eq("venue_id", venueId)
        .order("sort_order");

      if (error) throw error;

      if (data && data.length > 0) {
        setCategories(data.map((c: any) => c.name));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, [venueId]);

  // Load on mount
  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, [fetchMenuItems, fetchCategories]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!venueId) return;

    const channel = supabase
      .channel(`menu-${venueId}`)
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
  }, [venueId, fetchMenuItems]);

  // Add or update item
  const saveItem = useCallback(
    async (item: MenuItem) => {
      if (!venueId) return;

      const exists = menuItems.find((m) => m.id === item.id);

      const dbItem = {
        venue_id: venueId,
        name: item.name,
        description: item.description,
        category: item.category,
        base_price: item.basePrice,
        sizes: JSON.parse(JSON.stringify(item.sizes)) as any,
        image_url: item.imageUrl,
        available: item.available,
        preparation_time: item.preparationTime,
      };

      try {
        if (exists) {
          const { error } = await supabase
            .from("venue_menu_items")
            .update(dbItem)
            .eq("id", item.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("venue_menu_items")
            .insert([{ ...dbItem, id: item.id }]);
          if (error) throw error;
        }
        fetchMenuItems();
      } catch (error) {
        console.error("Error saving menu item:", error);
        toast.error("Failed to save menu item");
      }
    },
    [venueId, menuItems, fetchMenuItems]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("venue_menu_items")
          .delete()
          .eq("id", id);
        if (error) throw error;
        fetchMenuItems();
      } catch (error) {
        console.error("Error deleting menu item:", error);
        toast.error("Failed to delete menu item");
      }
    },
    [fetchMenuItems]
  );

  const toggleAvailability = useCallback(
    async (id: string) => {
      const item = menuItems.find((m) => m.id === id);
      if (!item) return;

      try {
        const { error } = await supabase
          .from("venue_menu_items")
          .update({ available: !item.available })
          .eq("id", id);
        if (error) throw error;
        fetchMenuItems();
      } catch (error) {
        console.error("Error toggling availability:", error);
        toast.error("Failed to update availability");
      }
    },
    [menuItems, fetchMenuItems]
  );

  const addCategory = useCallback(
    async (category: string) => {
      if (!venueId || categories.includes(category)) return;

      try {
        const { error } = await supabase
          .from("venue_menu_categories")
          .insert({ venue_id: venueId, name: category });
        if (error) throw error;
        setCategories([...categories, category]);
      } catch (error) {
        console.error("Error adding category:", error);
      }
    },
    [venueId, categories]
  );

  const setAllCategories = useCallback(
    async (cats: string[]) => {
      if (!venueId) return;

      // Delete existing and re-insert
      try {
        await supabase
          .from("venue_menu_categories")
          .delete()
          .eq("venue_id", venueId);

        if (cats.length > 0) {
          const inserts = cats.map((name, i) => ({
            venue_id: venueId,
            name,
            sort_order: i,
          }));
          await supabase.from("venue_menu_categories").insert(inserts);
        }
        setCategories(cats);
      } catch (error) {
        console.error("Error updating categories:", error);
      }
    },
    [venueId]
  );

  return {
    menuItems,
    categories,
    loading,
    saveItem,
    deleteItem,
    toggleAvailability,
    addCategory,
    setAllCategories,
    refreshMenu: fetchMenuItems,
  };
}
