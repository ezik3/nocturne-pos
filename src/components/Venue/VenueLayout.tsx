import { ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { Home, Menu, ShoppingCart, CreditCard, Users, Bell, MessageSquare, User, Settings, Monitor, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

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
          
          <div className="flex items-center gap-3">
            {/* POS Button */}
            <NavLink
              to="/venue/pos/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Monitor className="h-4 w-4" />
              POS
            </NavLink>

            {/* User Menu with Logout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Venue Owner</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/venue/account")}>
                  <User className="h-4 w-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/venue/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Venue Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}