import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, MapPin, Users, Sparkles, Globe, Lock, X } from "lucide-react";
import { toast } from "sonner";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAvatar?: string;
  userName?: string;
  canUseGold?: boolean;
  onSubmit: (data: {
    content: string;
    visibility: "private" | "public";
    isGold: boolean;
    venue?: string;
  }) => void;
}

const CreatePostModal = ({
  isOpen,
  onClose,
  userAvatar,
  userName,
  canUseGold = false,
  onSubmit,
}: CreatePostModalProps) => {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [isGold, setIsGold] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState(userName);
  const [displayAvatar, setDisplayAvatar] = useState(userAvatar);

  // Get user data from localStorage (from ID verification) if not provided
  useEffect(() => {
    if (!userName) {
      const verifiedName = localStorage.getItem("jv_verified_name");
      if (verifiedName) setDisplayName(verifiedName);
    } else {
      setDisplayName(userName);
    }
    
    if (!userAvatar) {
      const profilePic = localStorage.getItem("jv_profile_picture");
      if (profilePic) setDisplayAvatar(profilePic);
    } else {
      setDisplayAvatar(userAvatar);
    }
  }, [userName, userAvatar]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please write something to share!");
      return;
    }

    if (visibility === "public") {
      // Request location permission
      if (!navigator.geolocation) {
        toast.error("Geolocation not supported");
        return;
      }
    }

    setIsSubmitting(true);
    await onSubmit({ content, visibility, isGold });
    setIsSubmitting(false);
    setContent("");
    setIsGold(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-gray-900 via-black to-gray-900 border-white/10 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Create Post
            </DialogTitle>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Privacy Toggle */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setVisibility("private")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                visibility === "private" 
                  ? "bg-gradient-to-r from-neon-purple to-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Private</span>
            </button>
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                visibility === "public" 
                  ? "bg-gradient-to-r from-neon-cyan to-cyan-600 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]" 
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Public</span>
            </button>
          </div>

          {/* Gold Post Option */}
          {canUseGold && (
            <button
              type="button"
              onClick={() => setIsGold(!isGold)}
              className={`w-full p-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                isGold 
                  ? "border-yellow-400 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 shadow-[0_0_20px_rgba(255,215,0,0.3)]" 
                  : "border-white/10 hover:border-yellow-400/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isGold ? "bg-yellow-400" : "bg-white/10"
              }`}>
                <Sparkles className={`w-5 h-5 ${isGold ? "text-black" : "text-yellow-400"}`} />
              </div>
              <div className="text-left flex-1">
                <p className={`font-semibold ${isGold ? "text-yellow-400" : "text-white"}`}>
                  ⭐ Make it a Gold Post
                </p>
                <p className="text-xs text-muted-foreground">Highlighted & prioritized (1 per 24h)</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                isGold ? "border-yellow-400 bg-yellow-400" : "border-white/30"
              }`}>
                {isGold && <div className="w-2 h-2 bg-black rounded-full" />}
              </div>
            </button>
          )}

          {/* Author Info + Textarea */}
          <div className={`rounded-xl p-4 transition-all duration-300 ${
            isGold 
              ? "bg-gradient-to-br from-yellow-400/10 to-amber-400/10 ring-2 ring-yellow-400/50" 
              : "bg-white/5"
          }`}>
            <div className="flex gap-3 mb-3">
              <Avatar className={`w-10 h-10 ring-2 ${isGold ? "ring-yellow-400" : "ring-neon-purple"}`}>
                <AvatarImage src={displayAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-white">
                  {displayName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className={`font-semibold ${isGold ? "text-yellow-400" : "text-white"}`}>
                  {displayName || "Set up your profile"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {visibility === "private" ? "Friends only" : "Everyone nearby"}
                </p>
              </div>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your party vibes... ✨"
              className={`min-h-[120px] bg-transparent border-none resize-none text-white placeholder:text-white/40 focus-visible:ring-0 p-0 ${
                isGold ? "placeholder:text-yellow-400/50" : ""
              }`}
              maxLength={5000}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-neon-cyan hover:bg-neon-cyan/10">
              <Camera className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-neon-purple hover:bg-neon-purple/10">
              <Users className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-neon-pink hover:bg-neon-pink/10">
              <MapPin className="w-5 h-5" />
            </Button>
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground">{content.length}/5000</span>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className={`w-full h-12 font-bold text-base transition-all duration-300 ${
              isGold
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black shadow-[0_0_30px_rgba(255,215,0,0.4)]"
                : "bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan/90 hover:to-neon-purple/90 text-white shadow-[0_0_30px_rgba(139,92,246,0.3)]"
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>🎉 Post</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
