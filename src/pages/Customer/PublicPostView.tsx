import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, MapPin, MessageCircle, Share2, Heart, UserPlus } from "lucide-react";

const cityBackgrounds: Record<string, string> = {
  "Brisbane": "https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=1920&q=80",
  "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920&q=80",
  "Melbourne": "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1920&q=80",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80",
};

const PublicPostView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { poster, city } = location.state || {};

  if (!poster) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">No post data available</p>
      </div>
    );
  }

  const backgroundUrl = cityBackgrounds[city] || cityBackgrounds["Brisbane"];
  const timeAgo = "11 minutes ago"; // Mock time

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* City Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      {/* Decorative Elements - Similar to reference image */}
      <div className="absolute left-0 bottom-0 w-32 h-64 opacity-40">
        <div className="w-full h-full bg-gradient-to-t from-yellow-600/40 to-transparent" 
             style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
      </div>
      <div className="absolute right-0 bottom-0 w-32 h-64 opacity-40">
        <div className="w-full h-full bg-gradient-to-t from-yellow-600/40 to-transparent" 
             style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center pt-8 pb-20">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-4">
          {/* Avatar */}
          <div className={`p-1 rounded-full ${
            poster.isGold 
              ? "bg-gradient-to-br from-yellow-400 via-amber-300 to-yellow-500 shadow-[0_0_30px_rgba(255,215,0,0.5)]" 
              : "bg-gradient-to-br from-neon-purple via-neon-pink to-neon-cyan"
          }`}>
            <Avatar className="w-24 h-24 ring-4 ring-black">
              <AvatarImage src={poster.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-white text-3xl font-bold">
                {poster.username?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name & Location */}
          <h2 className="text-2xl font-bold text-white mt-4 drop-shadow-lg">{poster.username}</h2>
          <div className="flex items-center gap-1 text-neon-cyan">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">@ {city || "Unknown"} with 5 others</span>
          </div>
          <p className="text-white/70 text-sm mt-1">{timeAgo}</p>
        </div>

        {/* Post Card */}
        <div className="w-80 md:w-96 mx-auto">
          {/* Post Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={poster.postImage || `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80`}
              alt="Post"
              className="w-full aspect-square object-cover"
            />
            
            {/* Engagement Stats Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-white hover:text-neon-pink transition-colors">
                  <Heart className="w-6 h-6 fill-neon-pink text-neon-pink" />
                  <span className="text-sm font-bold">16</span>
                </button>
                <button className="flex items-center gap-1 text-white hover:text-neon-cyan transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Post Text */}
          <div className="mt-4 p-4 bg-black/60 backdrop-blur-xl rounded-2xl">
            <p className="text-white">
              {poster.postContent || "It's Friday night & I'm gonna get my drank on!!! Where are my peoples?"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button 
              className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-purple text-white hover:opacity-90"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Connect
            </Button>
            <Button 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mt-8 p-4 bg-black/40 backdrop-blur-xl rounded-full hover:bg-black/60 transition-colors"
        >
          <X className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
};

export default PublicPostView;