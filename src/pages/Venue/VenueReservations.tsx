import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Plus, Check, X } from "lucide-react";

const reservations = [
  { id: 1, name: "John Smith", guests: 4, time: "7:00 PM", date: "Today", status: "confirmed", table: "12" },
  { id: 2, name: "Sarah Williams", guests: 6, time: "8:00 PM", date: "Today", status: "pending", table: "VIP 1" },
  { id: 3, name: "Mike Johnson", guests: 2, time: "8:30 PM", date: "Today", status: "confirmed", table: "5" },
  { id: 4, name: "Emma Davis", guests: 8, time: "9:00 PM", date: "Today", status: "confirmed", table: "15" },
  { id: 5, name: "Corporate Event", guests: 20, time: "7:00 PM", date: "Tomorrow", status: "pending", table: "Private Room" },
];

const statusColors = {
  confirmed: "bg-green-500/20 text-green-500",
  pending: "bg-yellow-500/20 text-yellow-500",
  cancelled: "bg-red-500/20 text-red-500",
};

export default function VenueReservations() {
  const todayReservations = reservations.filter(r => r.date === "Today");
  const upcomingReservations = reservations.filter(r => r.date !== "Today");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reservations</h1>
          <p className="text-muted-foreground">Manage bookings and table reservations</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Bookings</p>
              <p className="text-2xl font-bold">{todayReservations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Guests</p>
              <p className="text-2xl font-bold">
                {todayReservations.reduce((acc, r) => acc + r.guests, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/20">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold">
                {reservations.filter(r => r.status === "pending").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Reservations */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle>Today's Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayReservations.map(reservation => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{reservation.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.guests} guests • Table {reservation.table}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{reservation.time}</p>
                    <Badge className={statusColors[reservation.status as keyof typeof statusColors]}>
                      {reservation.status}
                    </Badge>
                  </div>
                  {reservation.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming */}
      {upcomingReservations.length > 0 && (
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingReservations.map(reservation => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{reservation.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.guests} guests • {reservation.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{reservation.time}</p>
                    <Badge className={statusColors[reservation.status as keyof typeof statusColors]}>
                      {reservation.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
