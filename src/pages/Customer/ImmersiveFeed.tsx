import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Web3FeedHeader from "@/components/Customer/Feed/Web3FeedHeader";
import ImmersivePostCard from "@/components/Customer/Feed/ImmersivePostCard";
import HexagonalStoryRing from "@/components/Customer/Feed/HexagonalStoryRing";
import CreatePostModal from "@/components/Customer/Feed/CreatePostModal";
import CommentModal from "@/components/Customer/Feed/CommentModal";
import FloatingAIButton from "@/components/Customer/FloatingAIButton";
import { Plus, ChevronDown, Sparkles } from "lucide-react";

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
  is_live?: boolean;
  customer_profiles?: {
    display_name?: string;
    avatar_url?: string;
  } | null;
  venues?: {
    name: string;
  } | null;
}

interface StoryUser {
  id: string;
  username: string;
  avatar_url?: string;
  isGold?: boolean;
  hasUnseenStory?: boolean;
  expiresIn?: number;
  city?: string;
  distance?: number;
  isOnline?: boolean;
  isLive?: boolean;
}

const ImmersiveFeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false); // Start with false for faster initial render
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null);
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [canUseGold, setCanUseGold] = useState(true);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
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
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setCurrentUserProfile({
          display_name: profile.display_name || verifiedName || undefined,
          avatar_url: profile.avatar_url || profilePic || undefined,
        });
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch posts - optimized for speed
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error(error);
        return;
      }
      
      // Set posts immediately without waiting for profiles
      setPosts(data as Post[]);
      
      // Then fetch profiles in background
      if (data && data.length > 0) {
        const postsWithProfiles = await Promise.all(
          data.map(async (post) => {
            const { data: profile } = await supabase
              .from("customer_profiles")
              .select("display_name, avatar_url")
              .eq("user_id", post.user_id)
              .maybeSingle();
            return { ...post, customer_profiles: profile };
          })
        );
        setPosts(postsWithProfiles as Post[]);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    // Generate mock story users (public posters) - sorted by distance (closest first)
    const cities = ["Brisbane", "Sydney", "Melbourne", "Perth", "Adelaide", "Gold Coast"];
    const mockUsers: StoryUser[] = Array.from({ length: 12 }, (_, i) => ({
      id: `user-${i}`,
      username: `Party${Math.floor(Math.random() * 100)}`,
      avatar_url: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 20}.jpg`,
      isGold: i === 0 || i === 3 || i === 7,
      hasUnseenStory: i < 8,
      expiresIn: Math.floor(Math.random() * 20) + 4,
      city: cities[Math.floor(Math.random() * cities.length)],
      distance: Math.round((i * 2.5 + Math.random() * 5) * 10) / 10, // km from user
      isOnline: Math.random() > 0.4, // 60% chance of being online
      isLive: i === 1 || i === 4 || i === 8, // Some users are live broadcasting
    }));
    // Sort by distance (closest first for new posts)
    mockUsers.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setStoryUsers(mockUsers);

    // Subscribe to real-time updates
    const channel = supabase
      .channel("posts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  // Handle story user click
  const handleStoryClick = (storyUser: StoryUser) => {
    navigate("/app/city-view", { state: { city: storyUser.city || "Brisbane" } });
  };

  // Handle comment click
  const handleCommentClick = (post: Post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  // Handle comment submission
  const handleSubmitComment = async (data: { content: string; isPrivate: boolean; postId: string }) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: data.postId,
        user_id: user.id,
        content: data.content,
      });

      if (error) throw error;
      
      if (data.isPrivate) {
        toast.success("Private reply sent! They'll receive a special notification.");
      } else {
        toast.success("Comment posted!");
      }
      fetchPosts();
    } catch (error) {
      toast.error("Failed to post comment");
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

  const handleCreatePost = async (data: { 
    content: string; 
    visibility: "private" | "public"; 
    isGold: boolean;
    isLive: boolean;
    imageUrl?: string;
    videoUrl?: string;
  }) => {
    if (!user) return;

    // Optimistically add the post to the feed immediately
    const optimisticPost: Post = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      content: data.content,
      visibility: data.visibility,
      post_type: data.isGold ? "gold" : "standard",
      is_live: data.isLive,
      image_url: data.imageUrl,
      video_url: data.videoUrl,
      pounds_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      customer_profiles: currentUserProfile,
    };

    // Add to beginning of feed immediately
    setPosts(prev => [optimisticPost, ...prev]);

    const { data: newPost, error } = await supabase.from("posts").insert({
      user_id: user.id,
      content: data.content,
      visibility: data.visibility,
      post_type: data.isGold ? "gold" : "standard",
      is_live: data.isLive,
      image_url: data.imageUrl,
      video_url: data.videoUrl,
    }).select().single();

    if (error) {
      toast.error("Failed to create post");
      // Remove optimistic post on error
      setPosts(prev => prev.filter(p => p.id !== optimisticPost.id));
    } else {
      toast.success(data.isGold ? "⭐ Gold post published!" : data.isLive ? "🔴 You're now live!" : "Post published!");
      if (data.isGold) setCanUseGold(false);
      // Replace optimistic post with real post
      setPosts(prev => prev.map(p => p.id === optimisticPost.id ? { ...newPost, customer_profiles: currentUserProfile } : p));
    }
  };

  // Handle scroll snap
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const postHeight = window.innerHeight - 160; // Account for header + stories
    const newIndex = Math.round(scrollTop / postHeight);
    setCurrentPostIndex(newIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-cyan/30 rounded-full animate-ping" />
            <div className="absolute inset-2 border-4 border-purple/50 rounded-full animate-pulse" />
            <div className="absolute inset-4 border-4 border-pink/70 rounded-full animate-spin" />
          </div>
          <p className="text-white/80 animate-pulse">Loading your vibe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Web3FeedHeader />
      
      {/* Stories Section */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-gradient-to-b from-black via-black/95 to-transparent pb-4">
        <HexagonalStoryRing users={storyUsers} onUserClick={handleStoryClick} />
      </div>

      {/* Immersive Post Feed */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="fixed top-14 left-0 right-0 bottom-0 w-full overflow-y-auto scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {posts.length === 0 ? null : (
          posts.map((post, index) => (
            <div 
              key={post.id} 
              className="w-full h-full"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ImmersivePostCard
                id={post.id}
                authorName={post.customer_profiles?.display_name || "Anonymous"}
                authorAvatar={post.customer_profiles?.avatar_url}
                isOnline={Math.random() > 0.5}
                isGold={post.post_type === "gold"}
                isAR={index % 3 === 0}
                content={post.content}
                imageUrl={post.image_url}
                videoUrl={post.video_url}
                venueName={post.venues?.name}
                poundsCount={post.pounds_count || 0}
                commentsCount={post.comments_count || 0}
                createdAt={post.created_at}
                expiresIn={Math.floor(Math.random() * 20) + 4}
                onPound={() => handlePound(post.id)}
                onComment={() => handleCommentClick(post)}
                onShare={() => toast.info("Share coming soon!")}
                isActive={index === currentPostIndex}
                allPosts={posts.map(p => ({ id: p.id, content: p.content, videoUrl: p.video_url, imageUrl: p.image_url }))}
                onNavigateToSimilar={(postId) => {
                  const targetIndex = posts.findIndex(p => p.id === postId);
                  if (targetIndex !== -1 && containerRef.current) {
                    const postHeight = containerRef.current.clientHeight;
                    containerRef.current.scrollTo({ top: targetIndex * postHeight, behavior: 'smooth' });
                    setCurrentPostIndex(targetIndex);
                  }
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* Scroll Indicator */}
      {posts.length > 1 && currentPostIndex < posts.length - 1 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce z-30">
          <span className="text-white/50 text-xs">Scroll for more</span>
          <ChevronDown className="w-5 h-5 text-white/50" />
        </div>
      )}

      {/* Floating Create Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-r from-cyan to-purple rounded-full flex items-center justify-center shadow-2xl neon-glow-cyan hover:scale-110 transition-all z-40"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      {/* Floating AI Button - Bottom Right with Swipe */}
      <FloatingAIButton />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userAvatar={currentUserProfile?.avatar_url}
        userName={currentUserProfile?.display_name}
        canUseGold={canUseGold}
        onSubmit={handleCreatePost}
      />

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setSelectedPost(null);
        }}
        postId={selectedPost?.id || ""}
        postAuthorName={selectedPost?.customer_profiles?.display_name || "Anonymous"}
        postAuthorAvatar={selectedPost?.customer_profiles?.avatar_url}
        userAvatar={currentUserProfile?.avatar_url}
        userName={currentUserProfile?.display_name}
        onSubmitComment={handleSubmitComment}
      />
    </div>
  );
};

export default ImmersiveFeed;
