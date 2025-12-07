import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface StoryUser {
  id: string;
  username: string;
  avatar_url?: string;
  isGold?: boolean;
  hasUnseenStory?: boolean;
  expiresIn?: number; // hours
  city?: string;
  distance?: number; // km
  isOnline?: boolean;
  postedAt?: Date;
}

interface HexagonalStoryRingProps {
  users: StoryUser[];
  onUserClick: (user: StoryUser) => void;
}

const HexagonalStoryRing = ({ users, onUserClick }: HexagonalStoryRingProps) => {
  // Sort users: closest first when scrolling right-to-left (default order)
  // Most recent posts appear first (closest), older/seen posts appear further right
  const sortedUsers = [...users].sort((a, b) => {
    // First by hasUnseenStory (unseen first)
    if (a.hasUnseenStory && !b.hasUnseenStory) return -1;
    if (!a.hasUnseenStory && b.hasUnseenStory) return 1;
    
    // Then by distance (closest first for unseen, furthest first for seen)
    const distA = a.distance ?? 999;
    const distB = b.distance ?? 999;
    
    if (a.hasUnseenStory && b.hasUnseenStory) {
      return distA - distB; // Closest unseen posts first
    }
    
    // For seen posts, show older/further ones when scrolling right
    return distB - distA;
  });

  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide py-3 px-4">
      {sortedUsers.map((user, index) => {
        const isExpiringSoon = (user.expiresIn || 24) <= 6;
        
        return (
          <button
            key={user.id}
            onClick={() => onUserClick(user)}
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Story Ring with Progress */}
            <div className="relative">
              {/* Hexagonal outer ring - only purple or gold */}
              <div 
                className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                  user.isGold 
                    ? 'bg-gradient-to-br from-gold via-orange to-gold shadow-[0_0_20px_rgba(255,215,0,0.4)]'
                    : 'bg-gradient-to-br from-purple via-pink to-purple shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                }`}
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              >
                <div 
                  className="w-[64px] h-[64px] bg-black flex items-center justify-center"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                >
                  <Avatar className="w-[56px] h-[56px] clip-hexagon">
                    <AvatarImage src={user.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-purple to-pink text-white font-bold clip-hexagon">
                      {user.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Online Indicator - green circle */}
              {user.isOnline && (
                <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              )}

              {/* Expiry Timer - Small Arc */}
              {user.expiresIn && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                  <div className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isExpiringSoon 
                      ? 'bg-destructive text-white' 
                      : 'bg-black/80 text-white/70'
                  }`}>
                    {user.expiresIn}h
                  </div>
                </div>
              )}

              {/* Gold Badge */}
              {user.isGold && (
                <div className="absolute -top-1 -left-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs">⭐</span>
                </div>
              )}
            </div>

            {/* Username */}
            <span className="text-xs font-medium truncate max-w-[70px] text-white">
              {user.username}
            </span>
            
            {/* City/Distance indicator */}
            {(user.city || user.distance !== undefined) && (
              <span className="text-[10px] text-cyan/70 -mt-1 flex items-center gap-1">
                📍 {user.distance !== undefined ? `${user.distance}km` : user.city}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default HexagonalStoryRing;
