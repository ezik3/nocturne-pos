import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Clock, DollarSign } from "lucide-react";

export default function Staff() {
  const mockStaff = [
    { 
      id: "1", 
      name: "Sarah Johnson", 
      role: "Manager", 
      status: "active", 
      shift: "10:00 AM - 6:00 PM",
      sales: 1250.00,
      orders: 23,
      clockedIn: true
    },
    { 
      id: "2", 
      name: "Mike Chen", 
      role: "Bartender", 
      status: "active", 
      shift: "2:00 PM - 10:00 PM",
      sales: 890.50,
      orders: 18,
      clockedIn: true
    },
    { 
      id: "3", 
      name: "Emily Rodriguez", 
      role: "Server", 
      status: "active", 
      shift: "5:00 PM - 1:00 AM",
      sales: 1450.75,
      orders: 31,
      clockedIn: true
    },
    { 
      id: "4", 
      name: "James Wilson", 
      role: "Kitchen", 
      status: "break", 
      shift: "11:00 AM - 7:00 PM",
      sales: 0,
      orders: 0,
      clockedIn: true
    },
    { 
      id: "5", 
      name: "Lisa Martinez", 
      role: "Server", 
      status: "off", 
      shift: "Not scheduled",
      sales: 0,
      orders: 0,
      clockedIn: false
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-500";
      case "break": return "bg-yellow-500/20 text-yellow-500";
      case "off": return "bg-muted text-muted-foreground";
      default: return "bg-muted";
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      "Manager": "bg-purple-500/20 text-purple-500",
      "Bartender": "bg-blue-500/20 text-blue-500",
      "Server": "bg-green-500/20 text-green-500",
      "Kitchen": "bg-orange-500/20 text-orange-500",
    };
    return colors[role] || "bg-muted";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const activeStaff = mockStaff.filter(s => s.clockedIn);
  const totalSales = activeStaff.reduce((sum, s) => sum + s.sales, 0);
  const totalOrders = activeStaff.reduce((sum, s) => sum + s.orders, 0);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Staff Management</h1>
          <p className="text-muted-foreground">Manage team members and schedules</p>
        </div>
        <Button className="neon-glow">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass glass-hover border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Staff
            </CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeStaff.length}</div>
            <p className="text-xs text-accent mt-1">Currently clocked in</p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-accent mt-1">This shift</p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders Processed
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrders}</div>
            <p className="text-xs text-accent mt-1">This shift</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStaff.map(staff => (
              <div key={staff.id} className="flex items-center justify-between p-4 glass rounded-lg hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {getInitials(staff.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{staff.name}</h3>
                      <Badge className={getRoleBadge(staff.role)}>{staff.role}</Badge>
                      <Badge className={getStatusColor(staff.status)}>
                        {staff.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {staff.shift}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {staff.clockedIn && staff.sales > 0 && (
                    <>
                      <p className="font-semibold text-primary">${staff.sales.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{staff.orders} orders</p>
                    </>
                  )}
                  {!staff.clockedIn && (
                    <Button size="sm" variant="outline">Clock In</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
