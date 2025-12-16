import { useEffect, useState } from "react";
import { Users, Store, Coins, TrendingUp, Gift, Flag } from "lucide-react";
import { StatCard } from "@/components/Admin/dashboard/StatCard";
import { RecentActivity } from "@/components/Admin/dashboard/RecentActivity";
import { PendingApprovals } from "@/components/Admin/dashboard/PendingApprovals";
import { TreasuryOverview } from "@/components/Admin/dashboard/TreasuryOverview";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: treasury } = await supabase
        .from("platform_treasury")
        .select("*")
        .limit(1)
        .single();

      const { count: userCount } = await supabase
        .from("user_wallets")
        .select("*", { count: "exact", head: true });

      const { count: venueCount } = await supabase
        .from("venues")
        .select("*", { count: "exact", head: true });

      const { count: pendingDepositCount } = await supabase
        .from("deposit_records")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: pendingWithdrawalCount } = await supabase
        .from("withdrawal_records")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: frozenCount } = await supabase
        .from("wallet_freezes")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayTxCount } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

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
      change: "+12.5% from last month",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Active Venues",
      value: stats.totalVenues.toLocaleString(),
      change: `+${stats.pendingDeposits} pending approval`,
      changeType: "neutral" as const,
      icon: Store,
    },
    {
      title: "JVC in Circulation",
      value: `$${(stats.totalJVCSupply / 1000000).toFixed(2)}M`,
      change: `+${stats.todayTransactions} today`,
      changeType: "positive" as const,
      icon: Coins,
    },
    {
      title: "Platform Revenue",
      value: `$${(stats.totalUSDBackling * 0.005).toFixed(0)}`,
      change: "+23% from last month",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Points Distributed",
      value: "1.2M",
      change: "142K redeemed",
      changeType: "neutral" as const,
      icon: Gift,
    },
    {
      title: "Pending Reports",
      value: stats.frozenWallets.toString(),
      change: `${stats.frozenWallets} frozen wallets`,
      changeType: "negative" as const,
      icon: Flag,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Here's what's happening with Joint Vibe today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          Last updated: Just now
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity & Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <PendingApprovals />
          <RecentActivity />
        </div>

        {/* Right Column - Treasury */}
        <div className="lg:col-span-1">
          <TreasuryOverview />
        </div>
      </div>
    </div>
  );
}
