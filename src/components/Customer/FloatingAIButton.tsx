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
        className="fixed bottom-20 md:bottom-6 right-6 rounded-full w-14 h-14 shadow-2xl hover:scale-110 transition-transform z-40"
        onClick={() => setShowChat(true)}
      >
        <Bot className="h-6 w-6" />
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
