import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Menu, 
  Users, 
  BarChart3, 
  Settings,
  Monitor,
  Calendar,
  Bell,
  CreditCard,
  MapPin,
  Star,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/venue/dashboard", icon: LayoutDashboard },
  { title: "Menu Management", url: "/venue/menu", icon: Menu },
  { title: "Staff", url: "/venue/staff", icon: Users },
  { title: "Reservations", url: "/venue/reservations", icon: Calendar },
  { title: "Analytics", url: "/venue/analytics", icon: BarChart3 },
  { title: "Payments", url: "/venue/payments", icon: CreditCard },
  { title: "Notifications", url: "/venue/notifications", icon: Bell },
  { title: "Reviews", url: "/venue/reviews", icon: Star },
  { title: "AI Assistant", url: "/venue/ai-assistant", icon: MessageSquare },
  { title: "Location", url: "/venue/location", icon: MapPin },
  { title: "Settings", url: "/venue/settings", icon: Settings },
];

export default function VenueSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-64 min-h-screen glass border-r border-border p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">Joint Vibe</h2>
        <p className="text-sm text-muted-foreground">Venue Management</p>
      </div>

      {/* POS Button - Prominent */}
      <Button 
        onClick={() => navigate('/venue/pos/dashboard')}
        className="mb-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        size="lg"
      >
        <Monitor className="mr-2 h-5 w-5" />
        Open POS Terminal
      </Button>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-foreground hover:bg-secondary/50 transition-all text-sm"
            activeClassName="bg-primary/20 text-primary font-semibold"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          The Electric Lounge
        </p>
      </div>
    </aside>
  );
}
