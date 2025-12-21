import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  size?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableNumber: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "served" | "cancelled";
  createdAt: string;
  customerName?: string;
  source: "pos" | "ai" | "customer";
  priority: "normal" | "rush";
}

export function useVenueOrdersDB(venueId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from database
  const fetchOrders = useCallback(async () => {
    if (!venueId) {
      setLoading(false);
      return;
    }

    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedOrders: Order[] = (ordersData || []).map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        tableNumber: o.table_number || "",
        items: (o.order_items || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          notes: item.notes,
        })),
        total: Number(o.total) || 0,
        status: o.status || "pending",
        createdAt: o.created_at,
        customerName: o.customer_name,
        source: "pos",
        priority: o.priority || "normal",
      }));

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }

    setLoading(false);
  }, [venueId]);

  // Load on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!venueId) return;

    const channel = supabase
      .channel(`orders-${venueId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `venue_id=eq.${venueId}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId, fetchOrders]);

  // Add a new order
  const addOrder = useCallback(
    async (
      orderData: Omit<Order, "id" | "orderNumber" | "createdAt">
    ): Promise<Order | null> => {
      if (!venueId) return null;

      try {
        // Create order
        const { data: newOrder, error: orderError } = await supabase
          .from("orders")
          .insert({
            venue_id: venueId,
            table_number: orderData.tableNumber,
            customer_name: orderData.customerName,
            status: orderData.status,
            priority: orderData.priority,
            total: orderData.total,
            subtotal: orderData.total * 0.9, // Approximate subtotal
            tax: orderData.total * 0.1,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        if (orderData.items.length > 0) {
          const itemsToInsert = orderData.items.map((item) => ({
            order_id: newOrder.id,
            menu_item_id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
          }));

          const { error: itemsError } = await supabase
            .from("order_items")
            .insert(itemsToInsert);

          if (itemsError) throw itemsError;
        }

        toast.success(`Order #${newOrder.order_number} created!`);
        fetchOrders();

        return {
          ...orderData,
          id: newOrder.id,
          orderNumber: newOrder.order_number,
          createdAt: newOrder.created_at,
        };
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Failed to create order");
        return null;
      }
    },
    [venueId, fetchOrders]
  );

  // Update order status
  const updateOrderStatus = useCallback(
    async (orderId: string, status: Order["status"]) => {
      try {
        const { error } = await supabase
          .from("orders")
          .update({ status })
          .eq("id", orderId);

        if (error) throw error;
        fetchOrders();
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("Failed to update order status");
      }
    },
    [fetchOrders]
  );

  // Get orders by status
  const getOrdersByStatus = useCallback(
    (status: Order["status"]) => {
      return orders.filter((o) => o.status === status);
    },
    [orders]
  );

  // Get recent orders (last 24 hours)
  const getRecentOrders = useCallback(
    (limit: number = 10) => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      return orders.filter((o) => o.createdAt > dayAgo).slice(0, limit);
    },
    [orders]
  );

  // Get kitchen orders (pending + preparing)
  const getKitchenOrders = useCallback(() => {
    return orders.filter(
      (o) => o.status === "pending" || o.status === "preparing"
    );
  }, [orders]);

  // Stats
  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    served: orders.filter((o) => o.status === "served").length,
    total: orders.length,
    todayRevenue: orders
      .filter(
        (o) =>
          o.status === "served" &&
          o.createdAt > new Date().toISOString().split("T")[0]
      )
      .reduce((sum, o) => sum + o.total, 0),
  };

  return {
    orders,
    loading,
    addOrder,
    updateOrderStatus,
    getOrdersByStatus,
    getRecentOrders,
    getKitchenOrders,
    stats,
    refreshOrders: fetchOrders,
  };
}
