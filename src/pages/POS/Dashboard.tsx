import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { title: "Today's Sales", value: "$2,543.00", icon: DollarSign, trend: "+12.5%" },
    { title: "Orders", value: "48", icon: ShoppingCart, trend: "+8.2%" },
    { title: "Active Tables", value: "12", icon: Users, trend: "+3" },
    { title: "Avg. Order", value: "$52.98", icon: TrendingUp, trend: "+5.3%" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to JV POS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass glass-hover border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-accent mt-1">{stat.trend} from yesterday</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">Order #{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">Table {i}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(45 + i * 10).toFixed(2)}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                      Preparing
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Top Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Signature Cocktail', 'House Wine', 'Premium Beer', 'Appetizer Platter', 'Dessert Special'].map((item, i) => (
                <div key={item} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="font-medium">{item}</span>
                  <span className="text-sm text-muted-foreground">{24 - i * 3} sold</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
