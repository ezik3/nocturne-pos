import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, Store, MapPin, Check, X, Eye, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Venue {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  venue_type: string | null;
  image_url: string | null;
  vibe_score: number | null;
  capacity: number | null;
  current_occupancy: number | null;
  created_at: string;
  status?: "active" | "pending" | "suspended";
  wallet?: {
    balance_jvc: number;
    balance_usd: number;
    is_frozen: boolean;
  };
}

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  suspended: "bg-destructive/10 text-destructive",
};

export default function AdminVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const { data: venuesData, error } = await supabase
        .from("venues")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const venuesWithWallets = await Promise.all(
        (venuesData || []).map(async (venue) => {
          const { data: wallet } = await supabase
            .from("venue_wallets")
            .select("balance_jvc, balance_usd, is_frozen")
            .eq("venue_id", venue.id)
            .single();

          // Simulate status based on wallet state
          let status: "active" | "pending" | "suspended" = "active";
          if (wallet?.is_frozen) status = "suspended";
          else if (!wallet) status = "pending";

          return {
            ...venue,
            status,
            wallet: wallet || undefined
          };
        })
      );

      setVenues(venuesWithWallets);
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast.error("Failed to fetch venues");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVenues = venues.filter((venue) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      venue.name.toLowerCase().includes(query) ||
      venue.city?.toLowerCase().includes(query) ||
      venue.venue_type?.toLowerCase().includes(query);
    
    if (activeTab === "pending") return matchesSearch && venue.status === "pending";
    if (activeTab === "active") return matchesSearch && venue.status === "active";
    return matchesSearch;
  });

  const pendingCount = venues.filter((v) => v.status === "pending").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Venue Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage venue registrations
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          Export Venues
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All Venues</TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Pending
              <span className="px-1.5 py-0.5 text-xs bg-warning/20 text-warning rounded-full">
                {pendingCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted border-border"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {/* Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                className={cn(
                  "bg-card/80 backdrop-blur-xl border border-border/50 rounded-lg p-5 transition-all duration-200",
                  venue.status === "pending" && "border-warning/30"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-3 rounded-lg",
                      venue.status === "pending" ? "bg-warning/10" : "bg-primary/10"
                    )}>
                      <Store className={cn(
                        "w-5 h-5",
                        venue.status === "pending" ? "text-warning" : "text-primary"
                      )} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{venue.name}</h3>
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1", statusColors[venue.status || "active"])}>
                        {venue.status}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedVenue(venue)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {venue.status === "pending" && (
                        <>
                          <DropdownMenuItem className="text-success">
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {venue.city || "Unknown location"}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Store className="w-4 h-4" />
                    {venue.venue_type || "Venue"}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Submitted: {new Date(venue.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">JVC Balance</p>
                      <p className="text-sm font-medium text-primary">
                        {(venue.wallet?.balance_jvc || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Capacity</p>
                      <p className="text-sm font-medium text-foreground">
                        {venue.current_occupancy || 0}/{venue.capacity || "∞"}
                      </p>
                    </div>
                  </div>
                </div>

                {venue.status === "pending" && (
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredVenues.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No venues found
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Venue Details Dialog */}
      <Dialog open={!!selectedVenue} onOpenChange={(open) => !open && setSelectedVenue(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Venue Details</DialogTitle>
          </DialogHeader>
          {selectedVenue && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {selectedVenue.image_url ? (
                    <img
                      src={selectedVenue.image_url}
                      alt={selectedVenue.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground">{selectedVenue.name}</h3>
                  {selectedVenue.venue_type && (
                    <Badge className="mt-2 bg-primary/20 text-primary">
                      {selectedVenue.venue_type}
                    </Badge>
                  )}
                  {selectedVenue.description && (
                    <p className="text-muted-foreground mt-3">{selectedVenue.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-foreground mt-1">
                    {selectedVenue.address || "No address"}, {selectedVenue.city || "Unknown city"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="text-foreground mt-1">
                    {selectedVenue.current_occupancy || 0} / {selectedVenue.capacity || "Unlimited"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">JVC Balance</p>
                  <p className="text-primary font-semibold mt-1">
                    {(selectedVenue.wallet?.balance_jvc || 0).toLocaleString()} JVC
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">USD Balance</p>
                  <p className="text-success font-semibold mt-1">
                    ${(selectedVenue.wallet?.balance_usd || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Venue ID</p>
                <p className="text-muted-foreground font-mono text-sm mt-1">{selectedVenue.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
