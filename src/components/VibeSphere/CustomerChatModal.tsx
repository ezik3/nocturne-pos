import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Pin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  color: string;
  isPinned?: boolean;
  timestamp: Date;
  isVenue?: boolean;
}

interface CustomerChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId: string;
  venueName: string;
}

// Generate random colors for usernames
const usernameColors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
];

const getRandomColor = () => usernameColors[Math.floor(Math.random() * usernameColors.length)];

const CustomerChatModal = ({ isOpen, onClose, venueId, venueName }: CustomerChatModalProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userColor] = useState(getRandomColor());
  const [username, setUsername] = useState("Guest");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user profile for display name
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("customer_profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();
      
      if (data?.display_name) {
        setUsername(data.display_name);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: "welcome",
          username: venueName,
          message: `Welcome to ${venueName}! Feel free to chat with the venue staff.`,
          color: "#00D9FF",
          isPinned: true,
          timestamp: new Date(),
          isVenue: true
        }
      ]);
    }
  }, [isOpen, venueName]);

  // Simulate venue responses (in production, would use real-time messaging)
  useEffect(() => {
    if (!isOpen) return;

    const venueResponses = [
      "A server will be with you shortly!",
      "Thanks for joining us today! 🎉",
      "Our specials tonight are amazing!",
      "Let us know if you need anything!",
    ];

    const interval = setInterval(() => {
      // Randomly add venue messages occasionally
      if (Math.random() > 0.7) {
        const randomResponse = venueResponses[Math.floor(Math.random() * venueResponses.length)];
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          username: venueName,
          message: randomResponse,
          color: "#00D9FF",
          timestamp: new Date(),
          isVenue: true
        };
        setMessages(prev => [...prev.slice(-50), newMsg]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isOpen, venueName]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      username: username,
      message: newMessage,
      color: userColor,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, msg]);
    setNewMessage("");
  };

  const pinnedMessage = messages.find(m => m.isPinned);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative w-full max-w-md h-[70vh] flex flex-col bg-black/90 backdrop-blur-xl rounded-2xl border border-border/30 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/30 bg-secondary/30">
            <div>
              <h3 className="text-foreground font-semibold">Live Chat</h3>
              <p className="text-xs text-muted-foreground">{venueName}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Pinned Message */}
          {pinnedMessage && (
            <div className="px-4 py-2 bg-primary/10 border-b border-border/20">
              <div className="flex items-center gap-2 text-xs">
                <Pin className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Pinned message</span>
              </div>
              <p className="text-sm mt-1">
                <span style={{ color: pinnedMessage.color }} className="font-bold">
                  {pinnedMessage.username}
                </span>
                <span className="text-foreground">: {pinnedMessage.message}</span>
              </p>
            </div>
          )}

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {messages.filter(m => !m.isPinned).map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm leading-relaxed"
              >
                {msg.isVenue && (
                  <span className="text-primary mr-1">✦</span>
                )}
                <span style={{ color: msg.color }} className="font-bold">
                  {msg.username}
                </span>
                <span className="text-foreground">: {msg.message}</span>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/30 bg-secondary/20">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Send a message..."
                className="bg-background/50 border-border/30 text-foreground placeholder:text-muted-foreground text-sm"
              />
              <Button 
                size="icon" 
                onClick={handleSend}
                className="bg-primary hover:bg-primary/80"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerChatModal;
