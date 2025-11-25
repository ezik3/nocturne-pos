import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Wallet, MessageSquare, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import FloatingAIButton from "./FloatingAIButton";

interface CustomerLayoutProps {
  children: ReactNode;
}

const CustomerLayout = ({ children }: CustomerLayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/app/feed", icon: Home, label: "Feed" },
    { path: "/app/discover", icon: Compass, label: "Venues" },
    { path: "/app/wallet", icon: Wallet, label: "Wallet" },
    { path: "/app/messages", icon: MessageSquare, label: "Messages" },
    { path: "/app/notifications", icon: Bell, label: "Notifications" },
    { path: "/app/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/app/feed" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Joint Vibe
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Floating AI Assistant */}
      <FloatingAIButton />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CustomerLayout;
