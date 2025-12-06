import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, Play, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TaggedUser {
  id: string;
  username: string;
  avatar_url?: string;
}

interface PostCardProps {
  id: string;
  authorName: string;
  authorAvatar?: string;
  isOnline?: boolean;
  isGold?: boolean;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  venueName?: string;
  taggedUsers?: TaggedUser[];
  poundsCount: number;
  commentsCount: number;
  createdAt: string;
  onPound: () => void;
  onComment: () => void;
  onShare: () => void;
  onVenueClick?: () => void;
}

const PostCard = ({
  authorName,
  authorAvatar,
  isOnline = false,
  isGold = false,
  content,
  imageUrl,
  videoUrl,
  venueName,
  taggedUsers = [],
  poundsCount,
  commentsCount,
  createdAt,
  onPound,
  onComment,
  onShare,
  onVenueClick,
}: PostCardProps) => {
  const [isPounding, setIsPounding] = useState(false);

  const handlePound = () => {
    setIsPounding(true);
    onPound();
    setTimeout(() => setIsPounding(false), 300);
  };

  return (
    <article 
      className={`relative bg-white/95 dark:bg-black/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
        isGold 
          ? "ring-2 ring-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.3)]" 
          : "ring-1 ring-white/10"
      }`}
    >
      {/* Gold Post Indicator */}
      {isGold && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className={`w-12 h-12 ring-2 ${isGold ? "ring-yellow-400" : "ring-neon-purple"}`}>
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-white font-bold">
                {authorName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -left-0.5 top-0 w-3 h-3 bg-neon-cyan rounded-full ring-2 ring-white dark:ring-black" />
            )}
          </div>
          <div className="flex flex-col">
            <span className={`font-semibold text-base ${isGold ? "text-yellow-500" : "text-neon-purple"}`}>
              {authorName}
              {isGold && <span className="ml-1">⭐</span>}
            </span>
            {taggedUsers.length > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-muted-foreground">w/</span>
                <div className="flex -space-x-2">
                  {taggedUsers.slice(0, 3).map((user) => (
                    <Avatar key={user.id} className="w-5 h-5 ring-1 ring-white dark:ring-black">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="text-[8px] bg-neon-cyan text-black">
                        {user.username?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {taggedUsers.length > 3 && (
                  <span className="text-xs text-muted-foreground">& {taggedUsers.length - 3} others</span>
                )}
              </div>
            )}
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        <p className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {/* Media */}
      {(imageUrl || videoUrl) && (
        <div className="relative mt-2">
          {videoUrl ? (
            <div className="relative">
              <img 
                src={imageUrl || videoUrl} 
                alt="Post media" 
                className="w-full aspect-video object-cover"
              />
              <button className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                  <Play className="w-8 h-8 text-black ml-1" fill="black" />
                </div>
              </button>
            </div>
          ) : imageUrl && (
            <img 
              src={imageUrl} 
              alt="Post media" 
              className="w-full max-h-96 object-cover"
            />
          )}
        </div>
      )}

      {/* Stats & Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <span className="text-neon-cyan font-semibold">{poundsCount} <span className="text-muted-foreground font-normal">pounds</span></span>
            <span className="text-neon-purple font-semibold">{commentsCount} <span className="text-muted-foreground font-normal">comments</span></span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: false })}</span>
            {venueName && (
              <>
                <span>@</span>
                <button 
                  onClick={onVenueClick}
                  className="text-neon-cyan hover:underline"
                >
                  {venueName}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex border-t border-white/10 dark:border-white/5 -mx-4 px-4 pt-2">
          <button 
            onClick={handlePound}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/5 ${
              isPounding ? "scale-110" : ""
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-foreground">
              <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3 6l3 4 3-4c1.5-1.5 3-3.5 3-6 0-3.5-2.5-6-6-6z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9h6M9 12h6M10 15h4" 
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="w-px bg-white/10" />
          <button 
            onClick={onComment}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors hover:bg-white/5"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-foreground">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="w-px bg-white/10" />
          <button 
            onClick={onShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors hover:bg-white/5"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
