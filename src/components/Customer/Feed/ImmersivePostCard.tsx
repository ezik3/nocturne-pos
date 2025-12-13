import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Play, Pause, Volume2, VolumeX, MessageCircle, Share2, Sparkles, Clock, MapPin, X, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import TaggedUsersDisplay from "./TaggedUsersDisplay";
import FistPoundIcon from "./FistPoundIcon";
import FistBumpAnimation from "./FistBumpAnimation";

interface TaggedUser {
  id: string;
  username: string;
  avatar_url?: string;
  age?: number;
  relationship_status?: string;
  location?: string;
  connection_count?: number;
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
  expiresIn?: number;
  onPound: () => void;
  onComment: () => void;
  onShare: () => void;
  onVenueClick?: () => void;
  isActive?: boolean;
  allPosts?: Array<{ id: string; content: string; videoUrl?: string; imageUrl?: string }>;
  onNavigateToSimilar?: (postId: string) => void;
}

// Global state for mute preference
let globalMutePreference = true;

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
  allPosts = [],
  onNavigateToSimilar,
}: ImmersivePostCardProps) => {
  const [isPounding, setIsPounding] = useState(false);
  const [showFistBump, setShowFistBump] = useState(false);
  const [isMuted, setIsMuted] = useState(globalMutePreference);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showFullscreenVideo, setShowFullscreenVideo] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const MAX_PREVIEW_LENGTH = 50;

  const handlePound = () => {
    setIsPounding(true);
    setShowFistBump(true);
    onPound();
    setTimeout(() => setIsPounding(false), 1500);
  };

  const handleFistBumpComplete = useCallback(() => {
    setShowFistBump(false);
  }, []);

  // Calculate expiry percentage (0-100)
  const expiryProgress = Math.max(0, Math.min(100, (expiresIn / 24) * 100));
  const isExpiringSoon = expiresIn <= 6;

  // Find similar videos based on content
  const findSimilarVideo = useCallback(() => {
    if (!allPosts || allPosts.length <= 1) return null;
    
    const currentWords = content.toLowerCase().split(/\s+/);
    let bestMatch: { id: string; score: number } | null = null;
    
    for (const post of allPosts) {
      if (post.id === id || !post.videoUrl) continue;
      
      const postWords = post.content.toLowerCase().split(/\s+/);
      const commonWords = currentWords.filter(word => 
        word.length > 3 && postWords.includes(word)
      );
      const score = commonWords.length;
      
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { id: post.id, score };
      }
    }
    
    // If no good match, return any video post
    if (!bestMatch || bestMatch.score === 0) {
      const videoPosts = allPosts.filter(p => p.id !== id && p.videoUrl);
      if (videoPosts.length > 0) {
        return videoPosts[Math.floor(Math.random() * videoPosts.length)].id;
      }
    }
    
    return bestMatch?.id || null;
  }, [allPosts, content, id]);

  // Handle video autoplay when active (muted by default)
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      if (isActive) {
        videoRef.current.muted = isMuted;
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, videoUrl, isMuted]);

  // Open fullscreen media (video or image) with sound for videos
  const handleMediaClick = useCallback(() => {
    if (videoUrl || imageUrl) {
      setShowFullscreenVideo(true);
      if (videoUrl) {
        // When opening fullscreen video, unmute globally
        globalMutePreference = false;
        setIsMuted(false);
      }
    }
  }, [videoUrl, imageUrl]);

  // Close fullscreen and return to feed with sound enabled
  const handleCloseFullscreen = useCallback(() => {
    setShowFullscreenVideo(false);
    // Sound stays on after exiting fullscreen (swipe left/right)
  }, []);

  // Handle swipe gestures in fullscreen
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;
    
    // Horizontal swipe - go back to feed
    if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY)) {
      handleCloseFullscreen();
    }
    // Vertical swipe up - show similar content
    else if (deltaY < -80 && Math.abs(deltaY) > Math.abs(deltaX)) {
      const similarPostId = findSimilarVideo();
      if (similarPostId && onNavigateToSimilar) {
        handleCloseFullscreen();
        onNavigateToSimilar(similarPostId);
      } else {
        handleCloseFullscreen();
      }
    }
    
    setTouchStart(null);
  };

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    globalMutePreference = newMuted;
    setIsMuted(newMuted);
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.muted = newMuted;
    }
  }, [isMuted]);

  // Toggle play/pause for fullscreen video (including audio)
  const handleTogglePlayPause = useCallback(() => {
    if (fullscreenVideoRef.current) {
      const video = fullscreenVideoRef.current;
      if (video.paused) {
        video.volume = 1;
        video.muted = false;
        video.play().catch(() => {});
        setIsVideoPaused(false);
      } else {
        // STOP the video and audio completely
        video.pause();
        video.currentTime = video.currentTime; // Force stop
        video.muted = true;
        video.volume = 0;
        setIsVideoPaused(true);
      }
    }
  }, []);

  // Also pause background video when fullscreen opens
  useEffect(() => {
    if (showFullscreenVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.muted = true;
    }
  }, [showFullscreenVideo]);

  // Play fullscreen video when opened
  useEffect(() => {
    if (showFullscreenVideo && fullscreenVideoRef.current && videoUrl) {
      const video = fullscreenVideoRef.current;
      video.volume = 1;
      video.muted = false;
      video.play().catch(() => {});
      setIsVideoPaused(false);
    }
  }, [showFullscreenVideo, videoUrl]);

  return (
    <>
      {/* Fist Bump Animation Overlay */}
      <FistBumpAnimation show={showFistBump} onComplete={handleFistBumpComplete} />

      {/* Fullscreen Media Modal - rendered via portal to cover EVERYTHING */}
      {(showFullscreenVideo && (videoUrl || imageUrl)) && createPortal(
        <div 
          className="fixed inset-0 bg-black flex items-center justify-center"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 999999 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={videoUrl ? handleTogglePlayPause : undefined}
        >
          {videoUrl ? (
            <video
              ref={fullscreenVideoRef}
              src={videoUrl}
              autoPlay
              loop
              playsInline
              className="w-full h-full object-contain md:object-contain"
              style={{ maxWidth: '100vw', maxHeight: '100vh' }}
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePlayPause();
              }}
            />
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Post" 
              className="w-full h-full object-contain"
              style={{ maxWidth: '100vw', maxHeight: '100vh' }}
            />
          ) : null}
          
          {/* Play/Pause indicator for videos */}
          {videoUrl && isVideoPaused && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-lg flex items-center justify-center">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
            </div>
          )}
          
          {/* Close button - positioned at top */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCloseFullscreen();
            }}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/70 backdrop-blur-lg flex items-center justify-center"
            style={{ zIndex: 1000000 }}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          {/* Mute button in fullscreen */}
          {videoUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-black/50 backdrop-blur-lg flex items-center justify-center"
              style={{ zIndex: 1000000 }}
            >
              {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
            </button>
          )}
          
          {/* Swipe indicators */}
          <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/50 text-sm"
            style={{ zIndex: 1000000 }}
          >
            <div className="flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              <ChevronRight className="w-4 h-4" />
              <span>Swipe to exit</span>
            </div>
            <div className="flex items-center gap-1">
              <ChevronUp className="w-4 h-4" />
              <span>Swipe up for similar</span>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Full Content Overlay */}
      {showFullContent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
          onClick={() => setShowFullContent(false)}
        >
          <div 
            className="max-w-lg max-h-[80vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl p-6 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar className={`w-10 h-10 ring-2 ${isGold ? 'ring-gold' : 'ring-cyan'}`}>
                <AvatarImage src={authorAvatar} alt={authorName} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-purple to-pink text-white font-bold">
                  {authorName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className={`font-bold ${isGold ? 'text-gold' : 'text-white'}`}>
                @{authorName}
              </span>
            </div>
            <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
            <button 
              onClick={() => setShowFullContent(false)}
              className="mt-4 text-cyan text-sm hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}

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
            onClick={handleMediaClick}
            className="w-full h-full object-cover cursor-pointer"
          />
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Post" 
            className="w-full h-full object-cover cursor-pointer" 
            onClick={handleMediaClick}
          />
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
        
        {/* Play indicator for videos - tap to open fullscreen */}
        {videoUrl && !showFullscreenVideo && (
          <button 
            onClick={handleMediaClick}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center hover:scale-110 transition-all z-10"
          >
            <Play className="w-10 h-10 text-white ml-1" />
          </button>
        )}
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
            <FistPoundIcon className={`w-6 h-6 ${isPounding ? 'text-white' : 'text-white'}`} filled={isPounding} />
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

        {/* Mute/Unmute Button - Only for videos */}
        {videoUrl && (
          <button 
            onClick={toggleMute}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center hover:scale-110 transition-all"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>
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
            <TaggedUsersDisplay users={taggedUsers} maxDisplay={5} size="sm" showLabel={false} />
          )}
        </div>

        {/* Post Content */}
        {content.length > MAX_PREVIEW_LENGTH && !showFullContent ? (
          <p className="text-white text-base leading-relaxed">
            {content.slice(0, MAX_PREVIEW_LENGTH)}...
            <button 
              onClick={() => setShowFullContent(true)}
              className="ml-1 text-cyan font-medium hover:underline"
            >
              read more
            </button>
          </p>
        ) : (
          <p className="text-white text-base leading-relaxed">
            {content}
          </p>
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
    </>
  );
};

export default ImmersivePostCard;
