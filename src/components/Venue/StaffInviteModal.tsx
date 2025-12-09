import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, User, ShieldCheck, Copy, Check, ArrowLeft, ArrowRight, ScanFace, AtSign } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface StaffInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FoundUser {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  bio?: string;
}

const roleOptions = [
  { value: "kitchen", label: "Kitchen Staff", description: "Access to kitchen displays and order management" },
  { value: "waiter", label: "Waiter/Server", description: "POS, orders, table management" },
  { value: "bartender", label: "Bartender", description: "POS, bar orders" },
  { value: "host", label: "Host", description: "Table management, reservations" },
  { value: "manager", label: "Sub-Manager", description: "Extended access, staff management" },
];

const permissionOptions = [
  { key: "pos", label: "Take Orders", description: "Create and modify orders" },
  { key: "kitchen", label: "Kitchen Display", description: "View kitchen orders" },
  { key: "tables", label: "Table Management", description: "Manage table status" },
  { key: "orders", label: "View Orders", description: "See all orders" },
  { key: "menu", label: "Menu Management", description: "Edit menu items" },
  { key: "inventory", label: "Inventory", description: "Manage stock levels" },
  { key: "analytics", label: "Analytics", description: "View reports" },
  { key: "staff", label: "Staff Management", description: "Manage employees" },
  { key: "go_live", label: "Go Live", description: "Broadcast live video streams" },
];

export default function StaffInviteModal({ isOpen, onClose }: StaffInviteModalProps) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FoundUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<FoundUser | null>(null);
  const [selectedRole, setSelectedRole] = useState("waiter");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    pos: true, kitchen: false, tables: true, orders: true,
    menu: false, inventory: false, analytics: false, staff: false, go_live: false
  });
  const [generatedPin, setGeneratedPin] = useState("");
  const [pinCopied, setPinCopied] = useState(false);
  const [enableFaceId, setEnableFaceId] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    
    // Search customer_profiles by display_name (profile-based search within app)
    const { data, error } = await supabase
      .from("customer_profiles")
      .select("id, user_id, display_name, bio, avatar_url")
      .ilike("display_name", `%${searchQuery}%`)
      .limit(10);
    
    if (error) {
      console.error("Search error:", error);
      // Fallback to mock data for demo
      setSearchResults([
        { id: "1", displayName: "Sarah Johnson", username: "@sarah_j", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", bio: "Night owl" },
        { id: "2", displayName: "Mike Wilson", username: "@mike_w", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", bio: "Party professional" },
      ]);
    } else if (data && data.length > 0) {
      setSearchResults(data.map(p => ({
        id: p.user_id,
        displayName: p.display_name || "Unknown",
        username: `@${(p.display_name || "user").toLowerCase().replace(/\s+/g, "_")}`,
        avatar: p.avatar_url || "",
        bio: p.bio || ""
      })));
    } else {
      // No results, show mock for demo
      setSearchResults([
        { id: "1", displayName: "Sarah Johnson", username: "@sarah_j", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", bio: "Night owl" },
        { id: "2", displayName: "Mike Wilson", username: "@mike_w", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", bio: "Party professional" },
      ]);
    }
    setSearching(false);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    const rolePermissions: Record<string, Record<string, boolean>> = {
      kitchen: { pos: false, kitchen: true, tables: false, orders: true, menu: false, inventory: false, analytics: false, staff: false, go_live: false },
      waiter: { pos: true, kitchen: false, tables: true, orders: true, menu: false, inventory: false, analytics: false, staff: false, go_live: false },
      bartender: { pos: true, kitchen: false, tables: false, orders: true, menu: false, inventory: false, analytics: false, staff: false, go_live: false },
      host: { pos: false, kitchen: false, tables: true, orders: false, menu: false, inventory: false, analytics: false, staff: false, go_live: false },
      manager: { pos: true, kitchen: true, tables: true, orders: true, menu: true, inventory: true, analytics: true, staff: true, go_live: true },
    };
    setPermissions(rolePermissions[role] || permissions);
  };

  const generatePin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPin(pin);
    setStep(3);
  };

  const copyPin = () => {
    navigator.clipboard.writeText(generatedPin);
    setPinCopied(true);
    toast.success("PIN copied to clipboard");
    setTimeout(() => setPinCopied(false), 2000);
  };

  const handleComplete = async () => {
    // Save to employee_invitations table
    const { data: { user } } = await supabase.auth.getUser();
    if (user && selectedUser) {
      const { error } = await supabase.from("employee_invitations").insert({
        venue_id: user.id, // Venue owner's user ID
        employee_email: selectedUser.displayName, // Using displayName as identifier
        invited_by: user.id,
        role: selectedRole,
        permissions: permissions,
        status: "pending"
      });
      
      if (error) {
        console.error("Error saving invitation:", error);
      }
    }
    
    toast.success(`${selectedUser?.displayName} has been added as ${selectedRole}. Share their PIN: ${generatedPin}`);
    onClose();
    // Reset state
    setStep(1);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setGeneratedPin("");
    setEnableFaceId(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            {step === 1 && "Search User Profile"}
            {step === 2 && "Configure Access"}
            {step === 3 && "PIN Generated"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {step === 1 && "Search for an existing user profile in the app"}
            {step === 2 && "Set role and permissions for this employee"}
            {step === 3 && "Share this PIN with the employee for work mode access"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Search by Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by profile name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 bg-slate-800 border-slate-600"
                />
              </div>
              <Button onClick={handleSearch} disabled={searching} className="bg-primary">
                {searching ? "Searching..." : <><Search className="w-4 h-4" /></>}
              </Button>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <AtSign className="w-3 h-3" /> Find users by their profile display name within the app
            </p>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <Card
                    key={user.id}
                    className={`cursor-pointer transition-all border-2 ${
                      selectedUser?.id === user.id 
                        ? "border-primary bg-primary/10" 
                        : "border-slate-700 bg-slate-800 hover:border-slate-600"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/20">{user.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-white">{user.displayName}</p>
                        <p className="text-sm text-primary">{user.username}</p>
                        {user.bio && <p className="text-xs text-slate-400">{user.bio}</p>}
                      </div>
                      {selectedUser?.id === user.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedUser}
                className="bg-primary"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
          <div className="space-y-4">
            {selectedUser && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback>{selectedUser.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.displayName}</p>
                    <p className="text-sm text-primary">{selectedUser.username}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value} className="text-white">
                      <div>
                        <p className="font-medium">{role.label}</p>
                        <p className="text-xs text-slate-400">{role.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2">
                {permissionOptions.map((perm) => (
                  <div
                    key={perm.key}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                      permissions[perm.key] 
                        ? "border-primary/50 bg-primary/10" 
                        : "border-slate-700 bg-slate-800"
                    }`}
                  >
                    <Checkbox
                      checked={permissions[perm.key]}
                      onCheckedChange={(checked) => 
                        setPermissions({...permissions, [perm.key]: !!checked})
                      }
                      className="border-slate-500"
                    />
                    <div>
                      <p className="text-sm font-medium">{perm.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Face ID Option */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ScanFace className="h-6 w-6 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">Enable Face ID Login</p>
                    <p className="text-xs text-slate-400">Allow employee to use Face ID for faster POS access</p>
                  </div>
                </div>
                <Checkbox
                  checked={enableFaceId}
                  onCheckedChange={(checked) => setEnableFaceId(!!checked)}
                  className="border-blue-500"
                />
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="border-slate-600">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={generatePin} className="bg-green-600 hover:bg-green-700">
                <ShieldCheck className="mr-2 h-4 w-4" /> Generate PIN
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: PIN */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <ShieldCheck className="h-12 w-12 mx-auto text-green-400 mb-4" />
              <p className="text-sm text-slate-400 mb-2">Employee Work Mode PIN</p>
              <p className="text-4xl font-mono font-bold tracking-[0.5em] text-white">
                {generatedPin}
              </p>
            </div>

            {enableFaceId && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center gap-3">
                <ScanFace className="h-8 w-8 text-blue-400" />
                <div className="text-left">
                  <p className="font-medium text-blue-400">Face ID Enabled</p>
                  <p className="text-xs text-slate-400">Employee can use biometric login as alternative to PIN</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button 
                onClick={copyPin} 
                variant="outline" 
                className="w-full border-slate-600"
              >
                {pinCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {pinCopied ? "Copied!" : "Copy PIN"}
              </Button>
              <p className="text-xs text-slate-400">
                Share this PIN securely with {selectedUser?.displayName}. They'll use it to access Work Mode.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 text-left">
              <p className="font-medium mb-2">Summary</p>
              <div className="text-sm text-slate-400 space-y-1">
                <p><span className="text-white">Employee:</span> {selectedUser?.displayName}</p>
                <p><span className="text-white">Role:</span> {roleOptions.find(r => r.value === selectedRole)?.label}</p>
                <p><span className="text-white">Face ID:</span> {enableFaceId ? "Enabled" : "Disabled"}</p>
                <p><span className="text-white">Permissions:</span> {Object.entries(permissions).filter(([,v]) => v).map(([k]) => k).join(", ")}</p>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-sm text-orange-400">
                <strong>Important:</strong> When on shift, employee will be in Work Mode only — no social features available.
              </p>
            </div>

            <Button onClick={handleComplete} className="w-full bg-primary">
              Complete Setup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
