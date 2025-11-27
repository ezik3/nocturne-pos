import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Utensils,
  Star,
  Bell
} from "lucide-react";

const stats = [
  { title: "Live Customers", value: "47", change: "+12%", icon: Users, color: "text-primary" },
  { title: "Today's Revenue", value: "$3,842", change: "+8%", icon: DollarSign, color: "text-green-500" },
  { title: "Avg Wait Time", value: "12 min", change: "-3 min", icon: Clock, color: "text-yellow-500" },
  { title: "Orders Today", value: "164", change: "+23%", icon: Utensils, color: "text-blue-500" },
];

const recentActivity = [
  { type: "order", message: "New order #1247 from Table 12", time: "2 min ago" },
  { type: "reservation", message: "Reservation confirmed for 8 PM (6 guests)", time: "15 min ago" },
  { type: "review", message: "New 5-star review received", time: "1 hour ago" },
  { type: "staff", message: "Sarah clocked in for evening shift", time: "2 hours ago" },
];

export default function VenueDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Venue Dashboard</h1>
          <p className="text-muted-foreground">The Electric Lounge • Live Overview</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2 bg-green-500/20 text-green-500">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Open Now
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-green-500 mt-1">{stat.change} vs yesterday</p>
                </div>
                <stat.icon className={`h-10 w-10 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Floor View */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Live Floor Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(16)].map((_, i) => {
                const isOccupied = Math.random() > 0.4;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
                      isOccupied 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'bg-muted/30 text-muted-foreground border border-border'
                    }`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary/20 border border-primary/30" />
                <span className="text-muted-foreground">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted/30 border border-border" />
                <span className="text-muted-foreground">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Send Notification", icon: Bell },
              { label: "View Reviews", icon: Star },
              { label: "Update Menu", icon: Utensils },
              { label: "View Analytics", icon: TrendingUp },
            ].map((action) => (
              <button
                key={action.label}
                className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-center"
              >
                <action.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <span className="text-sm">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
