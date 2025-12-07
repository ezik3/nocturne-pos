import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Users } from "lucide-react";

interface TaggedUser {
  id: string;
  username: string;
  avatar_url?: string;
  age?: number;
  relationship_status?: string;
  location?: string;
  connection_count?: number;
}

interface TaggedUsersDisplayProps {
  users: TaggedUser[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

interface UserPopupProps {
  user: TaggedUser | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserPopup = ({ user, isOpen, onClose }: UserPopupProps) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-0 max-w-xs overflow-hidden">
        {/* Background Image */}
        <div className="relative h-32 bg-gradient-to-br from-cyan/30 via-purple/30 to-pink/30">
          <img 
            src={`https://picsum.photos/seed/${user.id}/400/200`}
            alt="Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        {/* Profile Content */}
        <div className="relative -mt-12 px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <Avatar className="w-20 h-20 ring-4 ring-neon-cyan shadow-[0_0_20px_rgba(0,255,255,0.4)]">
              <AvatarImage src={user.avatar_url} alt={user.username} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-white text-xl font-bold">
                {user.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="text-center mt-4 space-y-1">
            <h3 className="text-xl font-bold text-white">{user.username}</h3>
            <p className="text-white/60 text-sm">
              {user.age && `${user.age}, `}
              {user.relationship_status || "Single"}
            </p>
            <p className="text-neon-cyan text-sm">{user.location || "Unknown Location"}</p>
          </div>

          {/* Connection Count */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 text-white/70">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{user.connection_count || 0}</span>
            </div>
          </div>

          {/* Connect Button */}
          <button className="w-full mt-4 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Connect
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TaggedUsersDisplay = ({ 
  users, 
  maxDisplay = 5, 
  size = "md",
  showLabel = true 
}: TaggedUsersDisplayProps) => {
  const [selectedUser, setSelectedUser] = useState<TaggedUser | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);

  if (users.length === 0) return null;

  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  const sizeClasses = {
    sm: "w-6 h-6 ring-1",
    md: "w-8 h-8 ring-2",
    lg: "w-10 h-10 ring-2",
  };

  const avatarSize = sizeClasses[size];

  return (
    <>
      <div className="flex items-center gap-2">
        {showLabel && <span className="text-white/60 text-sm">with</span>}
        
        {/* Avatar Stack */}
        <div className="flex -space-x-2">
          {displayUsers.map((user, index) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`${avatarSize} rounded-full ring-neon-purple/70 hover:ring-neon-cyan hover:z-10 transition-all hover:scale-110`}
              style={{ zIndex: displayUsers.length - index }}
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={user.avatar_url} alt={user.username} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-white text-xs font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          ))}
        </div>

        {/* Remaining Count */}
        {remainingCount > 0 && (
          <button
            onClick={() => setShowAllUsers(true)}
            className="text-white/60 text-sm hover:text-neon-cyan transition-colors"
          >
            and {remainingCount} {remainingCount === 1 ? 'other' : 'others'}
          </button>
        )}
      </div>

      {/* Individual User Popup */}
      <UserPopup 
        user={selectedUser} 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />

      {/* All Tagged Users Modal */}
      <Dialog open={showAllUsers} onOpenChange={setShowAllUsers}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-sm">
          <h3 className="text-lg font-bold text-white mb-4">Tagged in this post</h3>
          <div className="flex flex-wrap gap-3">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  setShowAllUsers(false);
                  setTimeout(() => setSelectedUser(user), 200);
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <Avatar className="w-12 h-12 ring-2 ring-neon-purple/50 hover:ring-neon-cyan transition-all">
                  <AvatarImage src={user.avatar_url} alt={user.username} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-white text-sm font-bold">
                    {user.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-white/80 truncate max-w-[60px]">{user.username}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaggedUsersDisplay;
