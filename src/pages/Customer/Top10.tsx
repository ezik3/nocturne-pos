import { useState } from "react";
import { Search, Play, Image, Trophy, Building2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Web3FeedHeader from "@/components/Customer/Feed/Web3FeedHeader";

const cities = ["All Cities", "New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "San Francisco", "New Orleans", "Nashville", "Austin"];
const venueTypes = ["All", "Nightclubs", "Bars/Pubs", "Restaurants/Cafes", "Events"];

// Mock data for top 10 content
const mockTopUsers = [
  { id: "1", name: "User 1", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", pounds: 285, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600", city: "New York" },
  { id: "2", name: "User 2", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", pounds: 326, image: "https://images.unsplash.com/photo-1504199367641-aba8151af406?w=600", city: "Los Angeles" },
  { id: "3", name: "User 3", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", pounds: 198, image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600", city: "Miami" },
  { id: "4", name: "User 4", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", pounds: 412, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600", city: "Chicago" },
  { id: "5", name: "User 5", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", pounds: 178, image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600", city: "Las Vegas" },
  { id: "6", name: "User 6", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", pounds: 256, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600", city: "New York" },
  { id: "7", name: "User 7", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", pounds: 389, image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600", city: "Austin" },
  { id: "8", name: "User 8", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", pounds: 445, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", city: "Nashville" },
  { id: "9", name: "User 9", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", pounds: 167, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600", city: "San Francisco" },
  { id: "10", name: "User 10", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", pounds: 523, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600", city: "Miami" },
];

const mockTopVenues = [
  { id: "1", name: "Club Neon", image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600", city: "Las Vegas", type: "Nightclubs", vibes: 1250 },
  { id: "2", name: "Skyline Lounge", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600", city: "New York", type: "Bars/Pubs", vibes: 980 },
  { id: "3", name: "Rhythm Arena", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600", city: "Nashville", type: "Events", vibes: 1890 },
  { id: "4", name: "Ocean Drive Bar", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600", city: "Miami", type: "Bars/Pubs", vibes: 756 },
  { id: "5", name: "The Basement", image: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600", city: "Chicago", type: "Nightclubs", vibes: 1120 },
];

const Top10 = () => {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All");
  const [contentType, setContentType] = useState<"videos" | "pics">("pics");
  const [viewMode, setViewMode] = useState<"users" | "venues">("users");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = mockTopUsers.filter(user => 
    (selectedCity === "All Cities" || user.city === selectedCity)
  );

  const filteredVenues = mockTopVenues.filter(venue => 
    (selectedCity === "All Cities" || venue.city === selectedCity) &&
    (selectedType === "All" || venue.type === selectedType)
  );

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

        {/* Content Grid */}
        {viewMode === "users" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredUsers.slice(0, 10).map((user, index) => (
              <div
                key={user.id}
                className="relative group cursor-pointer overflow-hidden rounded-xl aspect-[3/4]"
              >
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center font-bold text-white border border-white/30">
                  {index + 1}
                </div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                {/* User Info */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-7 h-7 border-2 border-cyan-400">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                  </div>
                  <p className="text-cyan-400 text-xs font-medium">👊 {user.pounds} pounds</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVenues.map((venue, index) => (
              <div
                key={venue.id}
                className="relative group cursor-pointer overflow-hidden rounded-xl bg-white/5"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={venue.image}
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
                  <p className="text-white/70 text-sm">{venue.city} • {venue.type}</p>
                  <p className="text-purple-300 text-sm mt-1 font-medium">{venue.vibes} vibes</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Top10;
