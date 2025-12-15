import { useEffect, useState } from "react";
import { Search, Filter, MoreVertical, Wallet, AlertTriangle, Eye, Ban, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserWallet {
  id: string;
  user_id: string;
  balance_jv_token: number;
  balance_usd: number;
  is_frozen: boolean;
  freeze_reason: string | null;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWallet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [freezeDialog, setFreezeDialog] = useState<{ open: boolean; user: UserWallet | null }>({
    open: false,
    user: null
  });
  const [freezeReason, setFreezeReason] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWallet | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: wallets, error } = await supabase
        .from("user_wallets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each user
      const usersWithProfiles = await Promise.all(
        (wallets || []).map(async (wallet) => {
          const { data: profile } = await supabase
            .from("customer_profiles")
            .select("display_name, avatar_url")
            .eq("user_id", wallet.user_id)
            .single();

          return {
            ...wallet,
            profile: profile || undefined
          };
        })
      );

      setUsers(usersWithProfiles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreezeWallet = async () => {
    if (!freezeDialog.user || !freezeReason) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update wallet freeze status
      const { error: walletError } = await supabase
        .from("user_wallets")
        .update({
          is_frozen: true,
          frozen_at: new Date().toISOString(),
          frozen_by: user.id,
          freeze_reason: freezeReason
        })
        .eq("id", freezeDialog.user.id);

      if (walletError) throw walletError;

      // Create freeze record
      const { error: freezeError } = await supabase
        .from("wallet_freezes")
        .insert({
          wallet_id: freezeDialog.user.user_id,
          wallet_type: "user",
          frozen_by: user.id,
          freeze_reason: freezeReason,
          is_active: true
        });

      if (freezeError) throw freezeError;

      toast.success("Wallet frozen successfully");
      setFreezeDialog({ open: false, user: null });
      setFreezeReason("");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to freeze wallet");
    }
  };

  const handleUnfreezeWallet = async (wallet: UserWallet) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update wallet
      const { error: walletError } = await supabase
        .from("user_wallets")
        .update({
          is_frozen: false,
          frozen_at: null,
          frozen_by: null,
          freeze_reason: null
        })
        .eq("id", wallet.id);

      if (walletError) throw walletError;

      // Update freeze record
      const { error: freezeError } = await supabase
        .from("wallet_freezes")
        .update({
          is_active: false,
          unfrozen_by: user.id,
          unfrozen_at: new Date().toISOString(),
          unfreeze_reason: "Admin unfroze wallet"
        })
        .eq("wallet_id", wallet.user_id)
        .eq("is_active", true);

      if (freezeError) throw freezeError;

      toast.success("Wallet unfrozen successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to unfreeze wallet");
    }
  };

  const filteredUsers = users.filter(user => {
    const name = user.profile?.display_name?.toLowerCase() || "";
    const id = user.user_id.toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || id.includes(query);
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Manage platform users and wallets</p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          {users.length} Total Users
        </Badge>
      </div>

      {/* Search & Filter */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by name or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button variant="outline" className="border-slate-700 text-slate-300">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-sm font-medium text-slate-400">User</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">JVC Balance</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">USD Balance</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Joined</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profile?.avatar_url || ""} />
                          <AvatarFallback className="bg-slate-700 text-white">
                            {user.profile?.display_name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {user.profile?.display_name || "Unknown User"}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            {user.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-cyan-400 font-medium">
                        {(user.balance_jv_token || 0).toLocaleString()} JVC
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-green-400 font-medium">
                        ${(user.balance_usd || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.is_frozen ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Frozen
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                          <DropdownMenuItem 
                            className="text-slate-300 hover:text-white"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300 hover:text-white">
                            <Wallet className="h-4 w-4 mr-2" />
                            View Transactions
                          </DropdownMenuItem>
                          {user.is_frozen ? (
                            <DropdownMenuItem 
                              className="text-green-400 hover:text-green-300"
                              onClick={() => handleUnfreezeWallet(user)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Unfreeze Wallet
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-red-400 hover:text-red-300"
                              onClick={() => setFreezeDialog({ open: true, user })}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Freeze Wallet
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No users found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Freeze Dialog */}
      <Dialog open={freezeDialog.open} onOpenChange={(open) => setFreezeDialog({ open, user: freezeDialog.user })}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Freeze Wallet</DialogTitle>
            <DialogDescription>
              This will prevent the user from making any transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Reason for freezing</Label>
              <Textarea
                placeholder="Enter the reason for freezing this wallet..."
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFreezeDialog({ open: false, user: null })}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFreezeWallet}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={!freezeReason}
            >
              Freeze Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-slate-700 text-white text-xl">
                    {selectedUser.profile?.display_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-semibold text-white">
                    {selectedUser.profile?.display_name || "Unknown User"}
                  </p>
                  <p className="text-sm text-slate-400 font-mono">{selectedUser.user_id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">JVC Balance</p>
                  <p className="text-lg font-semibold text-cyan-400">
                    {(selectedUser.balance_jv_token || 0).toLocaleString()} JVC
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">USD Balance</p>
                  <p className="text-lg font-semibold text-green-400">
                    ${(selectedUser.balance_usd || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">Account Status</p>
                <div className="mt-2">
                  {selectedUser.is_frozen ? (
                    <div>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        Frozen
                      </Badge>
                      {selectedUser.freeze_reason && (
                        <p className="text-sm text-slate-400 mt-2">
                          Reason: {selectedUser.freeze_reason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">Member Since</p>
                <p className="text-white">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
