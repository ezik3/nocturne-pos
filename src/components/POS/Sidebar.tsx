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
  Table2
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/venue/pos/dashboard", icon: LayoutDashboard },
  { title: "New Order", url: "/venue/pos/new-order", icon: ShoppingCart },
  { title: "Orders", url: "/venue/pos/orders", icon: UtensilsCrossed },
  { title: "Kitchen (Legacy)", url: "/venue/pos/kitchen", icon: UtensilsCrossed },
  { title: "Kitchen Display", url: "/venue/pos/kitchen-enhanced", icon: UtensilsCrossed },
  { title: "Kitchen Display 2", url: "/venue/pos/kitchen-display", icon: UtensilsCrossed },
  { title: "Menu", url: "/venue/pos/menu", icon: Menu },
  { title: "Tables", url: "/venue/pos/tables", icon: Table2 },
  { title: "Floorplan", url: "/venue/pos/floorplan", icon: LayoutDashboard },
  { title: "Inventory", url: "/venue/pos/inventory", icon: Package },
  { title: "Analytics", url: "/venue/pos/analytics", icon: BarChart3 },
  { title: "Staff", url: "/venue/pos/staff", icon: Users },
  { title: "Staff Roster", url: "/venue/pos/staff-roster", icon: Users },
  { title: "Settings", url: "/venue/pos/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen glass border-r border-border p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary">JV POS</h2>
        <p className="text-sm text-muted-foreground">Night Venue System</p>
      </div>

      <nav className="space-y-2">
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
    </aside>
  );
}
