import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  UtensilsCrossed, 
  Menu, 
  Package, 
  BarChart3, 
  Users, 
  Settings,
  Table2,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/venue/pos/dashboard", icon: LayoutDashboard },
  { title: "New Order", url: "/venue/pos/new-order", icon: ShoppingCart },
  { title: "Orders", url: "/venue/pos/orders", icon: UtensilsCrossed },
  { title: "Kitchen", url: "/venue/pos/kitchen", icon: UtensilsCrossed },
  { title: "Menu", url: "/venue/pos/menu", icon: Menu },
  { title: "Tables", url: "/venue/pos/tables", icon: Table2 },
  { title: "Floorplan", url: "/venue/pos/floorplan", icon: LayoutDashboard },
  { title: "Inventory", url: "/venue/pos/inventory", icon: Package },
  { title: "Analytics", url: "/venue/pos/analytics", icon: BarChart3 },
  { title: "Staff", url: "/venue/pos/staff", icon: Users },
  { title: "Settings", url: "/venue/pos/settings", icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [venueName, setVenueName] = useState("JV POS");

  useEffect(() => {
    const storedName = localStorage.getItem('jv_current_venue_name');
    if (storedName) {
      setVenueName(storedName);
    }
  }, []);

  return (
    <aside className="w-64 min-h-screen glass border-r border-border p-4 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary truncate">{venueName}</h2>
        <p className="text-sm text-muted-foreground">Point of Sale</p>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary/50 transition-all"
            activeClassName="bg-primary/20 text-primary font-semibold neon-glow"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Back to Venue Home Button */}
      <div className="mt-auto pt-4 border-t border-border">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3"
          onClick={() => navigate('/venue/home')}
        >
          <Home className="h-5 w-5" />
          <span>Back to Venue Home</span>
        </Button>
      </div>
    </aside>
  );
}