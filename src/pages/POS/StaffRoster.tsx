import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Clock, TrendingUp, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mockStaff = [
  {
    id: "1",
    name: "John Doe",
    initials: "JD",
    role: "Head Bartender",
    status: "Active",
    performance: 98,
    hoursWeek: 32,
    shifts: [
      { day: "Tue", time: "2PM - 10PM" },
      { day: "Thu", time: "2PM - 10PM" },
      { day: "Sat", time: "4PM - 12AM" }
    ]
  },
  {
    id: "2",
    name: "Jane Smith",
    initials: "JS",
    role: "Server",
    status: "Active",
    performance: 95,
    hoursWeek: 25,
    shifts: [
      { day: "Wed", time: "11AM - 7PM" },
      { day: "Fri", time: "12PM - 8PM" }
    ]
  },
  {
    id: "3",
    name: "Mike Johnson",
    initials: "MJ",
    role: "Manager",
    status: "Active",
    performance: 99,
    hoursWeek: 40,
    shifts: [
      { day: "Mon", time: "9AM - 5PM" },
      { day: "Tue", time: "9AM - 5PM" },
      { day: "Wed", time: "9AM - 5PM" },
      { day: "Thu", time: "9AM - 5PM" },
      { day: "Fri", time: "9AM - 5PM" }
    ]
  }
];

export default function StaffRoster() {
  const [staff] = useState(mockStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Staff Management</h1>
          <p className="text-muted-foreground">Manage your team and schedules</p>
        </div>
        <Button className="neon-glow">
          <Plus className="h-4 w-4 mr-2" />
          Add New Staff
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">Staff List</TabsTrigger>
          <TabsTrigger value="roster">Weekly Roster</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

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
              <SelectItem value="Head Bartender">Head Bartender</SelectItem>
              <SelectItem value="Server">Server</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Break">On Break</SelectItem>
              <SelectItem value="Offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="list" className="space-y-4">
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
                    <Badge variant={member.status === "Active" ? "default" : "secondary"}>
                      {member.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <span className="text-xs">Performance</span>
                      </div>
                      <p className="text-2xl font-bold">{member.performance}%</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">This Week's Shifts:</p>
                    {member.shifts.map((shift, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium">{shift.day}</span>
                        <span className="text-muted-foreground">{shift.time}</span>
                      </div>
                    ))}
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

        <TabsContent value="roster" className="space-y-4">
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
                    {staff.map((member) => (
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

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {staff.map((member) => (
              <Card key={member.id} className="glass">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                      {member.initials}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Hours This Week</p>
                        <p className="text-2xl font-bold">{member.hoursWeek}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Shifts</p>
                        <p className="text-2xl font-bold">{member.shifts.length}</p>
                      </div>
                    </div>
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
