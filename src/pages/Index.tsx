import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          JV Night Venue
        </h1>
        <p className="text-xl text-muted-foreground mb-4">Premium POS System</p>
        <p className="text-muted-foreground mb-8">
          Complete POS solution with real-time kitchen display, floorplan editor,
          payment processing, and comprehensive venue management.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/venue/home">
            <Button size="lg" className="neon-glow text-lg px-8">
              Venue Dashboard
            </Button>
          </Link>
          <Link to="/app/feed">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Customer App
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button size="lg" variant="ghost" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
