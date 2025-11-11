import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          JV Night Venue
        </h1>
        <p className="text-xl text-muted-foreground mb-8">Premium POS System</p>
        <Button 
          size="lg" 
          className="neon-glow text-lg px-8"
          onClick={() => navigate("/venue/pos/dashboard")}
        >
          Enter POS System
        </Button>
      </div>
    </div>
  );
};

export default Index;
