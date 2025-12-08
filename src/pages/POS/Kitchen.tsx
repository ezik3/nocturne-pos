import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clock, CheckCircle2, LayoutGrid, List, Columns3, Search, ChefHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import KitchenCard from "@/components/POS/KDS/KitchenCard";

type LayoutMode = 'compact' | 'grid' | 'multi';
type ViewMode = 'legacy' | 'enhanced' | 'display';

// Mock orders for legacy view
const mockOrders = [
  { id: "1001", table: "Table 5", items: ["Cappuccino x2", "Croissant x1"], status: "pending", time: "2m ago" },
  { id: "1002", table: "Table 3", items: ["Latte x1", "Muffin x2"], status: "preparing", time: "5m ago" },
  { id: "1003", table: "Table 8", items: ["Espresso x3", "Croissant x2"], status: "pending", time: "1m ago" },
  { id: "1004", table: "Table 1", items: ["Americano x1"], status: "ready", time: "8m ago" },
];

export default function Kitchen() {
  const [viewMode, setViewMode] = useState<ViewMode>('enhanced');
  const [filter, setFilter] = useState<"all" | "pending" | "preparing" | "ready">("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [stationFilter, setStationFilter] = useState('all');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order update:', payload);
          if (payload.eventType === 'INSERT') {
            fetchOrderWithItems(payload.new.id).then(order => {
              if (order) {
                setOrders(prev => [order, ...prev]);
                toast.success(`New order #${payload.new.order_number} received!`);
              }
            });
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => 
              o.id === payload.new.id ? { ...o, ...payload.new } : o
            ));
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Live clock for display view
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(clockInterval);
    };
  }, []);

  const fetchOrderWithItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return data;
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .in('status', ['pending', 'preparing', 'ready'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    } else {
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filter === 'all' || order.status === filter;
    const matchesStation = stationFilter === 'all' || order.station === stationFilter;
    const matchesSearch = !searchQuery || 
      order.order_number?.toString().includes(searchQuery) ||
      order.table_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesStation && matchesSearch;
  });

  const filteredMockOrders = filter === "all" 
    ? mockOrders 
    : mockOrders.filter(order => order.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "preparing": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "ready": return "bg-green-500/20 text-green-500 border-green-500/30";
      default: return "bg-muted";
    }
  };

  const getGridClasses = () => {
    if (layoutMode === 'compact') return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
    if (layoutMode === 'grid') return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 lg:grid-cols-2';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 shadow-red-500/30';
      case 'high': return 'border-orange-500 shadow-orange-500/30';
      case 'medium': return 'border-yellow-500 shadow-yellow-500/30';
      default: return 'border-green-500 shadow-green-500/30';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Kitchen Display System</h1>
            <p className="text-muted-foreground">
              {viewMode === 'display' 
                ? `${currentTime.toLocaleTimeString()} • ${currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
                : `${filteredOrders.length || filteredMockOrders.length} active orders`
              }
            </p>
          </div>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="legacy">Legacy</TabsTrigger>
              <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filters - Show for enhanced and legacy views */}
        {viewMode !== 'display' && (
          <div className="flex flex-col md:flex-row gap-4">
            {viewMode === 'enhanced' && (
              <>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order #, table, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={layoutMode === 'compact' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setLayoutMode('compact')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={layoutMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setLayoutMode('grid')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={layoutMode === 'multi' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setLayoutMode('multi')}
                  >
                    <Columns3 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            <div className="flex gap-2">
              {["all", "pending", "preparing", "ready"].map(status => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  onClick={() => setFilter(status as any)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>

            {viewMode === 'enhanced' && (
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stations</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="expo">Expo</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      {/* LEGACY VIEW */}
      {viewMode === 'legacy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMockOrders.map(order => (
            <Card key={order.id} className="glass border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">#{order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">{order.table}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{order.time}</span>
                </div>

                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <Button className="w-full" variant="default">
                      Start Preparing
                    </Button>
                  )}
                  {order.status === "preparing" && (
                    <Button className="w-full neon-glow">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Ready
                    </Button>
                  )}
                  {order.status === "ready" && (
                    <Button className="w-full" variant="outline">
                      Complete Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredMockOrders.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">No orders in this status</p>
            </div>
          )}
        </div>
      )}

      {/* ENHANCED VIEW */}
      {viewMode === 'enhanced' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No orders found</p>
            </div>
          ) : (
            <div className={`grid ${getGridClasses()} gap-4`}>
              {filteredOrders.map((order) => (
                <KitchenCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  layout={layoutMode === 'compact' ? 'compact' : 'detailed'}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* DISPLAY VIEW - Large format for kitchen screens */}
      {viewMode === 'display' && (
        <div className="space-y-6">
          {/* Large header with clock */}
          <div className="flex items-center justify-center gap-4 py-4">
            <ChefHat className="w-12 h-12 text-primary" />
            <div className="text-center">
              <p className="text-5xl font-bold">{currentTime.toLocaleTimeString()}</p>
              <p className="text-muted-foreground">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Large order cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(orders.length > 0 ? orders : mockOrders).slice(0, 6).map((order: any) => (
              <Card 
                key={order.id} 
                className={`border-4 shadow-2xl ${getPriorityColor(order.priority || 'medium')}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-4xl font-bold">
                        #{order.order_number || order.id}
                      </CardTitle>
                      <p className="text-xl text-muted-foreground">
                        {order.table_number || order.table} • {order.customer_name || 'Guest'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-lg px-4 py-2 ${getStatusColor(order.status)}`}>
                        {order.priority?.toUpperCase() || 'MEDIUM'}
                      </Badge>
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <Clock className="w-5 h-5" />
                        <span className="text-lg">{order.time || '2m'}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(order.order_items || order.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                        <span className="text-3xl font-bold text-primary">
                          {item.quantity || 1}×
                        </span>
                        <div className="flex-1">
                          <p className="text-xl font-semibold">{item.name || item}</p>
                          {item.notes && (
                            <p className="text-sm text-yellow-500 mt-1">⚠️ {item.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {orders.length === 0 && mockOrders.length === 0 && (
            <div className="text-center py-24">
              <ChefHat className="w-24 h-24 text-muted-foreground/50 mx-auto mb-6" />
              <p className="text-3xl text-muted-foreground">No Active Orders</p>
              <p className="text-xl text-muted-foreground/70 mt-2">Kitchen is all caught up!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}