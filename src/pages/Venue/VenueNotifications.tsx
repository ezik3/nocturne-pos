import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, ShoppingCart, Users, AlertTriangle, CheckCircle } from "lucide-react";

const notifications = [
  { id: "1", type: "order", title: "New Order Received", message: "Table 5 placed an order for $86.50", time: "2 min ago", read: false },
  { id: "2", type: "staff", title: "Staff Clocked In", message: "John Doe has started their shift", time: "15 min ago", read: false },
  { id: "3", type: "alert", title: "Low Stock Alert", message: "House Wine is running low (5 remaining)", time: "1 hour ago", read: true },
  { id: "4", type: "order", title: "Order Ready", message: "Order #1232 is ready for pickup", time: "2 hours ago", read: true },
  { id: "5", type: "success", title: "Payment Received", message: "Table 2 payment of $142.00 completed", time: "3 hours ago", read: true },
];

const iconMap: Record<string, typeof Bell> = {
  order: ShoppingCart,
  staff: Users,
  alert: AlertTriangle,
  success: CheckCircle,
};

const colorMap: Record<string, string> = {
  order: "bg-blue-500/20 text-blue-400",
  staff: "bg-purple-500/20 text-purple-400",
  alert: "bg-yellow-500/20 text-yellow-400",
  success: "bg-green-500/20 text-green-400",
};

export default function VenueNotifications() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with venue activity</p>
        </div>
        <Button variant="outline" className="border-border">
          Mark All Read
        </Button>
      </div>

      <Card className="glass border-border">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {notifications.map((notif) => {
              const Icon = iconMap[notif.type];
              return (
                <div
                  key={notif.id}
                  className={`p-4 flex items-start gap-4 hover:bg-secondary/20 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                >
                  <div className={`p-2 rounded-full ${colorMap[notif.type]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{notif.title}</p>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
