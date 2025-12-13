import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import AIChat from "./AIChat";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";

export default function FloatingAIButton() {
  const [showChat, setShowChat] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 100], [1, 0]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle drag end to determine if button should hide
  const handleDragEnd = () => {
    if (x.get() > 60) {
      // Swiped right - hide the button
      controls.start({ x: 200, opacity: 0 });
      setIsHidden(true);
    } else {
      // Snap back
      controls.start({ x: 0, opacity: 1 });
    }
  };

  // Handle screen edge swipe to bring back
  useEffect(() => {
    if (!isHidden) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touchX = e.touches[0].clientX;
      const screenWidth = window.innerWidth;
      
      // If touch starts near right edge (within 30px)
      if (touchX > screenWidth - 30) {
        (window as any).__aiButtonSwipeStart = touchX;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const startX = (window as any).__aiButtonSwipeStart;
      if (!startX) return;
      
      const endX = e.changedTouches[0].clientX;
      const swipeDistance = startX - endX;
      
      // If swiped left by at least 50px from right edge
      if (swipeDistance > 50) {
        setIsHidden(false);
        controls.start({ x: 0, opacity: 1 });
      }
      
      (window as any).__aiButtonSwipeStart = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isHidden, controls]);

  return (
    <>
      <motion.div
        ref={containerRef}
        className="fixed right-4 bottom-24 z-40"
        drag="x"
        dragConstraints={{ left: 0, right: 200 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, opacity }}
      >
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-2xl hover:scale-110 transition-transform bg-gradient-to-br from-neon-purple to-neon-pink hover:from-neon-pink hover:to-neon-purple"
          onClick={() => setShowChat(true)}
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      </motion.div>

      {/* Swipe hint indicator when hidden */}
      {isHidden && (
        <div className="fixed right-0 bottom-28 z-30 w-1 h-16 bg-gradient-to-b from-cyan to-purple rounded-l-full opacity-50 animate-pulse" />
      )}

      {showChat && (
        <AIChat 
          context="venue_assistant" 
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}
