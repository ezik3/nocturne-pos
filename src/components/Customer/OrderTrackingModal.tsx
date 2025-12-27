import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2, Truck, ChefHat, Package, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  orderType: "pickup" | "delivery";
}

type OrderStatus = 
  | "pending" 
  | "venue_confirmed" 
  | "preparing" 
  | "ready_for_pickup" 
  | "on_the_way" 
  | "delivered" 
  | "completed"
  | "cancelled";

interface OrderDetails {
  id: string;
  order_number: number;
  status: OrderStatus;
  total: number;
  created_at: string;
  venue_name?: string;
  delivery_address?: string;
  estimated_time?: string;
  driver_name?: string;
}

const statusSteps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: "pending", label: "Order Placed", icon: <Clock className="w-5 h-5" /> },
  { status: "venue_confirmed", label: "Venue Confirmed", icon: <CheckCircle2 className="w-5 h-5" /> },
  { status: "preparing", label: "Preparing", icon: <ChefHat className="w-5 h-5" /> },
  { status: "ready_for_pickup", label: "Ready", icon: <Package className="w-5 h-5" /> },
  { status: "on_the_way", label: "On The Way", icon: <Truck className="w-5 h-5" /> },
  { status: "delivered", label: "Delivered", icon: <MapPin className="w-5 h-5" /> },
];

const pickupSteps = statusSteps.filter(s => 
  ["pending", "venue_confirmed", "preparing", "ready_for_pickup", "completed"].includes(s.status)
);

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderType
}) => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const steps = orderType === "delivery" ? statusSteps : pickupSteps;

  const currentStepIndex = order 
    ? steps.findIndex(s => s.status === order.status)
    : 0;

  useEffect(() => {
    if (!orderId || !isOpen) return;

    const fetchOrder = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (data && !error) {
        setOrder({
          id: data.id,
          order_number: data.order_number,
          status: data.status as OrderStatus,
          total: data.total || 0,
          created_at: data.created_at || "",
        });
      }
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          if (payload.new) {
            setOrder(prev => prev ? {
              ...prev,
              status: payload.new.status as OrderStatus,
            } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg">
                  {orderType === "delivery" ? "Delivery" : "Pickup"} Order
                </h2>
                {order && (
                  <p className="text-white/80 text-sm">Order #{order.order_number}</p>
                )}
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : order ? (
              <>
                {/* Status Timeline */}
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div key={step.status} className="flex items-center gap-4">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${isCompleted 
                            ? "bg-green-500 text-white" 
                            : "bg-muted text-muted-foreground"
                          }
                          ${isCurrent ? "ring-2 ring-green-500 ring-offset-2 ring-offset-background" : ""}
                        `}>
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-muted-foreground animate-pulse">
                              In progress...
                            </p>
                          )}
                        </div>
                        {isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Order Info */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Total</span>
                    <span className="font-bold">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Placed At</span>
                    <span className="text-sm">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Status Message */}
                <div className={`rounded-xl p-4 text-center ${
                  order.status === "delivered" || order.status === "completed"
                    ? "bg-green-500/10 border border-green-500/30"
                    : order.status === "cancelled"
                    ? "bg-red-500/10 border border-red-500/30"
                    : "bg-primary/10 border border-primary/30"
                }`}>
                  {order.status === "pending" && (
                    <p>Waiting for venue to confirm your order...</p>
                  )}
                  {order.status === "venue_confirmed" && (
                    <p>Venue has accepted! Preparation starting soon.</p>
                  )}
                  {order.status === "preparing" && (
                    <p>Your order is being prepared with care 👨‍🍳</p>
                  )}
                  {order.status === "ready_for_pickup" && orderType === "pickup" && (
                    <p className="text-green-500 font-bold">Your order is ready for pickup!</p>
                  )}
                  {order.status === "ready_for_pickup" && orderType === "delivery" && (
                    <p>Ready! Waiting for driver pickup...</p>
                  )}
                  {order.status === "on_the_way" && (
                    <p className="text-primary">Your order is on the way! 🚗</p>
                  )}
                  {(order.status === "delivered" || order.status === "completed") && (
                    <p className="text-green-500 font-bold">Order complete! Enjoy! 🎉</p>
                  )}
                  {order.status === "cancelled" && (
                    <p className="text-red-500">Order was cancelled</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Order not found
              </div>
            )}

            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
