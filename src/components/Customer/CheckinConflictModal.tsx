import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, X } from "lucide-react";

interface CheckinConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVenueName: string;
  newVenueName: string;
  onCheckoutAndContinue: () => void;
  isLoading?: boolean;
}

const CheckinConflictModal = ({
  isOpen,
  onClose,
  currentVenueName,
  newVenueName,
  onCheckoutAndContinue,
  isLoading = false,
}: CheckinConflictModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-secondary/95 rounded-2xl p-6 max-w-sm w-full border border-border/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-orange-400" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white text-center mb-2">
              Already Checked In
            </h2>

            {/* Description */}
            <p className="text-white/70 text-center text-sm mb-6">
              You're currently checked into{" "}
              <span className="text-cyan font-semibold">{currentVenueName}</span>
            </p>

            {/* Visual flow */}
            <div className="flex items-center justify-center gap-3 mb-6 py-4 bg-black/30 rounded-xl">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-1">
                  <MapPin className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-xs text-white/60 max-w-[80px] truncate">
                  {currentVenueName}
                </p>
              </div>
              
              <ArrowRight className="w-6 h-6 text-white/40" />
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-1">
                  <MapPin className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-xs text-white/60 max-w-[80px] truncate">
                  {newVenueName}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onCheckoutAndContinue}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-cyan to-purple text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Switching...
                  </div>
                ) : (
                  <>
                    Checkout & Check Into {newVenueName}
                  </>
                )}
              </Button>

              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full h-10 text-white/60 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckinConflictModal;
