import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Users, Clock, MapPin, Edit2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SyncedTable {
  id: string;
  number: string;
  capacity: number;
  status: string;
  section: string;
  x: number;
  y: number;
  order?: string;
  guestCount?: number;
  duration?: string;
  reservationTime?: string;
}

export default function Tables() {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tables, setTables] = useState<SyncedTable[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'immersive'>('grid');

  // Load tables from floorplan sync
  useEffect(() => {
    const syncedTables = localStorage.getItem('venue_tables_sync');
    if (syncedTables) {
      const parsed = JSON.parse(syncedTables);
      // Add mock dynamic data
      const tablesWithData = parsed.map((t: any) => ({
        ...t,
        order: t.status === 'occupied' ? `100${Math.floor(Math.random() * 9) + 1}` : undefined,
        guestCount: t.status === 'occupied' ? Math.floor(Math.random() * t.capacity) + 1 : undefined,
        duration: t.status === 'occupied' ? `${Math.floor(Math.random() * 60) + 10}m` : undefined,
        reservationTime: t.status === 'reserved' ? `${Math.floor(Math.random() * 4) + 6}:${Math.random() > 0.5 ? '00' : '30'} PM` : undefined,
      }));
      setTables(tablesWithData);
    } else {
      // Default mock tables
      setTables([
        { id: "1", number: "1", capacity: 4, status: "available", section: "Main Floor", x: 20, y: 30 },
        { id: "2", number: "2", capacity: 2, status: "occupied", section: "Main Floor", x: 40, y: 30, order: "1001", guestCount: 2, duration: "45m" },
        { id: "3", number: "3", capacity: 6, status: "reserved", section: "Main Floor", x: 60, y: 30, reservationTime: "8:00 PM" },
        { id: "4", number: "4", capacity: 4, status: "occupied", section: "Main Floor", x: 80, y: 30, order: "1002", guestCount: 4, duration: "20m" },
        { id: "5", number: "5", capacity: 8, status: "available", section: "VIP", x: 20, y: 60 },
        { id: "6", number: "6", capacity: 2, status: "occupied", section: "Bar", x: 40, y: 60, order: "1003", guestCount: 2, duration: "15m" },
        { id: "7", number: "7", capacity: 4, status: "available", section: "Patio", x: 60, y: 60 },
        { id: "8", number: "8", capacity: 6, status: "reserved", section: "VIP", x: 80, y: 60, reservationTime: "9:30 PM" },
      ]);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "occupied": return "bg-red-500/20 text-red-500 border-red-500/30";
      case "reserved": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      default: return "bg-muted";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500";
      case "occupied": return "bg-red-500";
      case "reserved": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  // Stats
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === "available").length,
    occupied: tables.filter(t => t.status === "occupied").length,
    reserved: tables.filter(t => t.status === "reserved").length,
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Table Management</h1>
          <p className="text-muted-foreground">Manage tables, reservations, and QR codes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/venue/pos/floorplan")}>
            <Edit2 className="w-4 h-4 mr-2" /> Edit Floorplan
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Tables</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-500">{stats.available}</p>
            <p className="text-sm text-green-500">Available</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-500">{stats.occupied}</p>
            <p className="text-sm text-red-500">Occupied</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-500">{stats.reserved}</p>
            <p className="text-sm text-blue-500">Reserved</p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'immersive')} className="mb-6">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="immersive">Immersive View</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {viewMode === 'grid' ? (
            // Grid View (Original)
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle>Table Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tables.map(table => (
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
          ) : (
            // Immersive View (Visual Map)
            <Card className="glass border-border overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Visual Floorplan
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500" /> Available</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> Occupied</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Reserved</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video min-h-[400px] bg-slate-900/50">
                  {/* Grid Background */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)
                      `,
                      backgroundSize: '40px 40px'
                    }}
                  />

                  {/* Table Hotspots */}
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${
                        selectedTable === table.id ? "scale-110 z-10" : ""
                      }`}
                      style={{ left: `${table.x}%`, top: `${table.y}%` }}
                      onClick={() => setSelectedTable(table.id)}
                    >
                      <div className={`relative w-16 h-16 rounded-full ${getStatusDotColor(table.status)} 
                        bg-opacity-80 border-4 border-white shadow-xl flex items-center justify-center
                        ${selectedTable === table.id ? "ring-4 ring-primary" : ""}`}
                      >
                        <div className="text-center text-white">
                          <div className="font-bold text-sm">T{table.number}</div>
                          <div className="text-xs flex items-center justify-center">
                            <Users className="w-3 h-3 mr-0.5" />
                            {table.capacity}
                          </div>
                        </div>
                      </div>
                      {table.status === "occupied" && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                          <Clock className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Table Details Panel */}
        <div>
          {selectedTable ? (
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle>Table {tables.find(t => t.id === selectedTable)?.number}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const table = tables.find(t => t.id === selectedTable);
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
