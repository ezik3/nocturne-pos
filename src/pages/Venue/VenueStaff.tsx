import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Clock, DollarSign } from "lucide-react";

const staff = [
  { id: 1, name: "Sarah Johnson", role: "Manager", status: "on-shift", hours: 6.5, avatar: "SJ" },
  { id: 2, name: "Mike Chen", role: "Bartender", status: "on-shift", hours: 4.2, avatar: "MC" },
  { id: 3, name: "Emma Wilson", role: "Server", status: "on-shift", hours: 5.0, avatar: "EW" },
  { id: 4, name: "James Lee", role: "Kitchen", status: "on-break", hours: 3.5, avatar: "JL" },
  { id: 5, name: "Lisa Park", role: "Server", status: "off-shift", hours: 0, avatar: "LP" },
  { id: 6, name: "Tom Brown", role: "Security", status: "on-shift", hours: 2.0, avatar: "TB" },
];

const statusColors = {
  "on-shift": "bg-green-500/20 text-green-500",
  "on-break": "bg-yellow-500/20 text-yellow-500",
  "off-shift": "bg-muted text-muted-foreground",
};

export default function VenueStaff() {
  const onShift = staff.filter(s => s.status === "on-shift").length;
  const totalHours = staff.reduce((acc, s) => acc + s.hours, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage your team and shifts</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Clock className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Currently On Shift</p>
              <p className="text-2xl font-bold">{onShift} staff</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hours Today</p>
              <p className="text-2xl font-bold">{totalHours.toFixed(1)} hrs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Labor Cost Today</p>
              <p className="text-2xl font-bold">$487</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {staff.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {member.hours > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {member.hours} hrs today
                    </span>
                  )}
                  <Badge className={statusColors[member.status as keyof typeof statusColors]}>
                    {member.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
