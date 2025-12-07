import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import FeedHeader from "@/components/Customer/Feed/FeedHeader";
import PostCard from "@/components/Customer/Feed/PostCard";
import CreatePostBox from "@/components/Customer/Feed/CreatePostBox";
import CreatePostModal from "@/components/Customer/Feed/CreatePostModal";
import NearbyUsersCarousel from "@/components/Customer/Feed/NearbyUsersCarousel";
import BackgroundSelector, { backgrounds } from "@/components/Customer/Feed/BackgroundSelector";
import FloatingAIButton from "@/components/Customer/FloatingAIButton";
import { Settings2, Sparkles } from "lucide-react";

interface Post {
  id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  pounds_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  venue_id?: string;
  visibility?: string;
  post_type?: string;
  customer_profiles?: {
    display_name: string;
    avatar_url?: string;
  } | null;
  venues?: {
    name: string;
  } | null;
}

interface NearbyUser {
  id: string;
  username: string;
  avatar_url?: string;
  distance?: number;
  isGold?: boolean;
  city?: string;
}

const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [background, setBackground] = useState("dark");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [canUseGold, setCanUseGold] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // First check localStorage for verified user data
      const verifiedName = localStorage.getItem("jv_verified_name");
      const profilePic = localStorage.getItem("jv_profile_picture");
      
      if (verifiedName || profilePic) {
        setCurrentUserProfile({
          display_name: verifiedName || undefined,
          avatar_url: profilePic || undefined,
        });
      }
      
      if (!user) return;

      const { data: profile } = await supabase
        .from("customer_profiles")
        .select("selected_background, display_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setBackground(profile.selected_background || "dark");
        // Prefer database profile over localStorage
        setCurrentUserProfile({
          display_name: profile.display_name || verifiedName || undefined,
          avatar_url: profile.avatar_url || profilePic || undefined,
        });
      }
    };

    fetchUserProfile();
  }, [user]);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      toast.error("Failed to load posts");
      console.error(error);
    } else {
      const postsWithProfiles = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profile } = await supabase
            .from("customer_profiles")
            .select("display_name, avatar_url")
            .eq("user_id", post.user_id)
            .single();
          return { ...post, customer_profiles: profile };
        })
      );
      setPosts(postsWithProfiles as Post[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();

    // Generate mock nearby public posters
    const cities = ["Brisbane", "Sydney", "Melbourne", "Perth", "Adelaide"];
    const mockUsers: NearbyUser[] = Array.from({ length: 8 }, (_, i) => ({
      id: `user-${i}`,
      username: `Party${Math.floor(Math.random() * 100)}`,
      avatar_url: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 20}.jpg`,
      distance: Math.random() * 5,
      isGold: i === 0 || i === 3,
      city: cities[Math.floor(Math.random() * cities.length)],
    }));
    setNearbyUsers(mockUsers);

    const channel = supabase
      .channel("posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  const handleNearbyUserClick = (nearbyUser: NearbyUser) => {
    // Navigate to city view with the user's city
    navigate("/app/city-view", { state: { city: nearbyUser.city || "Brisbane" } });
  };

  const handleBackgroundChange = async (newBackground: string) => {
    setBackground(newBackground);
    if (user) {
      await supabase
        .from("customer_profiles")
        .update({ selected_background: newBackground })
        .eq("user_id", user.id);
    }
  };

  const handlePound = async (postId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("post_pounds")
      .insert({ post_id: postId, user_id: user.id });
    if (error && !error.message.includes("duplicate")) {
      toast.error("Failed to pound post");
    }
  };

  const handleCreatePost = async (data: { content: string; visibility: "private" | "public"; isGold: boolean }) => {
    if (!user) return;

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      content: data.content,
      visibility: data.visibility,
      post_type: data.isGold ? "gold" : "standard",
    });

    if (error) {
      toast.error("Failed to create post");
    } else {
      toast.success(data.isGold ? "⭐ Gold post published!" : "Post published!");
      if (data.isGold) setCanUseGold(false);
    }
  };

  const getBackgroundClass = () => {
    return backgrounds.find((bg) => bg.id === background)?.className || backgrounds[0].className;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${getBackgroundClass()} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-white/80 animate-pulse">Loading your vibe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getBackgroundClass()} transition-all duration-700`}>
      <FeedHeader />
      
      {/* Settings & View Toggle */}
      <div className="fixed top-20 right-4 z-40 flex flex-col gap-2">
        <button
          onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
          className="p-2.5 bg-black/60 backdrop-blur-xl rounded-full ring-1 ring-white/20 hover:ring-neon-cyan transition-all duration-200"
        >
          <Settings2 className="w-5 h-5 text-white" />
        </button>
        
        {/* Immersive View Toggle */}
        <Link
          to="/app/feed/immersive"
          className="p-2.5 bg-gradient-to-r from-cyan/20 to-purple/20 backdrop-blur-xl rounded-full ring-1 ring-cyan/30 hover:ring-cyan transition-all duration-200 group"
          title="Try Immersive Mode"
        >
          <Sparkles className="w-5 h-5 text-cyan group-hover:text-white transition-colors" />
        </Link>
      </div>

      {showBackgroundPicker && (
        <div className="fixed top-32 right-4 z-40 animate-fade-in">
          <BackgroundSelector selected={background} onSelect={handleBackgroundChange} />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-32 space-y-4">
        <CreatePostBox
          userAvatar={currentUserProfile?.avatar_url}
          userName={currentUserProfile?.display_name}
          onClick={() => setShowCreateModal(true)}
        />

        {posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            authorName={post.customer_profiles?.display_name || "Anonymous"}
            authorAvatar={post.customer_profiles?.avatar_url}
            isOnline={Math.random() > 0.5}
            isGold={post.post_type === "gold"}
            content={post.content}
            imageUrl={post.image_url}
            videoUrl={post.video_url}
            venueName={post.venues?.name}
            poundsCount={post.pounds_count || 0}
            commentsCount={post.comments_count || 0}
            createdAt={post.created_at}
            onPound={() => handlePound(post.id)}
            onComment={() => toast.info("Comments coming soon!")}
            onShare={() => toast.info("Share coming soon!")}
          />
        ))}

        {posts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
            <p className="text-white/60">Be the first to share what's happening!</p>
          </div>
        )}
      </main>

      {/* Public Posters Carousel (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 py-2 px-4">
          <p className="text-xs text-neon-cyan font-medium mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
            Public Posters Nearby
          </p>
        </div>
        <NearbyUsersCarousel
          users={nearbyUsers}
          onUserClick={handleNearbyUserClick}
        />
      </div>

      {/* Floating AI Button - Side Position */}
      <div className="fixed left-4 bottom-32 z-40">
        <FloatingAIButton />
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userAvatar={currentUserProfile?.avatar_url}
        userName={currentUserProfile?.display_name}
        canUseGold={canUseGold}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default Feed;
