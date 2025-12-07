import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lock, Globe, MessageCircle } from "lucide-react";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postAuthorName: string;
  postAuthorAvatar?: string;
  userAvatar?: string;
  userName?: string;
  onSubmitComment: (data: { content: string; isPrivate: boolean; postId: string }) => void;
}

const CommentModal = ({
  isOpen,
  onClose,
  postId,
  postAuthorName,
  postAuthorAvatar,
  userAvatar,
  userName,
  onSubmitComment,
}: CommentModalProps) => {
  const [comment, setComment] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmitComment({
        content: comment.trim(),
        isPrivate,
        postId,
      });
      setComment("");
      setIsPrivate(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl p-0 max-w-md overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-white/10">
          <DialogTitle className="flex items-center gap-3 text-white">
            <MessageCircle className="w-5 h-5 text-neon-cyan" />
            Reply to {postAuthorName}
          </DialogTitle>
        </DialogHeader>

        {/* Post Author Preview */}
        <div className="p-4 bg-white/5 mx-4 mt-4 rounded-xl flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-neon-purple">
            <AvatarImage src={postAuthorAvatar} alt={postAuthorName} />
            <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-white font-bold">
              {postAuthorName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-medium">{postAuthorName}</p>
            <p className="text-white/50 text-xs">Original poster</p>
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-4 space-y-4">
          {/* User Avatar + Textarea */}
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-neon-cyan shrink-0">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback className="bg-gradient-to-br from-neon-cyan to-neon-purple text-white font-bold">
                {userName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isPrivate ? "Write a private message..." : "Write a comment..."}
              className={`flex-1 min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none rounded-xl focus:ring-2 ${
                isPrivate ? "focus:ring-amber-500 border-amber-500/50" : "focus:ring-neon-cyan"
              }`}
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2">
              {isPrivate ? (
                <Lock className="w-4 h-4 text-amber-500" />
              ) : (
                <Globe className="w-4 h-4 text-neon-cyan" />
              )}
              <span className={`text-sm font-medium ${isPrivate ? "text-amber-500" : "text-white/70"}`}>
                {isPrivate ? "Private Comment" : "Public Comment"}
              </span>
            </div>
            
            <div className="flex bg-black/50 rounded-lg p-1 gap-1">
              <button
                onClick={() => setIsPrivate(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  !isPrivate 
                    ? "bg-neon-cyan text-black" 
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5 inline mr-1" />
                Public
              </button>
              <button
                onClick={() => setIsPrivate(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isPrivate 
                    ? "bg-amber-500 text-black" 
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Lock className="w-3.5 h-3.5 inline mr-1" />
                Private
              </button>
            </div>
          </div>

          {/* Private Comment Info */}
          {isPrivate && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              <p className="text-amber-500 text-xs">
                🔒 This comment will only be visible to {postAuthorName}. They'll receive a special notification and can reply privately. All future messages between you two on this thread will remain private.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!comment.trim() || isSubmitting}
            className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              isPrivate 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90" 
                : "bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90"
            }`}
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Sending..." : isPrivate ? "Send Private Reply" : "Post Comment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentModal;
