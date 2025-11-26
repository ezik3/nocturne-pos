import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Menu, Users, Waves, MessageCircle, ChevronUp, Phone } from "lucide-react";
import AIChat from "@/components/Customer/AIChat";

interface ImmersiveVenueProps {
  venueName: string;
  venueType: string;
  priceRange: string;
  closingTime: string;
}

export default function ImmersiveVenue({ 
  venueName = "The Electric Lounge",
  venueType = "Nightclub",
  priceRange = "$$",
  closingTime = "2 AM"
}: ImmersiveVenueProps) {
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features = [
    { id: "menu", icon: Menu, label: "Order Menu", color: "from-purple-500 to-pink-500" },
    { id: "ai-waiter", icon: Bot, label: "AI Waiter", color: "from-blue-500 to-cyan-500" },
    { id: "table", icon: Users, label: "My Table", color: "from-green-500 to-emerald-500" },
    { id: "dj", icon: Waves, label: "DJ Booth", color: "from-orange-500 to-red-500" },
    { id: "feed", icon: MessageCircle, label: "Live Feed", color: "from-indigo-500 to-purple-500" },
    { id: "call-waiter", icon: Phone, label: "Call Waiter", color: "from-yellow-500 to-orange-500" }
  ];

  const handleFeatureClick = (featureId: string) => {
    if (featureId === "ai-waiter") {
      setShowAIChat(true);
    } else {
      setSelectedFeature(featureId);
      // Handle other features
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 text-center">
        <Badge className="mb-4 text-sm px-4 py-2">
          🔥 Lit · {priceRange} · Open until {closingTime}
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {venueName}
        </h1>
        <p className="text-muted-foreground text-lg">Immersive Venue Mode</p>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="glass border-primary/20 mb-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">Tap any orb to explore features</h2>
              <p className="text-muted-foreground mb-2">Double tap anywhere for AI Waiter</p>
              <p className="text-sm text-muted-foreground">Swipe up to exit venue</p>
            </CardContent>
          </Card>

          {/* Feature orbs */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature.id)}
                className="group relative"
              >
                <div className={`
                  aspect-square rounded-full bg-gradient-to-br ${feature.color}
                  flex flex-col items-center justify-center gap-3
                  transform transition-all duration-300
                  hover:scale-110 hover:shadow-2xl hover:shadow-primary/50
                  active:scale-95
                  cursor-pointer
                `}>
                  <feature.icon className="h-12 w-12 md:h-16 md:w-16 text-white drop-shadow-lg" />
                  <span className="text-white font-bold text-sm md:text-base px-2">
                    {feature.label}
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="glass border-primary/40 hover:border-primary group"
            >
              <ChevronUp className="h-5 w-5 mr-2 group-hover:animate-bounce" />
              Swipe up to exit venue
            </Button>
          </div>
        </div>
      </div>

      {/* AI Chat overlay */}
      {showAIChat && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl h-[600px] relative">
            <AIChat context="ai_waiter" onClose={() => setShowAIChat(false)} />
          </div>
        </div>
      )}

      {/* Quick AI Waiter access */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          onClick={() => setShowAIChat(true)}
          size="lg"
          className="rounded-full h-16 w-16 neon-glow shadow-2xl"
        >
          <Bot className="h-8 w-8" />
        </Button>
        <p className="text-xs text-center mt-2 text-muted-foreground">Double tap<br/>anywhere</p>
      </div>
    </div>
  );
}
