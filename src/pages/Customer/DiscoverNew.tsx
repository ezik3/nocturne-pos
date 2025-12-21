import { useState, useEffect } from "react";
import { Search, MapPin, TrendingUp, Users, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Web3FeedHeader from "@/components/Customer/Feed/Web3FeedHeader";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const venueTypes = ["All", "Nightclubs", "Bars", "Restaurants", "Events"];

interface Venue {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  city: string | null;
  venue_type: string | null;
  vibe_score: number | null;
  current_occupancy: number | null;
  capacity: number | null;
  address: string | null;
}

const DiscoverNew = () => {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [cities, setCities] = useState<string[]>(["All Cities"]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('approval_status', 'approved')
        .order('vibe_score', { ascending: false });

      if (error) throw error;

      if (data) {
        setVenues(data);
        
        // Extract unique cities from venues
        const uniqueCities = [...new Set(data.map(v => v.city).filter(Boolean))] as string[];
        setCities(["All Cities", ...uniqueCities.sort()]);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter(venue => {
    const matchesCity = selectedCity === "All Cities" || venue.city === selectedCity;
    const matchesType = selectedType === "All" || venue.venue_type?.toLowerCase().includes(selectedType.toLowerCase());
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesType && (searchQuery === "" || matchesSearch);
  });

  const getVibeColor = (score: number | null) => {
    if (!score) return "text-white/60";
    if (score >= 90) return "text-neon-green";
    if (score >= 80) return "text-neon-cyan";
    if (score >= 70) return "text-neon-purple";
    return "text-neon-pink";
  };

  const getDefaultImage = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'nightclub':
      case 'nightclubs':
        return "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600";
      case 'bar':
      case 'bars':
        return "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600";
      case 'restaurant':
      case 'restaurants':
        return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600";
      default:
        return "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600";
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style>{`::-webkit-scrollbar { display: none; }`}</style>
      <Web3FeedHeader />
      
      <div className="px-4 pt-20 pb-6 max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              placeholder="Search for venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/50 border-white/20 h-10 rounded-lg text-white placeholder:text-white/40"
            />
          </div>
          <Button className="bg-gradient-to-r from-neon-pink to-neon-purple h-10 px-5 rounded-lg text-sm">
            Search
          </Button>
        </div>

        {/* Venue Type Filters */}
        <div className="flex gap-2 justify-center flex-wrap mb-4">
          {venueTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedType === type
                  ? "bg-transparent text-white border-2 border-cyan-400"
                  : "bg-white/10 text-white/60 hover:bg-white/20 border border-transparent"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* City Tabs - horizontal scroll without scrollbar */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
                selectedCity === city
                  ? "bg-transparent text-white border-2 border-cyan-400"
                  : "bg-white/10 text-white/70 hover:bg-white/20 border border-transparent"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVenues.map((venue) => (
                <div
                  key={venue.id}
                  onClick={() => navigate(`/app/venue/${venue.id}`)}
                  className="group cursor-pointer overflow-hidden rounded-xl bg-white/5 hover:border-cyan-400/50 border border-transparent transition-all"
                >
                  {/* Image */}
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={venue.image_url || getDefaultImage(venue.venue_type)}
                      alt={venue.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-cyan-400 text-xl font-bold mb-1">{venue.name}</h3>
                    <p className="text-white/70 text-sm mb-3 line-clamp-2">
                      {venue.description || `A great ${venue.venue_type || 'venue'} to visit`}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-white/60">
                        <MapPin className="w-4 h-4" />
                        {venue.city || 'Location TBD'}
                      </div>
                      <div className="flex items-center gap-3">
                        {venue.vibe_score && (
                          <div className={`flex items-center gap-1 ${getVibeColor(venue.vibe_score)}`}>
                            <TrendingUp className="w-4 h-4" />
                            {venue.vibe_score}%
                          </div>
                        )}
                        {venue.capacity && (
                          <div className="flex items-center gap-1 text-white/60">
                            <Users className="w-4 h-4" />
                            {venue.current_occupancy || 0}/{venue.capacity}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredVenues.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg mb-2">No venues found</p>
                <p className="text-white/40 text-sm">
                  {venues.length === 0 
                    ? "Be the first to register your venue!"
                    : "Try adjusting your search criteria"
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DiscoverNew;