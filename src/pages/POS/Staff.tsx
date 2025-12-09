import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Clock, DollarSign, Search, TrendingUp, Calendar } from "lucide-react";
import StaffInviteModal from "@/components/Venue/StaffInviteModal";

// Mock staff data
const mockStaff = [
  { 
    id: "1", 
    name: "Sarah Johnson", 
    initials: "SJ",
    role: "Manager", 
    status: "active", 
    shift: "10:00 AM - 6:00 PM",
    sales: 1250.00,
    orders: 23,
    clockedIn: true,
    performance: 98,
    hoursWeek: 40,
    shifts: [
      { day: "Mon", time: "9AM - 5PM" },
      { day: "Tue", time: "9AM - 5PM" },
      { day: "Wed", time: "9AM - 5PM" },
      { day: "Thu", time: "9AM - 5PM" },
      { day: "Fri", time: "9AM - 5PM" }
    ]
  },
  { 
    id: "2", 
    name: "Mike Chen", 
    initials: "MC",
    role: "Bartender", 
    status: "active", 
    shift: "2:00 PM - 10:00 PM",
    sales: 890.50,
    orders: 18,
    clockedIn: true,
    performance: 95,
    hoursWeek: 32,
    shifts: [
      { day: "Tue", time: "2PM - 10PM" },
      { day: "Thu", time: "2PM - 10PM" },
      { day: "Sat", time: "4PM - 12AM" }
    ]
  },
  { 
    id: "3", 
    name: "Emily Rodriguez", 
    initials: "ER",
    role: "Server", 
    status: "active", 
    shift: "5:00 PM - 1:00 AM",
    sales: 1450.75,
    orders: 31,
    clockedIn: true,
    performance: 92,
    hoursWeek: 25,
    shifts: [
      { day: "Wed", time: "11AM - 7PM" },
      { day: "Fri", time: "12PM - 8PM" }
    ]
  },
  { 
    id: "4", 
    name: "James Wilson", 
    initials: "JW",
    role: "Kitchen", 
    status: "break", 
    shift: "11:00 AM - 7:00 PM",
    sales: 0,
    orders: 0,
    clockedIn: true,
    performance: 88,
    hoursWeek: 35,
    shifts: [
      { day: "Mon", time: "11AM - 7PM" },
      { day: "Wed", time: "11AM - 7PM" },
      { day: "Fri", time: "11AM - 7PM" }
    ]
  },
  { 
    id: "5", 
    name: "Lisa Martinez", 
    initials: "LM",
    role: "Server", 
    status: "off", 
    shift: "Not scheduled",
    sales: 0,
    orders: 0,
    clockedIn: false,
    performance: 90,
    hoursWeek: 0,
    shifts: []
  },
];

export default function Staff() {
  const [activeTab, setActiveTab] = useState("management");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInviteModal, setShowInviteModal] = useState(false);

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

  const filteredStaff = mockStaff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Staff Management</h1>
          <p className="text-muted-foreground">Manage team members, schedules, and performance</p>
        </div>
        <Button className="neon-glow" onClick={() => setShowInviteModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <StaffInviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />

      {/* Stats Cards */}
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

      {/* Main Tabs - Management & Roster */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="management">Staff Management</TabsTrigger>
          <TabsTrigger value="roster">Weekly Roster</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Bartender">Bartender</SelectItem>
              <SelectItem value="Server">Server</SelectItem>
              <SelectItem value="Kitchen">Kitchen</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="break">On Break</SelectItem>
              <SelectItem value="off">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Staff Management Tab */}
        <TabsContent value="management">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStaff.map(staff => (
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
        </TabsContent>

        {/* Weekly Roster Tab */}
        <TabsContent value="roster">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Roster
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4">Staff Member</th>
                      <th className="text-center p-4">Mon</th>
                      <th className="text-center p-4">Tue</th>
                      <th className="text-center p-4">Wed</th>
                      <th className="text-center p-4">Thu</th>
                      <th className="text-center p-4">Fri</th>
                      <th className="text-center p-4">Sat</th>
                      <th className="text-center p-4">Sun</th>
                      <th className="text-center p-4">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStaff.map((member) => (
                      <tr key={member.id} className="border-b border-border/50">
                        <td className="p-4">
                          <div>
                            <p className="font-semibold">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </td>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                          const shift = member.shifts.find(s => s.day === day);
                          return (
                            <td key={day} className="p-2 text-center">
                              {shift ? (
                                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                  {shift.time}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-4 text-center font-bold">{member.hoursWeek}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((member) => (
              <Card key={member.id} className="glass glass-hover border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                        {member.initials}
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-1">{member.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Badge variant={member.status === "active" ? "default" : "secondary"}>
                      {member.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Performance Score</span>
                      <span className="text-sm font-bold">{member.performance}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${member.performance}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">Hours/Week</span>
                      </div>
                      <p className="text-2xl font-bold">{member.hoursWeek}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">Shifts</span>
                      </div>
                      <p className="text-2xl font-bold">{member.shifts.length}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}