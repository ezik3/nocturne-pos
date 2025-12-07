import { motion } from "framer-motion";
import FloatingOrb from "./FloatingOrb";
import { Utensils, MessageSquare, Users, Music, Video, Bot } from "lucide-react";
import { toast } from "sonner";

interface OrbsLayerProps {
  onMenuClick?: () => void;
  onChatClick?: () => void;
  onTableClick?: () => void;
  onDJClick?: () => void;
  onFeedClick?: () => void;
  onAIClick?: () => void;
}

const OrbsLayer = ({
  onMenuClick,
  onChatClick,
  onTableClick,
  onDJClick,
  onFeedClick,
  onAIClick,
}: OrbsLayerProps) => {
  const orbs = [
    {
      icon: <Utensils className="w-8 h-8" />,
      label: "Menu",
      color: "hsl(var(--cyan))",
      glowColor: "rgba(0, 217, 255, 0.4)",
      position: { top: "15%", left: "15%" },
      onClick: onMenuClick || (() => toast.info("Menu feature coming soon!")),
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      label: "Chat",
      color: "hsl(var(--purple))",
      glowColor: "rgba(168, 85, 247, 0.4)",
      position: { top: "15%", left: "50%", transform: "translateX(-50%)" },
      onClick: onChatClick || (() => toast.info("Chat feature coming soon!")),
    },
    {
      icon: <Bot className="w-8 h-8" />,
      label: "AI Waiter",
      color: "hsl(var(--gold))",
      glowColor: "rgba(251, 191, 36, 0.4)",
      position: { top: "15%", right: "15%" },
      onClick: onAIClick || (() => toast.info("AI Waiter feature coming soon!")),
    },
    {
      icon: <Users className="w-8 h-8" />,
      label: "My Table",
      color: "#14B8A6",
      glowColor: "rgba(20, 184, 166, 0.4)",
      position: { top: "45%", left: "10%" },
      onClick: onTableClick || (() => toast.info("My Table feature coming soon!")),
    },
    {
      icon: <Music className="w-8 h-8" />,
      label: "DJ Booth",
      color: "#9333EA",
      glowColor: "rgba(147, 51, 234, 0.4)",
      position: { top: "45%", right: "10%" },
      onClick: onDJClick || (() => toast.info("DJ Booth feature coming soon!")),
    },
    {
      icon: <Video className="w-8 h-8" />,
      label: "Live Feed",
      color: "hsl(var(--pink))",
      glowColor: "rgba(236, 72, 153, 0.4)",
      position: { bottom: "25%", left: "50%", transform: "translateX(-50%)" },
      onClick: onFeedClick || (() => toast.info("Live Feed feature coming soon!")),
    },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {orbs.map((orb, index) => (
        <motion.div
          key={orb.label}
          className="absolute pointer-events-auto"
          style={orb.position as any}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.15, duration: 0.5, type: "spring" }}
        >
          <FloatingOrb
            icon={orb.icon}
            label={orb.label}
            color={orb.color}
            glowColor={orb.glowColor}
            delay={index * 0.15}
            onClick={orb.onClick}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default OrbsLayer;
