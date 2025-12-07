import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, LogOut, Wallet, Edit2, UserPlus, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Web3FeedHeader from "@/components/Customer/Feed/Web3FeedHeader";

// Mock friends data
const mockFriends = [
  { id: "1", name: "Emma W.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" },
  { id: "2", name: "Mike B.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
  { id: "3", name: "Soph L.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
  { id: "4", name: "Jake R.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
  { id: "5", name: "Liv D.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" },
];

// Mock interests
const mockInterests = ["EDM", "House Music", "Nightlife", "DJing", "Music Production", "Dancing", "Festivals"];

const ProfileNew = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    location: "",
    avatar_url: "",
    followers: 1234,
    following: 567,
    events: 89,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      // First check localStorage for verified name and picture
      const verifiedName = localStorage.getItem("jv_verified_name");
      const profilePicture = localStorage.getItem("jv_profile_picture");

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
      }
      
      setProfile({
        display_name: verifiedName || data?.display_name || "DJ Sarah Spin",
        bio: data?.bio || "Electro-house DJ and music producer with a passion for creating unforgettable nights. Spinning beats and igniting dance floors across the globe. Let's make some noise! 🎧🔥",
        location: data?.location || "Sin City",
        avatar_url: profilePicture || data?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
        followers: 1234,
        following: 567,
        events: 89,
      });
      
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-lg text-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Web3FeedHeader />
      
      {/* Hero Section with Video Background Option */}
      <div className="relative h-[50vh] overflow-hidden">
        {/* Background - could be video or image */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-black to-pink-900/30" />
        <div className="absolute inset-0 web3-grid opacity-20" />
        
        {/* Video Play Button (indicating video background option) */}
        <button className="absolute top-6 left-6 w-14 h-14 bg-neon-green rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-neon-green/30">
          <Play className="w-7 h-7 text-black ml-1" fill="currentColor" />
        </button>

        {/* Top Right Actions */}
        <div className="absolute top-6 right-6 flex gap-3">
          <Button
            variant="outline"
            className="bg-neon-cyan/20 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/30 rounded-xl"
            onClick={() => navigate("/app/wallet")}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </Button>
          <Button
            variant="outline"
            className="bg-neon-pink/20 border-neon-pink text-neon-pink hover:bg-neon-pink/30 rounded-xl"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Audio Control */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-6 right-6 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="flex items-end gap-6">
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-4xl bg-secondary">
                {profile.display_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pb-2">
              <h1 className="text-4xl font-bold text-white mb-1">{profile.display_name}</h1>
              <div className="flex items-center gap-2 text-lg mb-4">
                <span className="text-foreground/70">@{profile.display_name.toLowerCase().replace(/\s+/g, '')}</span>
                <span className="text-neon-cyan">@{profile.location}</span>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 mb-4">
                <div>
                  <span className="text-neon-cyan text-2xl font-bold">{profile.followers.toLocaleString()}</span>
                  <span className="text-foreground/60 ml-2">Followers</span>
                </div>
                <div>
                  <span className="text-neon-purple text-2xl font-bold">{profile.following}</span>
                  <span className="text-foreground/60 ml-2">Following</span>
                </div>
                <div>
                  <span className="text-neon-pink text-2xl font-bold">{profile.events}</span>
                  <span className="text-foreground/60 ml-2">Events</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 rounded-xl"
                  onClick={() => navigate("/app/profile/edit")}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white rounded-xl">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* About Me */}
        <div className="bg-secondary/30 rounded-2xl p-6 border border-border/30">
          <h2 className="text-neon-cyan text-2xl font-bold mb-4">About Me</h2>
          <p className="text-foreground/80 leading-relaxed">{profile.bio}</p>
          
          <h3 className="text-neon-pink text-xl font-bold mt-6 mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {mockInterests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1.5 bg-neon-purple/20 text-neon-purple rounded-full text-sm border border-neon-purple/30"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Friends */}
        <div className="bg-secondary/30 rounded-2xl p-6 border border-border/30">
          <h2 className="text-neon-pink text-2xl font-bold mb-4">Friends</h2>
          <div className="flex flex-wrap gap-6">
            {mockFriends.map((friend) => (
              <div key={friend.id} className="flex flex-col items-center gap-2">
                <Avatar className="w-20 h-20 border-2 border-neon-purple">
                  <AvatarImage src={friend.avatar} />
                  <AvatarFallback>{friend.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-foreground/80 text-sm">{friend.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-secondary/30 rounded-2xl p-6 border border-border/30 lg:col-span-2">
          <h2 className="text-neon-cyan text-2xl font-bold mb-4">Recent Posts</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 border border-border/30 hover:border-neon-cyan/50 transition-colors cursor-pointer overflow-hidden"
              >
                <img
                  src={`https://images.unsplash.com/photo-${1540039155733 + i * 1000}-5bb30b53aa14?w=300`}
                  alt={`Post ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileNew;
