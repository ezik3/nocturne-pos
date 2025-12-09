import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, CheckCircle2, LayoutGrid, List, Columns3, Search, ChefHat, Eye, MessageSquare } from "lucide-react";
import { useVenueOrders } from "@/hooks/useVenueOrders";
import { toast } from "sonner";
import KitchenCard from "@/components/POS/KDS/KitchenCard";

type LayoutMode = 'compact' | 'grid' | 'multi';
type ViewMode = 'legacy' | 'enhanced' | 'display';

export default function Kitchen() {
  const { orders, updateOrderStatus } = useVenueOrders();
  const [viewMode, setViewMode] = useState<ViewMode>('legacy');
  const [filter, setFilter] = useState<"all" | "pending" | "preparing" | "ready">("all");
  const [stationFilter, setStationFilter] = useState('all');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Filter for kitchen-relevant statuses only
  const kitchenOrders = orders.filter(o => 
    ['pending', 'preparing', 'ready'].includes(o.status)
  );

  const filteredOrders = kitchenOrders.filter(order => {
    const matchesStatus = filter === 'all' || order.status === filter;
    const matchesSearch = !searchQuery || 
      order.orderNumber?.toString().includes(searchQuery) ||
      order.tableNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (orderId: string, newStatus: "pending" | "preparing" | "ready" | "served" | "cancelled") => {
    updateOrderStatus(orderId, newStatus);
    toast.success(`Order status updated to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "preparing": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "ready": return "bg-green-500/20 text-green-500 border-green-500/30";
      default: return "bg-muted";
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  const getGridClasses = () => {
    if (layoutMode === 'compact') return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
    if (layoutMode === 'grid') return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 lg:grid-cols-2';
  };

  const getPriorityColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-yellow-500 shadow-yellow-500/30';
      case 'preparing': return 'border-blue-500 shadow-blue-500/30';
      case 'ready': return 'border-green-500 shadow-green-500/30';
      default: return 'border-slate-500';
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
                : `${filteredOrders.length} active orders`
              }
            </p>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="legacy">Legacy</TabsTrigger>
              <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      ) : (
        <>
          {/* LEGACY VIEW */}
          {viewMode === 'legacy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map(order => (
                <Card key={order.id} className="glass border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold">#{order.orderNumber}</CardTitle>
                        <p className="text-sm text-muted-foreground">{order.tableNumber}</p>
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
                          <span className="font-medium">{item.name} x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeAgo(order.createdAt)}</span>
                    </div>

                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <Button 
                          className="w-full" 
                          variant="default"
                          onClick={() => handleStatusChange(order.id, 'preparing')}
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === "preparing" && (
                        <Button 
                          className="w-full neon-glow"
                          onClick={() => handleStatusChange(order.id, 'ready')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Ready
                        </Button>
                      )}
                      {order.status === "ready" && (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => handleStatusChange(order.id, 'served')}
                        >
                          Complete Order
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredOrders.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <ChefHat className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No orders in this status</p>
                  <p className="text-sm text-muted-foreground/70">Orders will appear here when placed</p>
                </div>
              )}
            </div>
          )}

          {/* ENHANCED VIEW - McDonald's Style (from reference image) */}
          {viewMode === 'enhanced' && (
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No orders found</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="bg-slate-900 border-slate-700 overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      {/* Order Info */}
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-cyan-400">#{order.orderNumber}</span>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-slate-700 text-white">
                            {order.customerName?.[0] || 'G'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-white">{order.customerName || 'Guest'}</span>
                          <span className="text-cyan-400 ml-2">{order.tableNumber}</span>
                          <span className="text-slate-400 ml-1">ordered</span>
                        </div>
                        <span className="text-slate-400">{getTimeAgo(order.createdAt)}</span>
                        <span className={order.status === 'pending' ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}>
                          {order.status === 'pending' ? 'Unpaid' : 'Paid'}
                        </span>
                        <span className="text-green-400 font-bold">${order.total.toFixed(2)}</span>
                        
                        {/* Status dots */}
                        <div className="flex gap-1">
                          <div className={`w-3 h-3 rounded-full ${order.status !== 'pending' ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                          <div className={`w-3 h-3 rounded-full ${order.status === 'preparing' || order.status === 'ready' ? 'bg-orange-500' : 'bg-slate-600'}`}></div>
                          <div className={`w-3 h-3 rounded-full ${order.status === 'ready' ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                        </div>
                        
                        <span className="text-slate-300 capitalize">{order.status}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button 
                          className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                          onClick={() => {}}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Order
                        </Button>
                        <Button 
                          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold"
                          onClick={() => {}}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* DISPLAY VIEW - Large format for kitchen screens */}
          {viewMode === 'display' && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4 py-4">
                <ChefHat className="w-12 h-12 text-primary" />
                <div className="text-center">
                  <p className="text-5xl font-bold">{currentTime.toLocaleTimeString()}</p>
                  <p className="text-muted-foreground">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredOrders.slice(0, 6).map((order) => (
                  <Card 
                    key={order.id} 
                    className={`border-4 shadow-2xl ${getPriorityColor(order.status)}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-4xl font-bold">
                            #{order.orderNumber}
                          </CardTitle>
                          <p className="text-xl text-muted-foreground">
                            {order.tableNumber} • {order.customerName || 'Guest'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={`text-lg px-4 py-2 ${getStatusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                          </Badge>
                          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                            <Clock className="w-5 h-5" />
                            <span className="text-lg">{getTimeAgo(order.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                            <span className="text-3xl font-bold text-primary">
                              {item.quantity}×
                            </span>
                            <div className="flex-1">
                              <p className="text-xl font-semibold">{item.name}</p>
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

              {filteredOrders.length === 0 && (
                <div className="text-center py-24">
                  <ChefHat className="w-24 h-24 text-muted-foreground/50 mx-auto mb-6" />
                  <p className="text-3xl text-muted-foreground">No Active Orders</p>
                  <p className="text-xl text-muted-foreground/70 mt-2">Kitchen is all caught up!</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
