import { useState } from "react";
import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Wallet, 
  ArrowLeftRight, 
  Download, 
  Upload, 
  FileText, 
  Settings, 
  LogOut,
  Coins,
  AlertTriangle,
  UserCog,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("jv_admin_token");
    navigate("/admin/login");
  };

  return (
    <aside className={cn(
      "sticky top-0 h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">JV</span>
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-white">Joint Vibe</h1>
                <p className="text-xs text-slate-400">Admin Portal</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <RouterNavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </RouterNavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-10 w-10 bg-gradient-to-br from-cyan-500 to-purple-600">
              <AvatarFallback className="bg-transparent text-white font-semibold">SA</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Super Admin</p>
              <p className="text-xs text-slate-400 truncate">owner@jointvibe.com</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full text-red-400 hover:text-red-300 hover:bg-red-500/10",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
