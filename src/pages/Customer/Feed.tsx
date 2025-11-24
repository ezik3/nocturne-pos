import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  pounds_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  customer_profiles?: {
    display_name: string;
    avatar_url?: string;
  } | null;
  venues?: {
    name: string;
  } | null;
}

interface CustomerProfile {
  selected_background: string;
}

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [background, setBackground] = useState("dark");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("customer_profiles")
        .select("selected_background")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setBackground(profile.selected_background || "dark");
      }
    };

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        toast.error("Failed to load posts");
        console.error(error);
      } else {
        // Fetch profiles separately
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
    };

    fetchUserProfile();
    fetchPosts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handlePound = async (postId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("post_pounds")
      .insert({ post_id: postId, user_id: user.id });

    if (error) {
      toast.error("Failed to pound post");
    }
  };

  const getBackgroundClass = () => {
    switch (background) {
      case "purple":
        return "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400";
      case "white":
        return "bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100";
      case "geometric":
        return "bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600";
      default:
        return "bg-background";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your vibe...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getBackgroundClass()} transition-all duration-500`}>
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="bg-card/95 backdrop-blur-sm border border-border/50 p-6 space-y-4"
          >
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={post.customer_profiles?.avatar_url} />
                <AvatarFallback>
                  {post.customer_profiles?.display_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-primary">
                    {post.customer_profiles?.display_name || "Anonymous"}
                  </h3>
                  {post.venues && (
                    <span className="text-xs text-muted-foreground">
                      @ {post.venues.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

            {post.image_url && (
              <img
                src={post.image_url}
                alt="Post content"
                className="w-full rounded-lg object-cover max-h-96"
              />
            )}

            <div className="flex items-center gap-6 pt-2 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => handlePound(post.id)}
              >
                <Heart className="h-4 w-4" />
                <span className="text-sm">{post.pounds_count} Pounds</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{post.comments_count} Comments</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </Button>
            </div>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Be the first to share what's happening!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Feed;
