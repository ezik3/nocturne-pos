import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import AIChat from "./AIChat";

export default function FloatingAIButton() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <Button
        size="lg"
        className="rounded-full w-14 h-14 shadow-2xl hover:scale-110 transition-transform bg-gradient-to-br from-neon-purple to-neon-pink hover:from-neon-pink hover:to-neon-purple"
        onClick={() => setShowChat(true)}
      >
        <Bot className="h-6 w-6 text-white" />
      </Button>

      {showChat && (
        <AIChat 
          context="venue_assistant" 
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}
