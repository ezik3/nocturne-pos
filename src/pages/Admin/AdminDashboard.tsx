import { useEffect, useState } from "react";
import { 
  Users, 
  Building2, 
  Wallet, 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalUsers: number;
  totalVenues: number;
  totalJVCSupply: number;
  totalUSDBackling: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  todayTransactions: number;
  frozenWallets: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  amount?: number;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalVenues: 0,
    totalJVCSupply: 0,
    totalUSDBackling: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    todayTransactions: 0,
    frozenWallets: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch treasury data
      const { data: treasury } = await supabase
        .from("platform_treasury")
        .select("*")
        .limit(1)
        .single();

      // Fetch user count
      const { count: userCount } = await supabase
        .from("user_wallets")
        .select("*", { count: "exact", head: true });

      // Fetch venue count
      const { count: venueCount } = await supabase
        .from("venues")
        .select("*", { count: "exact", head: true });

      // Fetch pending deposits
      const { count: pendingDepositCount } = await supabase
        .from("deposit_records")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Fetch pending withdrawals
      const { count: pendingWithdrawalCount } = await supabase
        .from("withdrawal_records")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Fetch frozen wallets
      const { count: frozenCount } = await supabase
        .from("wallet_freezes")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch today's transactions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayTxCount } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      // Fetch recent transactions for activity
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      setStats({
        totalUsers: userCount || 0,
        totalVenues: venueCount || 0,
        totalJVCSupply: treasury?.total_jvc_supply || 0,
        totalUSDBackling: treasury?.total_usd_backing || 0,
        pendingDeposits: pendingDepositCount || 0,
        pendingWithdrawals: pendingWithdrawalCount || 0,
        todayTransactions: todayTxCount || 0,
        frozenWallets: frozenCount || 0
      });

      setRecentActivity(
        (transactions || []).map(tx => ({
          id: tx.id,
          type: tx.transaction_type,
          description: tx.description || `${tx.transaction_type} transaction`,
          amount: tx.amount_jvc,
          status: tx.status,
          created_at: tx.created_at
        }))
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      title: "Total Users", 
      value: stats.totalUsers.toLocaleString(), 
      icon: Users, 
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    { 
      title: "Total Venues", 
      value: stats.totalVenues.toLocaleString(), 
      icon: Building2, 
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    { 
      title: "JVC Supply", 
      value: `${stats.totalJVCSupply.toLocaleString()} JVC`, 
      icon: Coins, 
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20"
    },
    { 
      title: "USD Backing", 
      value: `$${stats.totalUSDBackling.toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    { 
      title: "Pending Deposits", 
      value: stats.pendingDeposits.toString(), 
      icon: TrendingDown, 
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    },
    { 
      title: "Pending Withdrawals", 
      value: stats.pendingWithdrawals.toString(), 
      icon: TrendingUp, 
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    { 
      title: "Today's Transactions", 
      value: stats.todayTransactions.toString(), 
      icon: ArrowLeftRight, 
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20"
    },
    { 
      title: "Frozen Wallets", 
      value: stats.frozenWallets.toString(), 
      icon: AlertTriangle, 
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Joint Vibe Platform Overview</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <Activity className="h-4 w-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">System Healthy</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`bg-slate-900/50 border ${stat.borderColor}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Treasury Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-400" />
              Treasury Health
            </CardTitle>
            <CardDescription>Platform financial overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm text-slate-400">Backing Ratio</p>
                <p className="text-xl font-bold text-white">
                  {stats.totalJVCSupply > 0 
                    ? ((stats.totalUSDBackling / stats.totalJVCSupply) * 100).toFixed(2)
                    : 100
                  }%
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">Total Minted</p>
                <p className="text-lg font-semibold text-cyan-400">
                  {stats.totalJVCSupply.toLocaleString()} JVC
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">USD Reserved</p>
                <p className="text-lg font-semibold text-green-400">
                  ${stats.totalUSDBackling.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{activity.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {activity.amount && (
                        <span className="text-sm font-medium text-cyan-400">
                          {activity.amount.toLocaleString()} JVC
                        </span>
                      )}
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
