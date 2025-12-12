import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FistBumpAnimationProps {
  show: boolean;
  onComplete: () => void;
}

const FistBumpAnimation = ({ show, onComplete }: FistBumpAnimationProps) => {
  const [phase, setPhase] = useState<"approach" | "bump" | "disperse">("approach");
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; rotation: number; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      setPhase("approach");
      
      // Approach for 400ms, then bump
      const bumpTimer = setTimeout(() => {
        setPhase("bump");
        // Generate particles on bump
        const newParticles = Array.from({ length: 8 }, (_, i) => ({
          id: i,
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200 - 50, // Bias upward then fall
          rotation: Math.random() * 360,
          delay: Math.random() * 0.1,
        }));
        setParticles(newParticles);
      }, 400);
      
      // Disperse after bump
      const disperseTimer = setTimeout(() => {
        setPhase("disperse");
      }, 600);
      
      // Complete animation
      const completeTimer = setTimeout(() => {
        onComplete();
        setParticles([]);
      }, 1500);
      
      return () => {
        clearTimeout(bumpTimer);
        clearTimeout(disperseTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
        {/* Left Fist */}
        <motion.div
          initial={{ x: -200, rotate: -15 }}
          animate={
            phase === "approach" 
              ? { x: -40, rotate: -15 }
              : phase === "bump"
              ? { x: -30, rotate: 0, scale: 1.1 }
              : { x: -100, rotate: -30, opacity: 0 }
          }
          transition={{ 
            duration: phase === "approach" ? 0.4 : phase === "bump" ? 0.1 : 0.5,
            ease: phase === "bump" ? "easeOut" : "easeInOut"
          }}
          className="absolute"
        >
          <svg 
            viewBox="0 0 80 80" 
            className="w-24 h-24 text-white drop-shadow-2xl"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          >
            {/* Left fist - side view pointing right */}
            <ellipse cx="40" cy="40" rx="28" ry="24" fill="url(#fistGradient)" />
            {/* Knuckle bumps */}
            <circle cx="62" cy="30" r="6" fill="url(#fistGradient)" />
            <circle cx="62" cy="40" r="6" fill="url(#fistGradient)" />
            <circle cx="62" cy="50" r="6" fill="url(#fistGradient)" />
            <circle cx="58" cy="24" r="4" fill="url(#fistGradient)" />
            {/* Thumb */}
            <ellipse cx="25" cy="55" rx="10" ry="6" fill="url(#fistGradient)" />
            {/* Wrist */}
            <rect x="8" y="32" width="20" height="16" rx="4" fill="url(#fistGradient)" />
            
            <defs>
              <linearGradient id="fistGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fcd5b0" />
                <stop offset="50%" stopColor="#e5b896" />
                <stop offset="100%" stopColor="#c9a07c" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Right Fist */}
        <motion.div
          initial={{ x: 200, rotate: 15 }}
          animate={
            phase === "approach" 
              ? { x: 40, rotate: 15 }
              : phase === "bump"
              ? { x: 30, rotate: 0, scale: 1.1 }
              : { x: 100, rotate: 30, opacity: 0 }
          }
          transition={{ 
            duration: phase === "approach" ? 0.4 : phase === "bump" ? 0.1 : 0.5,
            ease: phase === "bump" ? "easeOut" : "easeInOut"
          }}
          className="absolute"
          style={{ transform: 'scaleX(-1)' }}
        >
          <svg 
            viewBox="0 0 80 80" 
            className="w-24 h-24 text-white drop-shadow-2xl"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            style={{ transform: 'scaleX(-1)' }}
          >
            {/* Right fist - mirrored */}
            <ellipse cx="40" cy="40" rx="28" ry="24" fill="url(#fistGradient2)" />
            <circle cx="62" cy="30" r="6" fill="url(#fistGradient2)" />
            <circle cx="62" cy="40" r="6" fill="url(#fistGradient2)" />
            <circle cx="62" cy="50" r="6" fill="url(#fistGradient2)" />
            <circle cx="58" cy="24" r="4" fill="url(#fistGradient2)" />
            <ellipse cx="25" cy="55" rx="10" ry="6" fill="url(#fistGradient2)" />
            <rect x="8" y="32" width="20" height="16" rx="4" fill="url(#fistGradient2)" />
            
            <defs>
              <linearGradient id="fistGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fcd5b0" />
                <stop offset="50%" stopColor="#e5b896" />
                <stop offset="100%" stopColor="#c9a07c" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Impact flash on bump */}
        {phase === "bump" && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute w-16 h-16 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full blur-xl"
          />
        )}

        {/* Falling fist particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ 
              x: particle.x, 
              y: particle.y + 300, // Fall down
              opacity: 0, 
              scale: 0.3,
              rotate: particle.rotation 
            }}
            transition={{ 
              duration: 1.2,
              delay: particle.delay,
              ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for natural fall
            }}
            className="absolute"
          >
            <svg 
              viewBox="0 0 40 40" 
              className="w-8 h-8"
              fill="url(#particleGradient)"
            >
              <ellipse cx="20" cy="20" rx="14" ry="12" />
              <circle cx="31" cy="16" r="3" />
              <circle cx="31" cy="22" r="3" />
              <defs>
                <linearGradient id="particleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fcd5b0" />
                  <stop offset="100%" stopColor="#c9a07c" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};

export default FistBumpAnimation;
