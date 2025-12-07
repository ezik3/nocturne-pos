import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, MapPin, MessageCircle, Share2, Heart, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";

const cityBackgrounds: Record<string, string> = {
  "Brisbane": "https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=1920&q=80",
  "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920&q=80",
  "Melbourne": "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1920&q=80",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80",
};

// Mock posts for the carousel - would come from navigation state in production
const mockPosts = [
  {
    id: "1",
    username: "Sarah Miller",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    postImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
    postContent: "It's Friday night & I'm gonna get my drank on!!! Where are my peoples?",
    isGold: true,
    pounds: 16,
  },
  {
    id: "2",
    username: "Mike Johnson",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    postImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
    postContent: "Best DJ in town! 🔥🎵",
    isGold: false,
    pounds: 24,
  },
  {
    id: "3",
    username: "Emma Wilson",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    postImage: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&q=80",
    postContent: "Living my best life tonight! 💃✨",
    isGold: false,
    pounds: 32,
  },
  {
    id: "4",
    username: "Alex Chen",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    postImage: "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=400&q=80",
    postContent: "Vibes are immaculate 🔥",
    isGold: true,
    pounds: 45,
  },
];

const PublicPostView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { poster, city, allPosters } = location.state || {};
  
  // Use all posters from navigation or fallback to mock
  const posts = allPosters?.length > 0 ? allPosters : mockPosts;
  
  // Find initial index of current poster
  const initialIndex = poster ? posts.findIndex((p: any) => p.id === poster.id || p.username === poster.username) : 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  
  const currentPost = posts[currentIndex] || poster || mockPosts[0];
  const prevPost = posts[currentIndex - 1];
  const nextPost = posts[currentIndex + 1];

  const backgroundUrl = cityBackgrounds[city] || cityBackgrounds["Brisbane"];
  const timeAgo = "11 minutes ago";

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") navigate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, posts.length]);

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">No post data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* City Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-8">
        {/* Carousel Container */}
        <div className="relative w-full max-w-[100vw] flex items-center justify-center perspective-1000">
          
          {/* Previous Post (Left Side) */}
          {prevPost && (
            <div 
              onClick={goToPrev}
              className="absolute left-0 md:left-[5%] cursor-pointer transition-all duration-500 ease-out transform -rotate-y-15 scale-75 opacity-60 hover:opacity-80 z-10"
              style={{
                transform: "perspective(1000px) rotateY(25deg) translateX(-20%) scale(0.7)",
              }}
            >
              <PostCard post={prevPost} city={city} isActive={false} />
            </div>
          )}

          {/* Current Post (Center) */}
          <div className="relative z-20 transition-all duration-500 ease-out transform scale-100">
            <PostCard post={currentPost} city={city} isActive={true} timeAgo={timeAgo} />
          </div>

          {/* Next Post (Right Side) */}
          {nextPost && (
            <div 
              onClick={goToNext}
              className="absolute right-0 md:right-[5%] cursor-pointer transition-all duration-500 ease-out transform rotate-y-15 scale-75 opacity-60 hover:opacity-80 z-10"
              style={{
                transform: "perspective(1000px) rotateY(-25deg) translateX(20%) scale(0.7)",
              }}
            >
              <PostCard post={nextPost} city={city} isActive={false} />
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-8 mt-6">
          <button 
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className={`p-3 rounded-full bg-black/40 backdrop-blur-xl transition-all
              ${currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-black/60 hover:scale-110"}`}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          {/* Dots Indicator */}
          <div className="flex gap-2">
            {posts.map((_: any, idx: number) => (
              <div 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  idx === currentIndex 
                    ? "w-6 bg-neon-cyan" 
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <button 
            onClick={goToNext}
            disabled={currentIndex === posts.length - 1}
            className={`p-3 rounded-full bg-black/40 backdrop-blur-xl transition-all
              ${currentIndex === posts.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-black/60 hover:scale-110"}`}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mt-6 p-4 bg-black/40 backdrop-blur-xl rounded-full hover:bg-black/60 transition-colors"
        >
          <X className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
};

// Separate PostCard component for reuse
const PostCard = ({ 
  post, 
  city, 
  isActive, 
  timeAgo = "11 minutes ago" 
}: { 
  post: any; 
  city?: string; 
  isActive: boolean;
  timeAgo?: string;
}) => {
  return (
    <div className={`flex flex-col items-center ${isActive ? "" : "pointer-events-none"}`}>
      {/* Profile Section - Only show for active */}
      {isActive && (
        <div className="flex flex-col items-center mb-4">
          <div className={`p-1 rounded-full ${
            post.isGold 
              ? "bg-gradient-to-br from-yellow-400 via-amber-300 to-yellow-500 shadow-[0_0_30px_rgba(255,215,0,0.5)]" 
              : "bg-gradient-to-br from-neon-purple via-neon-pink to-neon-cyan"
          }`}>
            <Avatar className="w-24 h-24 ring-4 ring-black">
              <AvatarImage src={post.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-white text-3xl font-bold">
                {post.username?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <h2 className="text-2xl font-bold text-white mt-4 drop-shadow-lg">{post.username}</h2>
          <div className="flex items-center gap-1 text-neon-cyan">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">@ {city || "Unknown"} with 5 others</span>
          </div>
          <p className="text-white/70 text-sm mt-1">{timeAgo}</p>
        </div>
      )}

      {/* Post Card */}
      <div className={`${isActive ? "w-80 md:w-96" : "w-64 md:w-72"} mx-auto`}>
        {/* Post Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={post.postImage || `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80`}
            alt="Post"
            className="w-full aspect-square object-cover"
          />
          
          {/* Engagement Stats Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-white hover:text-neon-pink transition-colors">
                <Heart className="w-6 h-6 fill-neon-pink text-neon-pink" />
                <span className="text-sm font-bold">{post.pounds || 16}</span>
              </button>
              <button className="flex items-center gap-1 text-white hover:text-neon-cyan transition-colors">
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Post Text */}
        <div className="mt-4 p-4 bg-black/60 backdrop-blur-xl rounded-2xl">
          <p className={`text-white ${isActive ? "" : "text-sm line-clamp-2"}`}>
            {post.postContent || "It's Friday night & I'm gonna get my drank on!!! Where are my peoples?"}
          </p>
        </div>

        {/* Action Buttons - Only for active post */}
        {isActive && (
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
        )}
      </div>
    </div>
  );
};

export default PublicPostView;
