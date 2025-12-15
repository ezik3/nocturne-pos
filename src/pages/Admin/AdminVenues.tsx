import { useEffect, useState } from "react";
import { Search, Filter, MoreVertical, Building2, Wallet, MapPin, Users, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  wallet?: {
    balance_jvc: number;
    balance_usd: number;
    is_frozen: boolean;
  };
}

export default function AdminVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

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

      // Fetch wallet data for each venue
      const venuesWithWallets = await Promise.all(
        (venuesData || []).map(async (venue) => {
          const { data: wallet } = await supabase
            .from("venue_wallets")
            .select("balance_jvc, balance_usd, is_frozen")
            .eq("venue_id", venue.id)
            .single();

          return {
            ...venue,
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

  const filteredVenues = venues.filter(venue => {
    const query = searchQuery.toLowerCase();
    return (
      venue.name.toLowerCase().includes(query) ||
      venue.city?.toLowerCase().includes(query) ||
      venue.venue_type?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Venue Management</h1>
          <p className="text-slate-400 mt-1">Manage platform venues and their wallets</p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          {venues.length} Total Venues
        </Badge>
      </div>

      {/* Search & Filter */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by name, city, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button variant="outline" className="border-slate-700 text-slate-300">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVenues.map((venue) => (
          <Card key={venue.id} className="bg-slate-900/50 border-slate-800 overflow-hidden hover:border-purple-500/30 transition-colors">
            <div className="aspect-video relative bg-slate-800">
              {venue.image_url ? (
                <img
                  src={venue.image_url}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-slate-600" />
                </div>
              )}
              {venue.venue_type && (
                <Badge className="absolute top-3 left-3 bg-purple-500/80 text-white">
                  {venue.venue_type}
                </Badge>
              )}
            </div>
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{venue.name}</h3>
                {venue.city && (
                  <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                    <MapPin className="h-3 w-3" />
                    {venue.city}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded bg-slate-800/50">
                  <p className="text-xs text-slate-500">JVC Balance</p>
                  <p className="text-sm font-medium text-cyan-400">
                    {(venue.wallet?.balance_jvc || 0).toLocaleString()} JVC
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-800/50">
                  <p className="text-xs text-slate-500">Occupancy</p>
                  <p className="text-sm font-medium text-white">
                    {venue.current_occupancy || 0}/{venue.capacity || "∞"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  {venue.wallet?.is_frozen ? (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                      Frozen
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      Active
                    </Badge>
                  )}
                  {venue.vibe_score && venue.vibe_score > 0 && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      ⚡ {venue.vibe_score}
                    </Badge>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                    <DropdownMenuItem 
                      className="text-slate-300 hover:text-white"
                      onClick={() => setSelectedVenue(venue)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:text-white">
                      <Wallet className="h-4 w-4 mr-2" />
                      View Wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:text-white">
                      <Users className="h-4 w-4 mr-2" />
                      View Staff
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVenues.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No venues found
        </div>
      )}

      {/* Venue Details Dialog */}
      <Dialog open={!!selectedVenue} onOpenChange={(open) => !open && setSelectedVenue(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Venue Details</DialogTitle>
          </DialogHeader>
          {selectedVenue && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                  {selectedVenue.image_url ? (
                    <img
                      src={selectedVenue.image_url}
                      alt={selectedVenue.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">{selectedVenue.name}</h3>
                  {selectedVenue.venue_type && (
                    <Badge className="mt-2 bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {selectedVenue.venue_type}
                    </Badge>
                  )}
                  {selectedVenue.description && (
                    <p className="text-slate-400 mt-3">{selectedVenue.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">Location</p>
                  <p className="text-white mt-1">
                    {selectedVenue.address || "No address"}, {selectedVenue.city || "Unknown city"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">Capacity</p>
                  <p className="text-white mt-1">
                    {selectedVenue.current_occupancy || 0} / {selectedVenue.capacity || "Unlimited"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">JVC Balance</p>
                  <p className="text-cyan-400 font-semibold mt-1">
                    {(selectedVenue.wallet?.balance_jvc || 0).toLocaleString()} JVC
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">USD Balance</p>
                  <p className="text-green-400 font-semibold mt-1">
                    ${(selectedVenue.wallet?.balance_usd || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">Venue ID</p>
                <p className="text-slate-300 font-mono text-sm mt-1">{selectedVenue.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
