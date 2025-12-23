import { useEffect, useState } from "react";
import { Upload, Search, Filter, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Withdrawal {
  id: string;
  user_id: string | null;
  venue_id: string | null;
  amount_jvc: number;
  amount_usd: number;
  amount_local: number;
  withdrawal_method: string;
  status: string;
  local_currency: string;
  fee_amount: number;
  net_payout: number;
  bank_name: string | null;
  bank_account_last4: string | null;
  created_at: string;
  approved_at: string | null;
  completed_at: string | null;
  rejection_reason: string | null;
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; withdrawal: Withdrawal | null }>({
    open: false,
    withdrawal: null
  });
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from("withdrawal_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Failed to fetch withdrawals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (withdrawal: Withdrawal) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-withdrawal', {
        body: {
          withdrawal_id: withdrawal.id,
          action: 'approve'
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to approve');
      
      toast.success("Withdrawal approved");
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve withdrawal");
    }
  };

  const handleMarkPaid = async (withdrawal: Withdrawal) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-withdrawal', {
        body: {
          withdrawal_id: withdrawal.id,
          action: 'mark_paid'
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to mark as paid');
      
      toast.success("Withdrawal marked as paid - JVC burned");
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.message || "Failed to mark withdrawal as paid");
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.withdrawal || !rejectReason) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-withdrawal', {
        body: {
          withdrawal_id: rejectDialog.withdrawal.id,
          action: 'reject',
          rejection_reason: rejectReason
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to reject');
      
      toast.success("Withdrawal rejected - funds unlocked");
      setRejectDialog({ open: false, withdrawal: null });
      setRejectReason("");
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject withdrawal");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
      case "approved":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status}</Badge>;
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    const query = searchQuery.toLowerCase();
    return (
      w.withdrawal_method.toLowerCase().includes(query) ||
      w.status.toLowerCase().includes(query) ||
      w.id.toLowerCase().includes(query)
    );
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
          <h1 className="text-3xl font-bold text-white">Withdrawals</h1>
          <p className="text-slate-400 mt-1">All platform withdrawals</p>
        </div>
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          {withdrawals.filter(w => w.status === "pending").length} Pending Review
        </Badge>
      </div>

      {/* Search & Filter */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search withdrawals..."
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

      {/* Withdrawals Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-sm font-medium text-slate-400">ID</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Method</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Net Payout</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Date</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-4">
                      <span className="text-slate-400 font-mono text-xs">
                        {withdrawal.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {withdrawal.withdrawal_method}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="text-cyan-400 font-medium">
                          {withdrawal.amount_jvc.toLocaleString()} JVC
                        </span>
                        <p className="text-xs text-slate-500">
                          ${withdrawal.amount_usd.toLocaleString()} USD
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-green-400 font-medium">
                        ${withdrawal.net_payout.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="p-4">
                      <span className="text-slate-400 text-sm">
                        {new Date(withdrawal.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {withdrawal.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              onClick={() => handleApprove(withdrawal)}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => setRejectDialog({ open: true, withdrawal })}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {withdrawal.status === "approved" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                            onClick={() => handleMarkPaid(withdrawal)}
                            title="Mark as Paid"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white"
                          onClick={() => setSelectedWithdrawal(withdrawal)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWithdrawals.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No withdrawals found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, withdrawal: rejectDialog.withdrawal })}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this withdrawal request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Rejection Reason</Label>
              <Textarea
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, withdrawal: null })}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={!rejectReason}
            >
              Reject Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Details Dialog */}
      <Dialog open={!!selectedWithdrawal} onOpenChange={(open) => !open && setSelectedWithdrawal(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Withdrawal Details</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">Withdrawal ID</p>
                <p className="text-white font-mono text-sm">{selectedWithdrawal.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">Method</p>
                  <p className="text-white mt-1">{selectedWithdrawal.withdrawal_method}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">JVC Amount</p>
                  <p className="text-cyan-400 font-semibold">
                    {selectedWithdrawal.amount_jvc.toLocaleString()} JVC
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">Fee</p>
                  <p className="text-yellow-400 font-semibold">
                    ${selectedWithdrawal.fee_amount.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">Net Payout</p>
                  <p className="text-green-400 font-semibold">
                    ${selectedWithdrawal.net_payout.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">Currency</p>
                  <p className="text-white">{selectedWithdrawal.local_currency}</p>
                </div>
              </div>
              {selectedWithdrawal.bank_name && (
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-sm text-slate-400">Bank Details</p>
                  <p className="text-white mt-1">
                    {selectedWithdrawal.bank_name} •••• {selectedWithdrawal.bank_account_last4}
                  </p>
                </div>
              )}
              {selectedWithdrawal.rejection_reason && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">Rejection Reason</p>
                  <p className="text-red-300 mt-1">{selectedWithdrawal.rejection_reason}</p>
                </div>
              )}
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">Created</p>
                <p className="text-white text-sm">{new Date(selectedWithdrawal.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
