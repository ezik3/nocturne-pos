import { Flame, Trophy, Building2, Map, MessageSquare, Bell, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Flame, label: "Feed", path: "/app/feed" },
  { icon: Trophy, label: "Top 10", path: "/app/top10" },
  { icon: Building2, label: "Venues", path: "/app/venues" },
  { icon: Map, label: "Maps", path: "/app/maps" },
  { icon: MessageSquare, label: "Messages", path: "/app/messages", badge: 3 },
  { icon: Bell, label: "Alerts", path: "/app/notifications", badge: 20 },
  { icon: User, label: "Profile", path: "/app/profile" },
];

const FeedHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-2 py-2 max-w-2xl mx-auto overflow-x-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 relative min-w-fit ${
                isActive 
                  ? "bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-neon-cyan" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="relative">
                <item.icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_hsl(var(--neon-cyan))]" : ""}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-neon-pink text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-neon-cyan" : ""}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default FeedHeader;
