import { useState } from "react";
import { Search, MapPin, TrendingUp, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Web3FeedHeader from "@/components/Customer/Feed/Web3FeedHeader";
import { useNavigate } from "react-router-dom";

const cities = ["All Cities", "New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "San Francisco", "New Orleans", "Nashville", "Austin"];
const venueTypes = ["All", "Nightclubs", "Bars", "Restaurants", "Events"];

// Mock venues data
const mockVenues = [
  { 
    id: "1", 
    name: "Club Neon", 
    description: "Electrifying atmosphere with world-class DJs", 
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600",
    city: "Las Vegas",
    type: "Nightclubs",
    vibeScore: 92,
    occupancy: 85,
    capacity: 500
  },
  { 
    id: "2", 
    name: "Skyline Lounge", 
    description: "Breathtaking views and signature cocktails", 
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
    city: "New York",
    type: "Bars",
    vibeScore: 88,
    occupancy: 120,
    capacity: 200
  },
  { 
    id: "3", 
    name: "Rhythm Arena", 
    description: "Premier venue for live music performances", 
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600",
    city: "Nashville",
    type: "Events",
    vibeScore: 95,
    occupancy: 2500,
    capacity: 5000
  },
  { 
    id: "4", 
    name: "Ocean Drive Grill", 
    description: "Fresh seafood with ocean views", 
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600",
    city: "Miami",
    type: "Restaurants",
    vibeScore: 78,
    occupancy: 45,
    capacity: 80
  },
  { 
    id: "5", 
    name: "The Basement", 
    description: "Underground vibes with the best beats", 
    image: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600",
    city: "Chicago",
    type: "Nightclubs",
    vibeScore: 85,
    occupancy: 180,
    capacity: 300
  },
  { 
    id: "6", 
    name: "Rooftop 54", 
    description: "Exclusive rooftop experience", 
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600",
    city: "Los Angeles",
    type: "Bars",
    vibeScore: 90,
    occupancy: 75,
    capacity: 150
  },
];

const DiscoverNew = () => {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredVenues = mockVenues.filter(venue => {
    const matchesCity = selectedCity === "All Cities" || venue.city === selectedCity;
    const matchesType = selectedType === "All" || venue.type === selectedType;
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesType && (searchQuery === "" || matchesSearch);
  });

  const getVibeColor = (score: number) => {
    if (score >= 90) return "text-neon-green";
    if (score >= 80) return "text-neon-cyan";
    if (score >= 70) return "text-neon-purple";
    return "text-neon-pink";
  };

  return (
    <div className="min-h-screen bg-black">
      <Web3FeedHeader />
      
      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-secondary/30 border-border/50 h-14 rounded-xl text-lg"
            />
          </div>
          <Button className="bg-gradient-to-r from-neon-pink to-neon-purple h-14 px-8 rounded-xl text-lg">
            Search
          </Button>
        </div>

        {/* Venue Type Filters */}
        <div className="flex gap-2 justify-center flex-wrap mb-4">
          {venueTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedType === type
                  ? "bg-secondary text-foreground border border-neon-cyan/50"
                  : "bg-secondary/30 text-foreground/70 hover:bg-secondary/50 border border-border/30"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* City Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
                selectedCity === city
                  ? "bg-gradient-to-r from-neon-pink to-neon-cyan text-white"
                  : "bg-secondary/50 text-foreground/80 hover:bg-secondary border border-border/50"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              onClick={() => navigate(`/app/venue/${venue.id}`)}
              className="group cursor-pointer overflow-hidden rounded-2xl bg-secondary/20 border border-border/30 hover:border-neon-cyan/50 transition-all"
            >
              {/* Image */}
              <div className="aspect-video overflow-hidden">
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              {/* Info */}
              <div className="p-4">
                <h3 className="text-neon-cyan text-xl font-bold mb-1">{venue.name}</h3>
                <p className="text-foreground/60 text-sm mb-3">{venue.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-foreground/50">
                    <MapPin className="w-4 h-4" />
                    {venue.city}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 ${getVibeColor(venue.vibeScore)}`}>
                      <TrendingUp className="w-4 h-4" />
                      {venue.vibeScore}%
                    </div>
                    <div className="flex items-center gap-1 text-foreground/50">
                      <Users className="w-4 h-4" />
                      {venue.occupancy}/{venue.capacity}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/60 text-lg">No venues found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverNew;
