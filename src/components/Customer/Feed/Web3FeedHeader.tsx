import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  TrendingUp, 
  Building2, 
  Map, 
  MessageSquare, 
  Bell, 
  User,
  Hexagon,
  Wallet
} from "lucide-react";

const Web3FeedHeader = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Feed", path: "/app/feed", badge: null },
    { icon: TrendingUp, label: "Top 10", path: "/app/top10", badge: null },
    { icon: Building2, label: "Venues", path: "/app/venues", badge: null },
    { icon: Map, label: "Map", path: "/app/maps", badge: null },
    { icon: MessageSquare, label: "DMs", path: "/app/messages", badge: 3 },
    { icon: Bell, label: "Alerts", path: "/app/notifications", badge: 12 },
    { icon: User, label: "Profile", path: "/app/profile", badge: null },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl border-b border-cyan/20" />
      
      {/* Animated scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-cyan/50 to-transparent animate-scan-line" />
      </div>

      <div className="relative max-w-4xl mx-auto px-2">
        <div className="flex items-center justify-between h-14">
          {/* Logo Section */}
          <Link to="/app/feed" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Hexagon className="w-8 h-8 text-cyan group-hover:text-purple transition-colors" fill="currentColor" fillOpacity={0.1} />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-cyan group-hover:text-purple transition-colors">
                JV
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center px-2 py-1.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'text-cyan' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-0.5 hidden sm:block">{item.label}</span>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan rounded-full shadow-[0_0_10px_hsl(var(--cyan))]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Wallet Button */}
          <Link 
            to="/app/wallet"
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan/20 to-purple/20 rounded-full border border-cyan/30 hover:border-cyan/60 transition-all group"
          >
            <Wallet className="w-4 h-4 text-cyan" />
            <span className="text-sm font-medium text-white hidden sm:block">0.00 JV</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Web3FeedHeader;
