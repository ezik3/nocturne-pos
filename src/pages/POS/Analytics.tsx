import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Clock, DollarSign } from "lucide-react";

export default function Analytics() {
  const weeklyData = [
    { day: "Mon", revenue: 3200, orders: 54 },
    { day: "Tue", revenue: 2800, orders: 48 },
    { day: "Wed", revenue: 3600, orders: 62 },
    { day: "Thu", revenue: 4100, orders: 71 },
    { day: "Fri", revenue: 5800, orders: 95 },
    { day: "Sat", revenue: 6500, orders: 108 },
    { day: "Sun", revenue: 4900, orders: 82 },
  ];

  const peakHours = [
    { hour: "11 AM - 12 PM", orders: 45 },
    { hour: "12 PM - 1 PM", orders: 62 },
    { hour: "1 PM - 2 PM", orders: 58 },
    { hour: "6 PM - 7 PM", orders: 71 },
    { hour: "7 PM - 8 PM", orders: 89 },
    { hour: "8 PM - 9 PM", orders: 95 },
  ];

  const categoryBreakdown = [
    { category: "Cocktails", revenue: 12500, percentage: 35 },
    { category: "Food", revenue: 9800, percentage: 28 },
    { category: "Wine", revenue: 7200, percentage: 20 },
    { category: "Beer", revenue: 4300, percentage: 12 },
    { category: "Non-Alcoholic", revenue: 1800, percentage: 5 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Deep insights into venue performance</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass glass-hover border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Weekly Revenue
                </CardTitle>
                <DollarSign className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$30,900</div>
                <p className="text-xs text-accent mt-1">+18.2% from last week</p>
              </CardContent>
            </Card>

            <Card className="glass glass-hover border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">520</div>
                <p className="text-xs text-accent mt-1">+12.5% from last week</p>
              </CardContent>
            </Card>

            <Card className="glass glass-hover border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Order Value
                </CardTitle>
                <DollarSign className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$59.42</div>
                <p className="text-xs text-accent mt-1">+5.1% from last week</p>
              </CardContent>
            </Card>

            <Card className="glass glass-hover border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Peak Day
                </CardTitle>
                <Clock className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">Saturday</div>
                <p className="text-xs text-accent mt-1">$6,500 revenue</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyData.map(day => {
                    const maxRevenue = Math.max(...weeklyData.map(d => d.revenue));
                    const percentage = (day.revenue / maxRevenue) * 100;
                    
                    return (
                      <div key={day.day}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{day.day}</span>
                          <div className="text-right">
                            <span className="font-semibold text-primary">${day.revenue}</span>
                            <span className="text-muted-foreground ml-2">({day.orders} orders)</span>
                          </div>
                        </div>
                        <div className="h-3 bg-secondary/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {peakHours.map(hour => {
                    const maxOrders = Math.max(...peakHours.map(h => h.orders));
                    const percentage = (hour.orders / maxOrders) * 100;
                    
                    return (
                      <div key={hour.hour}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{hour.hour}</span>
                          <span className="font-semibold">{hour.orders} orders</span>
                        </div>
                        <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-accent to-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-border">
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryBreakdown.map(cat => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{cat.category}</span>
                      <div>
                        <span className="font-semibold text-primary">${cat.revenue}</span>
                        <span className="text-muted-foreground ml-2">({cat.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-3 bg-secondary/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card className="glass border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Revenue analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card className="glass border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Customer analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="glass border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Product analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
