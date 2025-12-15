import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Wallet, 
  ArrowLeftRight, 
  Download, 
  Upload, 
  Shield, 
  FileText, 
  Settings, 
  LogOut,
  Coins,
  AlertTriangle,
  UserCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Venues", url: "/admin/venues", icon: Building2 },
  { title: "Treasury", url: "/admin/treasury", icon: Wallet },
  { title: "Mint/Burn", url: "/admin/mint-burn", icon: Coins },
  { title: "Transactions", url: "/admin/transactions", icon: ArrowLeftRight },
  { title: "Deposits", url: "/admin/deposits", icon: Download },
  { title: "Withdrawals", url: "/admin/withdrawals", icon: Upload },
  { title: "Wallet Freezes", url: "/admin/wallet-freezes", icon: AlertTriangle },
  { title: "Audit Log", url: "/admin/audit-log", icon: FileText },
  { title: "Roles", url: "/admin/roles", icon: UserCog },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("jv_admin_token");
    navigate("/admin/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">JV Admin</h1>
            <p className="text-xs text-slate-400">Platform Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <RouterNavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </RouterNavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={() => navigate("/app/feed/immersive")}
        >
          <Users className="h-4 w-4 mr-3" />
          User App
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={() => navigate("/venue/home")}
        >
          <Building2 className="h-4 w-4 mr-3" />
          Venue App
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
