import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ExitVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId: string;
  venueName: string;
  onExitOnly: () => void;
  onCheckout: () => void;
}

const ExitVenueModal = ({ 
  isOpen, 
  onClose, 
  venueId, 
  venueName,
  onExitOnly,
  onCheckout 
}: ExitVenueModalProps) => {
  const { user } = useAuth();

  const handleExitOnly = () => {
    // Just exit the VibeSphere view but stay checked in
    onExitOnly();
    toast.success("Exited VenueVerse - you're still checked in!");
    onClose();
  };

  const handleFullCheckout = async () => {
    if (!user || !venueId) {
      onCheckout();
      onClose();
      return;
    }

    try {
      // Update check_in record with checkout time
      const { error } = await supabase
        .from("check_ins")
        .update({ checked_out_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("venue_id", venueId)
        .is("checked_out_at", null);

      if (error) throw error;

      toast.success(`Checked out of ${venueName}`);
      onCheckout();
      onClose();
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error("Failed to checkout. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          className="relative w-full max-w-sm bg-gradient-to-b from-secondary/95 to-background/95 backdrop-blur-xl rounded-3xl border border-primary/20 shadow-2xl shadow-primary/10 p-6"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Content */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <DoorOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Leaving {venueName}?
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose how you'd like to exit
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Exit but Stay Checked In */}
            <Button
              variant="outline"
              className="w-full h-14 justify-start gap-4 border-primary/30 hover:bg-primary/10 rounded-xl"
              onClick={handleExitOnly}
            >
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <DoorOpen className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Exit VenueVerse</p>
                <p className="text-xs text-muted-foreground">Stay checked in, browse the app</p>
              </div>
            </Button>

            {/* Full Checkout */}
            <Button
              variant="outline"
              className="w-full h-14 justify-start gap-4 border-red-500/30 hover:bg-red-500/10 rounded-xl"
              onClick={handleFullCheckout}
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Checkout Completely</p>
                <p className="text-xs text-muted-foreground">Leave venue & sign out of location</p>
              </div>
            </Button>
          </div>

          {/* Cancel */}
          <Button
            variant="ghost"
            className="w-full mt-4 text-muted-foreground"
            onClick={onClose}
          >
            Cancel
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExitVenueModal;
