import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Camera, MapPin, Users, Sparkles, Globe, Lock, X, Image, Video, Upload, Navigation, Radio } from "lucide-react";
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
    isLive: boolean;
    imageUrl?: string;
    videoUrl?: string;
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
  const [isLive, setIsLive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState(userName);
  const [displayAvatar, setDisplayAvatar] = useState(userAvatar);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setSelectedVideo(null);
        setMediaType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video must be less than 50MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedVideo(reader.result as string);
        setSelectedImage(null);
        setMediaType('video');
      };
      reader.readAsDataURL(file);
    }
  };

  const clearMedia = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setMediaType(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedImage && !selectedVideo) {
      toast.error("Please write something or add media!");
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
    await onSubmit({ 
      content, 
      visibility, 
      isGold,
      isLive: visibility === "public" && isLive,
      imageUrl: selectedImage || undefined,
      videoUrl: selectedVideo || undefined,
    });
    setIsSubmitting(false);
    setContent("");
    setIsGold(false);
    setIsLive(false);
    clearMedia();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-gray-900 via-black to-gray-900 border-white/10 p-0 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-white/10 sticky top-0 bg-gray-900/95 backdrop-blur-xl z-10">
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
                  ? "bg-gradient-to-r from-neon-cyan to-cyan-600 text-white shadow-[0_0_20px_rgba(0,255,255,0.4)]" 
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              <Globe className="w-4 h-4 text-current" />
              <span>Public</span>
            </button>
          </div>

          {/* Go Live Option - Only for Public Posts */}
          {visibility === "public" && (
            <button
              type="button"
              onClick={() => setIsLive(!isLive)}
              className={`w-full p-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                isLive 
                  ? "border-green-500 bg-gradient-to-r from-green-500/20 to-emerald-500/20 shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                  : "border-white/10 hover:border-green-500/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isLive ? "bg-green-500" : "bg-white/10"
              }`}>
                <Radio className={`w-5 h-5 ${isLive ? "text-white animate-pulse" : "text-green-500"}`} />
              </div>
              <div className="text-left flex-1">
                <p className={`font-semibold ${isLive ? "text-green-500" : "text-white"}`}>
                  🔴 Go Live
                </p>
                <p className="text-xs text-muted-foreground">Show you're active & broadcasting</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                isLive ? "border-green-500 bg-green-500" : "border-white/30"
              }`}>
                {isLive && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
              </div>
            </button>
          )}

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
              className={`min-h-[100px] bg-transparent border-none resize-none text-white placeholder:text-white/40 focus-visible:ring-0 p-0 ${
                isGold ? "placeholder:text-yellow-400/50" : ""
              }`}
              maxLength={500}
            />
          </div>

          {/* Location Tag */}
          {locationName && (
            <div className="flex items-center gap-2 px-3 py-2 bg-neon-cyan/10 rounded-lg border border-neon-cyan/30">
              <MapPin className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm text-neon-cyan">{locationName}</span>
              <button onClick={() => setLocationName("")} className="ml-auto hover:bg-white/10 rounded-full p-1">
                <X className="w-3 h-3 text-white/60" />
              </button>
            </div>
          )}

          {/* Media Preview - Maintains Aspect Ratio */}
          {(selectedImage || selectedVideo) && (
            <div className="relative rounded-xl overflow-hidden bg-black/30">
              {selectedImage && (
                <img 
                  src={selectedImage} 
                  alt="Selected" 
                  className="w-full max-h-[300px] object-contain mx-auto" 
                />
              )}
              {selectedVideo && (
                <video 
                  src={selectedVideo} 
                  className="w-full max-h-[300px] object-contain mx-auto" 
                  controls 
                />
              )}
              <button
                onClick={clearMedia}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Action Buttons - Sticky Footer */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-cyan-500/30 hover:bg-cyan-500/40 border-2 border-cyan-400"
              onClick={() => imageInputRef.current?.click()}
            >
              <Image className="w-5 h-5 text-cyan-300" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-purple-500/30 hover:bg-purple-500/40 border-2 border-purple-400"
              onClick={() => videoInputRef.current?.click()}
            >
              <Video className="w-5 h-5 text-purple-300" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-pink-500/30 hover:bg-pink-500/40 border-2 border-pink-400"
            >
              <Users className="w-5 h-5 text-pink-300" />
            </Button>
            <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`${locationName ? 'bg-yellow-400/30' : 'bg-yellow-400/20'} hover:bg-yellow-400/30 border border-yellow-400/50`}
                >
                  <MapPin className="w-5 h-5 text-yellow-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 bg-gray-900 border-white/20" align="start">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white">Add Location</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter location name..."
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          () => toast.success("Location detected!"),
                          () => toast.error("Could not get location")
                        );
                      }
                    }}
                    className="w-full bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/30"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Use Current Location
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setIsLocationOpen(false)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground">{content.length}/500</span>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={(!content.trim() && !selectedImage && !selectedVideo) || isSubmitting}
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
