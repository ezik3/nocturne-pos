import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import AmbientBackground from "./AmbientBackground";
import OrbsLayer from "./OrbsLayer";
import AIChat from "@/components/Customer/AIChat";
import CustomerMenuModal from "./CustomerMenuModal";
import CustomerChatModal from "./CustomerChatModal";
import { toast } from "sonner";

interface VenueShellProps {
  venueName: string;
  venueType?: string;
  vibeLevel?: string;
  priceLevel?: string;
  hours?: string;
  venueId?: string;
  onExit: () => void;
}

const VenueShell = ({
  venueName,
  venueType,
  vibeLevel = "🔥 Lit",
  priceLevel = "💰 $$",
  hours = "Closes 2 AM",
  venueId,
  onExit,
}: VenueShellProps) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleDoubleClick = () => {
    setShowAIChat(true);
    toast.success("AI Waiter summoned!");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      style={{ overflow: 'hidden', top: 0, left: 0, right: 0, bottom: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Ambient Background with particles */}
      <AmbientBackground />

      {/* Header Info Bar */}
      <motion.div
        className="fixed top-16 left-1/2 -translate-x-1/2 z-30"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20 shadow-[0_0_30px_rgba(0,217,255,0.2)]">
          <div className="flex items-center gap-4 text-white">
            <span className="font-bold text-lg">{venueName}</span>
            <span className="text-white/50">•</span>
            <span className="text-cyan">{vibeLevel}</span>
            <span className="text-white/50">•</span>
            <span className="text-purple">{priceLevel}</span>
            <span className="text-white/50">•</span>
            <span className="text-white/60">{hours}</span>
          </div>
        </div>
      </motion.div>

      {/* AI Waiter Notification */}
      <motion.div
        className="fixed top-28 right-4 z-30"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 bg-gold/20 backdrop-blur-md rounded-full px-4 py-2 border border-gold/30">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <span className="text-white/80 text-sm">Double tap for AI Waiter</span>
        </div>
      </motion.div>

      {/* Floating Orbs */}
      <OrbsLayer 
        onAIClick={() => setShowAIChat(true)} 
        onMenuClick={() => setShowMenu(true)}
        onChatClick={() => setShowChat(true)}
      />

      {/* Instructions Card */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-30"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-cyan/30 shadow-[0_0_30px_rgba(0,217,255,0.2)] max-w-sm">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-white/80 text-sm">
                  <p>🔮 Tap any orb to explore features</p>
                  <p>👆 Swipe up to exit venue</p>
                  <p>✨ Double tap anywhere for AI Waiter</p>
                </div>
              </div>
              <Button
                onClick={() => setShowInstructions(false)}
                className="w-full bg-gradient-to-r from-cyan to-purple text-white rounded-xl"
              >
                Got it!
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Button */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <Button
          onClick={onExit}
          variant="outline"
          className="bg-black/40 backdrop-blur-md border-white/20 text-white hover:bg-white/10 rounded-full px-6 py-3"
        >
          <ArrowDown className="w-5 h-5 mr-2" />
          Exit Venue
        </Button>
      </motion.div>

      {/* AI Chat Modal */}
      {showAIChat && (
        <AIChat
          context="ai_waiter"
          onClose={() => setShowAIChat(false)}
        />
      )}

      {/* Customer Menu Modal */}
      <CustomerMenuModal
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        venueId={venueId || ""}
        venueName={venueName}
      />

      {/* Customer Chat Modal */}
      <CustomerChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        venueId={venueId || ""}
        venueName={venueName}
      />
    </motion.div>
  );
};

export default VenueShell;
