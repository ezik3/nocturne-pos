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
    <div className="min-h-screen bg-background">
      <Web3FeedHeader />
      
      {/* Hero Section with Video Background Option */}
      <div className="relative h-[45vh] min-h-[350px] overflow-hidden">
        {/* Background - could be video or image */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-background to-pink-900/30" />
        <div className="absolute inset-0 web3-grid opacity-20" />
        
        {/* Video Play Button (indicating video background option) */}
        <button className="absolute top-4 left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/30 z-10">
          <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
        </button>

        {/* Audio Control */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 w-10 h-10 bg-background/50 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent">
          <div className="flex items-end gap-6 max-w-6xl mx-auto">
            <Avatar className="w-28 h-28 border-4 border-primary shadow-xl shadow-primary/20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-3xl bg-secondary">
                {profile.display_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-foreground mb-1">{profile.display_name}</h1>
              <div className="flex items-center gap-2 text-base mb-3">
                <span className="text-muted-foreground">@{profile.display_name.toLowerCase().replace(/\s+/g, '')}</span>
                <span className="text-primary">@{profile.location}</span>
              </div>
              
              {/* Stats */}
              <div className="flex gap-6 mb-3">
                <div>
                  <span className="text-primary text-xl font-bold">{profile.followers.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-2 text-sm">Followers</span>
                </div>
                <div>
                  <span className="text-accent text-xl font-bold">{profile.following}</span>
                  <span className="text-muted-foreground ml-2 text-sm">Following</span>
                </div>
                <div>
                  <span className="text-pink-500 text-xl font-bold">{profile.events}</span>
                  <span className="text-muted-foreground ml-2 text-sm">Events</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary/20 rounded-lg"
                  onClick={() => navigate("/app/profile/edit")}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Follow
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/50 text-primary hover:bg-primary/20 rounded-lg"
                  onClick={() => navigate("/app/wallet")}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Wallet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/50 text-destructive hover:bg-destructive/20 rounded-lg"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* About Me */}
        <div className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-primary text-xl font-bold mb-4">About Me</h2>
          <p className="text-foreground/80 leading-relaxed text-sm">{profile.bio}</p>
          
          <h3 className="text-accent text-lg font-bold mt-6 mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {mockInterests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs border border-accent/30"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Friends */}
        <div className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-pink-500 text-xl font-bold mb-4">Friends</h2>
          <div className="flex flex-wrap gap-4">
            {mockFriends.map((friend) => (
              <div key={friend.id} className="flex flex-col items-center gap-2">
                <Avatar className="w-16 h-16 border-2 border-accent/50">
                  <AvatarImage src={friend.avatar} />
                  <AvatarFallback>{friend.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground text-xs">{friend.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-card/50 rounded-2xl p-6 border border-border/50 lg:col-span-2">
          <h2 className="text-primary text-xl font-bold mb-4">Recent Posts</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-gradient-to-br from-accent/20 to-pink-500/20 border border-border/50 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden"
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
