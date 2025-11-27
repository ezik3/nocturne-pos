import { ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { Home, Menu, ShoppingCart, CreditCard, Users, Bell, MessageSquare, User, Settings, Monitor } from "lucide-react";

interface VenueLayoutProps {
  children: ReactNode;
}

const navItems = [
  { title: "Home", url: "/venue/home", icon: Home },
  { title: "Menu", url: "/venue/menu", icon: Menu },
  { title: "Orders", url: "/venue/orders", icon: ShoppingCart },
  { title: "Credits", url: "/venue/credits", icon: CreditCard },
  { title: "Assign", url: "/venue/assign", icon: Users },
  { title: "Notifications", url: "/venue/notifications", icon: Bell },
  { title: "Messages", url: "/venue/messages", icon: MessageSquare },
  { title: "Account", url: "/venue/account", icon: User },
  { title: "Settings", url: "/venue/settings", icon: Settings },
];

export default function VenueLayout({ children }: VenueLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="w-full border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                activeClassName="text-primary border-b-2 border-primary"
              >
                {item.title}
              </NavLink>
            ))}
          </div>
          
          {/* POS Button */}
          <NavLink
            to="/venue/pos/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Monitor className="h-4 w-4" />
            POS
          </NavLink>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
