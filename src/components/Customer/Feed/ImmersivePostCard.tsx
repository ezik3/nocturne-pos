import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2, Sparkles, Clock, MapPin, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TaggedUser {
  id: string;
  username: string;
  avatar_url?: string;
}

interface ImmersivePostCardProps {
  id: string;
  authorName: string;
  authorAvatar?: string;
  isOnline?: boolean;
  isGold?: boolean;
  isAR?: boolean;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  venueName?: string;
  taggedUsers?: TaggedUser[];
  poundsCount: number;
  commentsCount: number;
  createdAt: string;
  expiresIn?: number; // hours remaining
  onPound: () => void;
  onComment: () => void;
  onShare: () => void;
  onVenueClick?: () => void;
  isActive?: boolean;
}

const ImmersivePostCard = ({
  id,
  authorName,
  authorAvatar,
  isOnline = false,
  isGold = false,
  isAR = false,
  content,
  imageUrl,
  videoUrl,
  venueName,
  taggedUsers = [],
  poundsCount,
  commentsCount,
  createdAt,
  expiresIn = 24,
  onPound,
  onComment,
  onShare,
  onVenueClick,
  isActive = true,
}: ImmersivePostCardProps) => {
  const [isPounding, setIsPounding] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showFullContent, setShowFullContent] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePound = () => {
    setIsPounding(true);
    onPound();
    setTimeout(() => setIsPounding(false), 500);
  };

  // Calculate expiry percentage (0-100)
  const expiryProgress = Math.max(0, Math.min(100, (expiresIn / 24) * 100));
  const isExpiringSoon = expiresIn <= 6;

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, isPlaying]);

  return (
    <article className="relative w-full h-full flex flex-col immersive-post">
      {/* Background Media - Full Screen */}
      <div className="absolute inset-0">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={imageUrl}
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : imageUrl ? (
          <img src={imageUrl} alt="Post" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple via-pink to-cyan opacity-30" />
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        
        {/* Web3 Grid Pattern Overlay */}
        <div className="absolute inset-0 web3-grid opacity-20" />
        
        {/* Particle Effect for AR posts */}
        {isAR && <div className="absolute inset-0 particles opacity-40" />}
      </div>

      {/* Expiry Timer Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <div 
          className={`h-full transition-all duration-1000 ${isExpiringSoon ? 'bg-destructive' : 'bg-gradient-to-r from-cyan to-purple'}`}
          style={{ width: `${expiryProgress}%` }}
        />
      </div>

      {/* Top Indicators */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-6">
        {/* AR Indicator */}
        {isAR && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan/20 backdrop-blur-xl rounded-full border border-cyan/50 ar-pulse">
            <Sparkles className="w-4 h-4 text-cyan" />
            <span className="text-xs font-medium text-cyan">AR Ready</span>
          </div>
        )}
        
        {/* Expiry Timer */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl ${
          isExpiringSoon 
            ? 'bg-destructive/20 border border-destructive/50' 
            : 'bg-white/10 border border-white/20'
        }`}>
          <Clock className={`w-3.5 h-3.5 ${isExpiringSoon ? 'text-destructive' : 'text-white/70'}`} />
          <span className={`text-xs ${isExpiringSoon ? 'text-destructive font-medium' : 'text-white/70'}`}>
            {expiresIn}h left
          </span>
        </div>
      </div>

      {/* Right Side Actions - TikTok Style */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
        {/* Author Avatar with Hexagon Frame */}
        <div className="relative">
          <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 ${
            isGold ? 'ring-gold shadow-[0_0_20px_rgba(255,215,0,0.5)]' : 'ring-cyan'
          }`}>
            <Avatar className="w-full h-full">
              <AvatarImage src={authorAvatar} alt={authorName} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-purple to-pink text-white font-bold">
                {authorName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          {isOnline && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan rounded-full ring-2 ring-black flex items-center justify-center">
              <span className="text-[8px]">+</span>
            </div>
          )}
        </div>

        {/* Pound Button */}
        <button 
          onClick={handlePound}
          className={`flex flex-col items-center gap-1 transition-all ${isPounding ? 'scale-125' : 'hover:scale-110'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isPounding 
              ? 'bg-pink neon-glow-pink' 
              : 'bg-white/10 backdrop-blur-xl'
          }`}>
            <Heart className={`w-6 h-6 ${isPounding ? 'fill-white text-white' : 'text-white'}`} />
          </div>
          <span className="text-xs text-white font-medium">{poundsCount}</span>
        </button>

        {/* Comment Button */}
        <button 
          onClick={onComment}
          className="flex flex-col items-center gap-1 hover:scale-110 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white font-medium">{commentsCount}</span>
        </button>

        {/* Share Button */}
        <button 
          onClick={onShare}
          className="flex flex-col items-center gap-1 hover:scale-110 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Video Controls */}
        {videoUrl && (
          <>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center hover:scale-110 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
            </button>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center hover:scale-110 transition-all"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>
          </>
        )}
      </div>

      {/* Bottom Content Overlay */}
      <div className="relative z-10 mt-auto p-4 pb-20">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`font-bold text-lg ${isGold ? 'text-gold' : 'text-white'}`}>
            @{authorName}
            {isGold && <span className="ml-1">⭐</span>}
          </span>
          
          {/* Tagged Users */}
          {taggedUsers.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-white/60" />
              <div className="flex -space-x-2">
                {taggedUsers.slice(0, 3).map((user) => (
                  <Avatar key={user.id} className="w-6 h-6 ring-2 ring-black">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="text-[8px] bg-cyan text-black">
                      {user.username?.[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {taggedUsers.length > 3 && (
                <span className="text-xs text-white/60">+{taggedUsers.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Post Content */}
        <p 
          className={`text-white text-base leading-relaxed ${!showFullContent && content.length > 100 ? 'line-clamp-2' : ''}`}
          onClick={() => setShowFullContent(!showFullContent)}
        >
          {content}
        </p>
        {content.length > 100 && !showFullContent && (
          <button 
            onClick={() => setShowFullContent(true)}
            className="text-white/60 text-sm mt-1"
          >
            ...more
          </button>
        )}

        {/* Venue & Time */}
        <div className="flex items-center gap-3 mt-3 text-sm text-white/60">
          <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          {venueName && (
            <button 
              onClick={onVenueClick}
              className="flex items-center gap-1 text-cyan hover:underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              {venueName}
            </button>
          )}
        </div>

        {/* Holographic Token Indicator for Gold Posts */}
        {isGold && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full holographic">
            <span className="text-xs font-medium text-white">Premium Content</span>
          </div>
        )}
      </div>
    </article>
  );
};

export default ImmersivePostCard;
