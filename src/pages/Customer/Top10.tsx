import { useState, useEffect } from "react";
import { Search, Play, Image, Trophy, Building2, ChevronDown, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Web3FeedHeader from "@/components/Customer/Feed/Web3FeedHeader";
import { supabase } from "@/integrations/supabase/client";

const venueTypes = ["All", "Nightclubs", "Bars/Pubs", "Restaurants/Cafes", "Events"];

interface TopUser {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  location: string | null;
  total_pounds: number;
}

interface TopVenue {
  id: string;
  name: string;
  image_url: string | null;
  city: string | null;
  venue_type: string | null;
  vibe_score: number | null;
}

const Top10 = () => {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All");
  const [contentType, setContentType] = useState<"videos" | "pics">("pics");
  const [viewMode, setViewMode] = useState<"users" | "venues">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [topVenues, setTopVenues] = useState<TopVenue[]>([]);
  const [cities, setCities] = useState<string[]>(["All Cities"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopData();
  }, []);

  const fetchTopData = async () => {
    try {
      // Fetch top users by pounds received on their posts
      const { data: usersData, error: usersError } = await supabase
        .from('customer_profiles')
        .select(`
          id,
          user_id,
          display_name,
          avatar_url,
          location
        `)
        .order('connection_count', { ascending: false })
        .limit(50);

      if (usersError) throw usersError;

      // For each user, get their total pounds
      const usersWithPounds: TopUser[] = [];
      if (usersData) {
        for (const user of usersData) {
          const { count } = await supabase
            .from('post_pounds')
            .select('id', { count: 'exact', head: true })
            .in('post_id', 
              (await supabase
                .from('posts')
                .select('id')
                .eq('user_id', user.user_id)
              ).data?.map(p => p.id) || []
            );

          usersWithPounds.push({
            ...user,
            total_pounds: count || 0
          });
        }
      }

      // Sort by pounds and take top 10
      usersWithPounds.sort((a, b) => b.total_pounds - a.total_pounds);
      setTopUsers(usersWithPounds.slice(0, 10));

      // Fetch top venues by vibe score
      const { data: venuesData, error: venuesError } = await supabase
        .from('venues')
        .select('id, name, image_url, city, venue_type, vibe_score')
        .eq('approval_status', 'approved')
        .order('vibe_score', { ascending: false })
        .limit(10);

      if (venuesError) throw venuesError;

      if (venuesData) {
        setTopVenues(venuesData);
        
        // Extract unique cities
        const allCities = [
          ...usersWithPounds.map(u => u.location),
          ...venuesData.map(v => v.city)
        ].filter(Boolean) as string[];
        const uniqueCities = [...new Set(allCities)];
        setCities(["All Cities", ...uniqueCities.sort()]);
      }
    } catch (error) {
      console.error('Error fetching top data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = topUsers.filter(user => 
    (selectedCity === "All Cities" || user.location === selectedCity)
  );

  const filteredVenues = topVenues.filter(venue => 
    (selectedCity === "All Cities" || venue.city === selectedCity) &&
    (selectedType === "All" || venue.venue_type?.toLowerCase().includes(selectedType.toLowerCase()))
  );

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
              placeholder="Search cities, countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/50 border-white/20 h-10 rounded-lg text-white placeholder:text-white/40"
            />
          </div>
          <Button className="bg-gradient-to-r from-neon-pink to-neon-purple h-10 px-5 rounded-lg text-sm">
            Search
          </Button>
        </div>

        {/* City Tabs - horizontal scroll without scrollbar */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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

        {/* View Mode Toggle (Users vs Venues) */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => setViewMode("users")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all text-sm font-medium ${
              viewMode === "users"
                ? "bg-transparent text-white border-2 border-cyan-400"
                : "bg-white/10 text-white/60 hover:bg-white/20 border border-transparent"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Top Users
          </button>
          <button
            onClick={() => setViewMode("venues")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all text-sm font-medium ${
              viewMode === "venues"
                ? "bg-transparent text-white border-2 border-cyan-400"
                : "bg-white/10 text-white/60 hover:bg-white/20 border border-transparent"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Top Venues
          </button>
        </div>

        {/* Content Type Toggle (Videos vs Pics) - only for users */}
        {viewMode === "users" && (
          <div className="flex items-center justify-center gap-3 mb-5">
            <button
              onClick={() => setContentType("videos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${
                contentType === "videos"
                  ? "bg-cyan-500/20 text-cyan-400 border-2 border-cyan-400"
                  : "bg-white/10 text-white/60 hover:bg-white/20 border border-transparent"
              }`}
            >
              <Play className="w-4 h-4" />
              Videos
            </button>
            <button
              onClick={() => setContentType("pics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${
                contentType === "pics"
                  ? "bg-cyan-500/20 text-cyan-400 border-2 border-cyan-400"
                  : "bg-white/10 text-white/60 hover:bg-white/20 border border-transparent"
              }`}
            >
              <Image className="w-4 h-4" />
              Photos
            </button>
          </div>
        )}

        {/* Venue Type Filters - only for venues */}
        {viewMode === "venues" && (
          <div className="flex gap-2 justify-center flex-wrap mb-5">
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
                {type === "All" ? (
                  <span className="flex items-center gap-1">
                    All <ChevronDown className="w-3 h-3" />
                  </span>
                ) : type}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Content Grid */}
            {viewMode === "users" ? (
              filteredUsers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filteredUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="relative group cursor-pointer overflow-hidden rounded-xl aspect-[3/4] bg-gradient-to-br from-purple-900/50 to-pink-900/50"
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.display_name || 'User'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Avatar className="w-20 h-20">
                            <AvatarFallback className="text-2xl">
                              {user.display_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      {/* Rank Badge */}
                      <div className="absolute top-3 left-3 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center font-bold text-white border border-white/30">
                        {index + 1}
                      </div>
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      {/* User Info */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-sm font-semibold truncate mb-1">
                          {user.display_name || 'Anonymous'}
                        </p>
                        <p className="text-cyan-400 text-xs font-medium">👊 {user.total_pounds} pounds</p>
                        {user.location && (
                          <p className="text-white/60 text-xs flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {user.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 text-lg mb-2">No top users yet</p>
                  <p className="text-white/40 text-sm">Be the first to earn pounds on your posts!</p>
                </div>
              )
            ) : (
              filteredVenues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVenues.map((venue, index) => (
                    <div
                      key={venue.id}
                      className="relative group cursor-pointer overflow-hidden rounded-xl bg-white/5"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={venue.image_url || getDefaultImage(venue.venue_type)}
                          alt={venue.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      {/* Rank Badge */}
                      <div className="absolute top-3 left-3 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center font-bold text-white border border-purple-400/50">
                        {index + 1}
                      </div>
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      {/* Venue Info */}
                      <div className="p-4">
                        <h3 className="text-cyan-400 font-bold text-lg">{venue.name}</h3>
                        <p className="text-white text-sm">
                          {venue.city || 'Location TBD'} • {venue.venue_type || 'Venue'}
                        </p>
                        <p className="text-cyan-300 text-sm mt-1 font-medium">
                          {venue.vibe_score || 0} vibes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 text-lg mb-2">No top venues yet</p>
                  <p className="text-white/40 text-sm">Venues with the best vibes will appear here!</p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Top10;