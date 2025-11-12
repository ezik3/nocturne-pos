import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Users, Clock } from "lucide-react";

export default function Tables() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const mockTables = [
    { id: "1", number: "1", capacity: 4, status: "available", section: "Main Floor" },
    { id: "2", number: "2", capacity: 2, status: "occupied", section: "Main Floor", order: "1001", guestCount: 2, duration: "45m" },
    { id: "3", number: "3", capacity: 6, status: "reserved", section: "Main Floor", reservationTime: "8:00 PM" },
    { id: "4", number: "4", capacity: 4, status: "occupied", section: "Main Floor", order: "1002", guestCount: 4, duration: "20m" },
    { id: "5", number: "5", capacity: 8, status: "available", section: "VIP" },
    { id: "6", number: "6", capacity: 2, status: "occupied", section: "Bar", order: "1003", guestCount: 2, duration: "15m" },
    { id: "7", number: "7", capacity: 4, status: "available", section: "Patio" },
    { id: "8", number: "8", capacity: 6, status: "reserved", section: "VIP", reservationTime: "9:30 PM" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "occupied": return "bg-red-500/20 text-red-500 border-red-500/30";
      case "reserved": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      default: return "bg-muted";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Table Management</h1>
        <p className="text-muted-foreground">Manage tables, reservations, and QR codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle>Table Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockTables.map(table => (
                  <Card
                    key={table.id}
                    className={`glass cursor-pointer transition-all hover:scale-105 ${
                      selectedTable === table.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedTable(table.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold mb-2">T{table.number}</div>
                      <Badge className={getStatusColor(table.status)}>
                        {table.status}
                      </Badge>
                      <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{table.capacity}</span>
                      </div>
                      {table.status === "occupied" && table.duration && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-primary">
                          <Clock className="h-3 w-3" />
                          <span>{table.duration}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedTable ? (
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle>Table {mockTables.find(t => t.id === selectedTable)?.number}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const table = mockTables.find(t => t.id === selectedTable);
                  if (!table) return null;

                  return (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <Badge className={getStatusColor(table.status)}>
                          {table.status}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Section</p>
                        <p className="font-medium">{table.section}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Capacity</p>
                        <p className="font-medium">{table.capacity} guests</p>
                      </div>

                      {table.status === "occupied" && (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Order #</p>
                            <p className="font-medium">#{table.order}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Guest Count</p>
                            <p className="font-medium">{table.guestCount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Duration</p>
                            <p className="font-medium">{table.duration}</p>
                          </div>
                        </>
                      )}

                      {table.status === "reserved" && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Reservation Time</p>
                          <p className="font-medium">{table.reservationTime}</p>
                        </div>
                      )}

                      <div className="space-y-2 pt-4">
                        {table.status === "available" && (
                          <Button className="w-full">Seat Guests</Button>
                        )}
                        {table.status === "occupied" && (
                          <>
                            <Button className="w-full" variant="outline">View Order</Button>
                            <Button className="w-full neon-glow">Process Payment</Button>
                          </>
                        )}
                        <Button className="w-full" variant="outline">
                          <QrCode className="h-4 w-4 mr-2" />
                          View QR Code
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass border-border">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Select a table to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
