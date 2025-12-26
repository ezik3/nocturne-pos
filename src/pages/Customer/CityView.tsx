import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X, Search, MapPin, Users, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PublicPoster {
  id: string;
  username: string;
  avatar_url?: string;
  age?: number;
  relationship_status?: string;
  city: string;
  connections: number;
  isGold?: boolean;
  isLive?: boolean;
  postContent?: string;
  postImage?: string;
  createdAt?: string;
  user_id?: string;
}

const cityBackgrounds: Record<string, string> = {
  "Brisbane": "https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=1920&q=80",
  "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920&q=80",
  "Melbourne": "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1920&q=80",
  "Adelaide": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1920&q=80",
  "Perth": "https://images.unsplash.com/photo-1573097219482-0319eb5f5b5e?w=1920&q=80",
  "Hobart": "https://images.unsplash.com/photo-1598012268326-56a75e0e71d4?w=1920&q=80",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80",
  "Los Angeles": "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1920&q=80",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80",
  "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80",
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80",
  "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80",
  "Gold Coast": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920&q=80",
};

const cities = ["Brisbane", "Sydney", "Melbourne", "Adelaide", "Hobart", "Perth", "New York", "Los Angeles", "London", "Tokyo", "Paris", "Dubai", "Gold Coast"];

const CityView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCity, setSelectedCity] = useState("Brisbane");
  const [searchQuery, setSearchQuery] = useState("");
  const [publicPosters, setPublicPosters] = useState<PublicPoster[]>([]);
  const [loading, setLoading] = useState(true);

  // Get initial city from navigation state
  useEffect(() => {
    if (location.state?.city) {
      setSelectedCity(location.state.city);
    }
  }, [location.state]);

  // Fetch real public posts from database
  useEffect(() => {
    const fetchPublicPosts = async () => {
      setLoading(true);
      
      // Fetch public posts
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
        return;
      }

      if (!posts || posts.length === 0) {
        setPublicPosters([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for the post authors
      const userIds = [...new Set(posts.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("customer_profiles")
        .select("user_id, display_name, avatar_url, age, relationship_status, location, connection_count")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Transform posts to PublicPoster format
      const posters: PublicPoster[] = posts.map((post) => {
        const profile = profileMap.get(post.user_id);
        return {
          id: post.id,
          user_id: post.user_id,
          username: profile?.display_name || "Anonymous",
          avatar_url: profile?.avatar_url,
          age: profile?.age || undefined,
          relationship_status: profile?.relationship_status || "Single",
          city: profile?.location || selectedCity,
          connections: profile?.connection_count || 0,
          isGold: post.post_type === "gold",
          isLive: post.is_live || false,
          postContent: post.content,
          postImage: post.image_url,
          createdAt: post.created_at,
        };
      });

      setPublicPosters(posters);
      setLoading(false);
    };

    fetchPublicPosts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("public-posts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts", filter: "visibility=eq.public" }, () => {
        fetchPublicPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCity]);

  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePosterClick = (poster: PublicPoster) => {
    // Pass all posters so the carousel can navigate between them
    navigate("/app/public-post", { 
      state: { 
        poster, 
        city: selectedCity,
        allPosters: publicPosters.map(p => ({
          id: p.id,
          username: p.username,
          avatar_url: p.avatar_url,
          isGold: p.isGold,
          isLive: p.isLive,
          postContent: p.postContent,
          postImage: p.postImage || `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80`,
          pounds: Math.floor(Math.random() * 50) + 5,
        }))
      } 
    });
  };

  const backgroundUrl = cityBackgrounds[selectedCity] || cityBackgrounds["Brisbane"];

  return (
    <div className="min-h-screen relative">
      {/* City Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <button 
            onClick={() => navigate("/app/feed")}
            className="p-2 bg-black/40 backdrop-blur-xl rounded-full hover:bg-black/60 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          {/* Search Input */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any city or country..."
                className="pl-10 bg-black/40 backdrop-blur-xl border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/80">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{publicPosters.length} nearby</span>
          </div>
        </div>

        {/* City Name */}
        <div className="text-center py-8">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-wider drop-shadow-2xl" style={{ textShadow: "4px 4px 8px rgba(0,0,0,0.5)" }}>
            {selectedCity.toUpperCase()}
          </h1>
        </div>

        {/* City Tabs */}
        <div className="px-4">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-4">
              {(searchQuery ? filteredCities : cities).map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setSearchQuery("");
                  }}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-300 ${
                    selectedCity === city 
                      ? "bg-neon-cyan text-black border-b-2 border-neon-cyan shadow-[0_0_20px_rgba(0,255,255,0.4)]" 
                      : "bg-black/30 text-white/70 hover:bg-black/50 hover:text-white"
                  }`}
                >
                  {city.slice(0, 4).toUpperCase()}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        {/* Public Posters Grid */}
        <div className="flex-1 p-4 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin" />
            </div>
          ) : publicPosters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/60">
              <Users className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No public posts yet</p>
              <p className="text-sm">Be the first to share something!</p>
            </div>
          ) : (
            <ScrollArea className="w-full h-full">
              <div className="flex gap-4 pb-8">
                {publicPosters.map((poster) => (
                  <button
                    key={poster.id}
                    onClick={() => handlePosterClick(poster)}
                    className={`flex-shrink-0 w-36 md:w-44 p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
                      poster.isGold 
                        ? "bg-black/60 ring-2 ring-neon-cyan shadow-[0_0_30px_rgba(0,255,255,0.3)]" 
                        : "bg-black/50 ring-1 ring-white/20 hover:ring-neon-cyan/50"
                    }`}
                  >
                    {/* Avatar with Live Indicator */}
                    <div className="relative mx-auto mb-3">
                      <div className={`p-0.5 rounded-full ${
                        poster.isGold 
                          ? "bg-gradient-to-br from-neon-cyan via-green-400 to-neon-cyan" 
                          : "bg-gradient-to-br from-neon-purple via-neon-pink to-neon-cyan"
                      }`}>
                        <Avatar className="w-16 h-16 md:w-20 md:h-20 ring-2 ring-black">
                          <AvatarImage src={poster.avatar_url} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-white text-xl font-bold">
                            {poster.username[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      {/* Live Indicator - pulsing green circle */}
                      {poster.isLive && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center z-10">
                          <div className="absolute w-6 h-6 bg-green-500 rounded-full animate-ping opacity-75" />
                          <div className="relative w-5 h-5 bg-green-500 rounded-full border-2 border-black shadow-[0_0_12px_rgba(34,197,94,0.8)] flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        </div>
                      )}
                      
                      {/* Gold Badge */}
                      {poster.isGold && !poster.isLive && (
                        <div className="absolute -top-1 -right-1 text-lg">⭐</div>
                      )}
                    </div>

                    {/* Info */}
                    <p className="font-semibold text-white text-sm truncate">{poster.username}</p>
                    <p className="text-xs text-white/60 truncate">
                      {poster.age && `${poster.age}, `}{poster.relationship_status}
                    </p>
                    <p className="text-xs text-neon-cyan truncate">{poster.city}</p>

                    {/* Connections */}
                    <div className="flex items-center justify-center gap-1 mt-2 text-white/70">
                      <Users className="w-3 h-3" />
                      <span className="text-xs font-bold">{poster.connections}</span>
                    </div>

                    {/* Connect Button */}
                    <Button
                      size="sm"
                      className="w-full mt-3 bg-transparent border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle connect
                      }}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Connect
                    </Button>
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityView;