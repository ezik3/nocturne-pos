import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Clock } from "lucide-react";

const weeklyData = [
  { day: "Mon", revenue: 2400, orders: 89 },
  { day: "Tue", revenue: 2100, orders: 76 },
  { day: "Wed", revenue: 3200, orders: 112 },
  { day: "Thu", revenue: 2800, orders: 95 },
  { day: "Fri", revenue: 4500, orders: 156 },
  { day: "Sat", revenue: 5200, orders: 178 },
  { day: "Sun", revenue: 3100, orders: 98 },
];

const topItems = [
  { name: "Espresso Martini", sales: 234, revenue: "$4,212" },
  { name: "Margarita", sales: 198, revenue: "$3,168" },
  { name: "Loaded Fries", sales: 156, revenue: "$2,184" },
  { name: "Corona", sales: 145, revenue: "$1,305" },
  { name: "Old Fashioned", sales: 123, revenue: "$2,337" },
];

export default function VenueAnalytics() {
  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your venue performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Weekly Revenue", value: "$23,300", change: "+12%", up: true, icon: DollarSign },
          { title: "Total Orders", value: "804", change: "+8%", up: true, icon: ShoppingCart },
          { title: "Unique Visitors", value: "1,247", change: "+15%", up: true, icon: Users },
          { title: "Avg Order Time", value: "8.2 min", change: "-2 min", up: true, icon: Clock },
        ].map((metric) => (
          <Card key={metric.title} className="glass border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <metric.icon className="h-8 w-8 text-primary opacity-80" />
                {metric.up ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-2xl font-bold mt-4">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.title}</p>
              <p className={`text-xs mt-1 ${metric.up ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change} vs last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48">
              {weeklyData.map((data) => (
                <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/80 rounded-t-md transition-all hover:bg-primary"
                    style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{data.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div key={item.name} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sales} sold</p>
                  </div>
                  <span className="font-bold text-primary">{item.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle>Peak Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 24 }, (_, i) => {
              const intensity = i >= 18 && i <= 23 ? 0.8 + Math.random() * 0.2 
                : i >= 12 && i <= 14 ? 0.4 + Math.random() * 0.2 
                : 0.1 + Math.random() * 0.2;
              return (
                <div key={i} className="text-center">
                  <div
                    className="h-16 rounded-md mb-1"
                    style={{ 
                      backgroundColor: `hsl(var(--primary) / ${intensity})`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {i.toString().padStart(2, '0')}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
