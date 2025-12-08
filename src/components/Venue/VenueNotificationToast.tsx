import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, MessageCircle, DollarSign, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VenueNotification {
  id: string;
  type: 'order' | 'message' | 'sale' | 'checkin' | 'general';
  title: string;
  message: string;
  timestamp: Date;
}

// Simulated notifications for demo
const simulatedNotifications: Omit<VenueNotification, 'id' | 'timestamp'>[] = [
  { type: 'order', title: 'New Order', message: 'Order #1048 from Table 7 - $45.50' },
  { type: 'message', title: 'Customer Message', message: 'Sarah M. is asking about reservations' },
  { type: 'sale', title: 'Sales Milestone', message: 'You\'ve reached $5,000 in sales today!' },
  { type: 'checkin', title: 'New Check-in', message: 'VIP guest Mike J. just checked in' },
  { type: 'order', title: 'Order Ready', message: 'Order #1045 is ready for pickup' },
];

export default function VenueNotificationToast() {
  const [notifications, setNotifications] = useState<VenueNotification[]>([]);

  useEffect(() => {
    // Check if notifications are enabled
    const savedSettings = localStorage.getItem('venue_notification_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : { enabled: true };
    
    if (!settings.enabled) return;

    // Simulate incoming notifications
    const interval = setInterval(() => {
      const randomNotif = simulatedNotifications[Math.floor(Math.random() * simulatedNotifications.length)];
      const newNotif: VenueNotification = {
        ...randomNotif,
        id: Date.now().toString(),
        timestamp: new Date()
      };

      setNotifications(prev => [...prev.slice(-2), newNotif]); // Keep max 3

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 5000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: VenueNotification['type']) => {
    switch (type) {
      case 'order': return ShoppingCart;
      case 'message': return MessageCircle;
      case 'sale': return DollarSign;
      case 'checkin': return Users;
      default: return Bell;
    }
  };

  const getColor = (type: VenueNotification['type']) => {
    switch (type) {
      case 'order': return 'from-orange-500 to-red-500';
      case 'message': return 'from-blue-500 to-cyan-500';
      case 'sale': return 'from-green-500 to-emerald-500';
      case 'checkin': return 'from-purple-500 to-pink-500';
      default: return 'from-primary to-primary';
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 left-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => {
          const Icon = getIcon(notif.type);
          
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <div className="w-80 bg-background/95 backdrop-blur-lg border border-border rounded-lg shadow-xl overflow-hidden">
                {/* Gradient accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${getColor(notif.type)}`} />
                
                <div className="p-4 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getColor(notif.type)} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{notif.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{notif.message}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mr-2 -mt-1"
                    onClick={() => dismissNotification(notif.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}