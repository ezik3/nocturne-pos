import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle } from "lucide-react";

// Mock orders data
const mockOrders = [
  {
    id: "#1234",
    tableNumber: "12",
    server: "John",
    time: "15:42",
    items: [
      { name: "Grilled Salmon", quantity: 2, notes: ["No sauce", "Extra crispy skin"], allergens: ["FISH", "DAIRY"] },
      { name: "Caesar Salad", quantity: 1, notes: ["Dressing on side", "No croutons"], allergens: ["GLUTEN"] }
    ]
  },
  {
    id: "#1235",
    tableNumber: "8",
    server: "Sarah",
    time: "16:15",
    items: [
      { name: "Beef Burger", quantity: 3, notes: ["Medium rare", "Extra pickles"], allergens: ["GLUTEN"] },
      { name: "Fries", quantity: 3, notes: ["Extra crispy"], allergens: [] }
    ]
  },
  {
    id: "#1236",
    tableNumber: "15",
    server: "Mike",
    time: "16:28",
    items: [
      { name: "Margherita Pizza", quantity: 1, notes: ["Extra cheese"], allergens: ["DAIRY", "GLUTEN"] },
      { name: "Chicken Wings", quantity: 2, notes: ["Spicy", "Ranch on side"], allergens: [] }
    ]
  }
];

export default function KitchenDisplay() {
  const [orders, setOrders] = useState(mockOrders);
  const [completedToday, setCompletedToday] = useState(164);
  const [avgTime, setAvgTime] = useState(12);

  const handleMarkComplete = (orderId: string) => {
    setOrders(orders.filter(order => order.id !== orderId));
    setCompletedToday(prev => prev + 1);
  };

  const handleBumpOrder = (orderId: string) => {
    // Move to next station or mark as complete
    handleMarkComplete(orderId);
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Kitchen Display System</h1>
        <div className="flex gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Avg. Time: {avgTime} min</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Completed Today: {completedToday}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="grid">Grid View (McDonald's Style)</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="glass border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold">{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Table {order.tableNumber}</p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {order.time}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Server: {order.server}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-primary pl-4 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-primary">{item.quantity}x</span>
                        <span className="font-semibold text-lg">{item.name}</span>
                      </div>
                      {item.notes.length > 0 && (
                        <div className="space-y-1">
                          {item.notes.map((note, noteIdx) => (
                            <p key={noteIdx} className="text-sm text-muted-foreground italic">• {note}</p>
                          ))}
                        </div>
                      )}
                      {item.allergens.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {item.allergens.map((allergen, allergenIdx) => (
                            <Badge key={allergenIdx} variant="destructive" className="text-xs">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={() => handleBumpOrder(order.id)} 
                      className="flex-1 neon-glow"
                      size="lg"
                    >
                      Bump Order
                    </Button>
                    <Button 
                      onClick={() => handleMarkComplete(order.id)} 
                      variant="outline" 
                      className="flex-1"
                      size="lg"
                    >
                      Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="glass border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-2xl font-bold">{order.id}</h3>
                      <Badge variant="secondary">{order.time}</Badge>
                      <span className="text-muted-foreground">Table {order.tableNumber} • Server: {order.server}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="border-l-4 border-primary pl-4">
                          <p className="font-semibold">
                            <span className="text-primary">{item.quantity}x</span> {item.name}
                          </p>
                          {item.notes.map((note, noteIdx) => (
                            <p key={noteIdx} className="text-sm text-muted-foreground italic">• {note}</p>
                          ))}
                          {item.allergens.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {item.allergens.map((allergen, allergenIdx) => (
                                <Badge key={allergenIdx} variant="destructive" className="text-xs">
                                  {allergen}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:w-48">
                    <Button onClick={() => handleBumpOrder(order.id)} className="neon-glow">
                      Bump Order
                    </Button>
                    <Button onClick={() => handleMarkComplete(order.id)} variant="outline">
                      Mark Complete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {orders.length === 0 && (
        <div className="text-center py-20">
          <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground">No active orders at the moment.</p>
        </div>
      )}
    </div>
  );
}
