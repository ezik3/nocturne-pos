import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface StoryUser {
  id: string;
  username: string;
  avatar_url?: string;
  isGold?: boolean;
  hasUnseenStory?: boolean;
  expiresIn?: number; // hours
  city?: string;
}

interface HexagonalStoryRingProps {
  users: StoryUser[];
  onUserClick: (user: StoryUser) => void;
}

const HexagonalStoryRing = ({ users, onUserClick }: HexagonalStoryRingProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide py-3 px-4">
      {users.map((user, index) => {
        const progress = user.expiresIn ? Math.min(100, (user.expiresIn / 24) * 100) : 100;
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
              {/* Hexagonal outer ring */}
              <div 
                className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                  user.hasUnseenStory 
                    ? user.isGold 
                      ? 'bg-gradient-to-br from-gold via-orange to-gold shadow-[0_0_20px_rgba(255,215,0,0.4)]'
                      : 'bg-gradient-to-br from-cyan via-purple to-pink neon-glow-cyan'
                    : 'bg-white/20'
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

              {/* Expiry Timer - Small Arc */}
              {user.hasUnseenStory && user.expiresIn && (
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
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs">⭐</span>
                </div>
              )}
            </div>

            {/* Username */}
            <span className={`text-xs font-medium truncate max-w-[70px] ${
              user.hasUnseenStory ? 'text-white' : 'text-white/50'
            }`}>
              {user.username}
            </span>
            
            {/* City indicator */}
            {user.city && (
              <span className="text-[10px] text-cyan/70 -mt-1">
                📍 {user.city}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default HexagonalStoryRing;
