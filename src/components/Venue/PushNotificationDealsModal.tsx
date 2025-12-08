import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone, MapPin, Globe, Map, Flag, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PushNotificationDealsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReachType = 'local' | 'regional' | 'state' | 'national' | 'international';
type PeriodType = 'month' | '6months' | '12months';

interface Package {
  notifications: number;
  prices: Record<ReachType, number>;
}

const monthlyPackages: Package[] = [
  { notifications: 5, prices: { local: 17, regional: 21.25, state: 25.50, national: 34, international: 51 } },
  { notifications: 10, prices: { local: 32, regional: 40, state: 48, national: 64, international: 96 } },
  { notifications: 25, prices: { local: 70, regional: 87.50, state: 105, national: 140, international: 210 } },
  { notifications: 50, prices: { local: 120, regional: 150, state: 180, national: 240, international: 360 } },
];

const sixMonthPackages: Package[] = [
  { notifications: 60, prices: { local: 144, regional: 180, state: 216, national: 288, international: 432 } },
  { notifications: 120, prices: { local: 264, regional: 330, state: 396, national: 528, international: 792 } },
  { notifications: 180, prices: { local: 360, regional: 450, state: 540, national: 720, international: 1080 } },
  { notifications: 240, prices: { local: 432, regional: 540, state: 648, national: 864, international: 1296 } },
];

const yearlyPackages: Package[] = [
  { notifications: 200, prices: { local: 432, regional: 540, state: 648, national: 864, international: 1296 } },
  { notifications: 360, prices: { local: 612, regional: 765, state: 918, national: 1224, international: 1836 } },
  { notifications: 480, prices: { local: 768, regional: 960, state: 1152, national: 1536, international: 2304 } },
  { notifications: 600, prices: { local: 900, regional: 1125, state: 1350, national: 1800, international: 2700 } },
];

const reachInfo: Record<ReachType, { label: string; icon: React.ElementType; radius: string; color: string }> = {
  local: { label: 'Local', icon: MapPin, radius: '≤ 25 km', color: 'from-green-500 to-emerald-500' },
  regional: { label: 'Regional', icon: Map, radius: '≤ 100 km', color: 'from-blue-500 to-cyan-500' },
  state: { label: 'State', icon: Flag, radius: 'State-wide', color: 'from-purple-500 to-violet-500' },
  national: { label: 'National', icon: Globe, radius: 'Country-wide', color: 'from-orange-500 to-red-500' },
  international: { label: 'International', icon: Sparkles, radius: 'Worldwide', color: 'from-pink-500 to-rose-500' },
};

export default function PushNotificationDealsModal({ isOpen, onClose }: PushNotificationDealsModalProps) {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [selectedPackage, setSelectedPackage] = useState<{ notifications: number; reach: ReachType; price: number } | null>(null);

  const getPackages = () => {
    switch (period) {
      case 'month': return monthlyPackages;
      case '6months': return sixMonthPackages;
      case '12months': return yearlyPackages;
    }
  };

  const handlePurchase = (notifications: number, reach: ReachType, price: number) => {
    setSelectedPackage({ notifications, reach, price });
  };

  const confirmPurchase = () => {
    if (!selectedPackage) return;
    
    // Here you would integrate with payment processing
    toast.success(`Successfully purchased ${selectedPackage.notifications} ${reachInfo[selectedPackage.reach].label} push notifications!`);
    setSelectedPackage(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-5xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="glass border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Megaphone className="w-6 h-6 text-primary" />
                    Push Notification Deals
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Promote your deals to customers in your area
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* How it works */}
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold mb-2">How Push Notifications Work</h3>
                  <p className="text-sm text-muted-foreground">
                    Purchase push notifications to send promotional deals directly to customers' feeds. 
                    Customers can <span className="text-primary font-semibold">REDEEM</span> your deals 
                    instantly. Choose your reach based on how far you want your promotions to travel!
                  </p>
                </div>

                {/* Reach Legend */}
                <div className="flex flex-wrap gap-3">
                  {Object.entries(reachInfo).map(([key, { label, icon: Icon, radius, color }]) => (
                    <div key={key} className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-lg">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground">({radius})</span>
                    </div>
                  ))}
                </div>

                {/* Period Tabs */}
                <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="month">Per Month</TabsTrigger>
                    <TabsTrigger value="6months">Per 6 Months</TabsTrigger>
                    <TabsTrigger value="12months">Per 12 Months</TabsTrigger>
                  </TabsList>

                  <TabsContent value={period} className="mt-6">
                    {/* Pricing Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-secondary/50">
                            <th className="p-4 text-left font-semibold text-cyan-400">Notifications</th>
                            {Object.entries(reachInfo).map(([key, { label }]) => (
                              <th key={key} className="p-4 text-center font-semibold text-cyan-400">{label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {getPackages().map((pkg, idx) => (
                            <tr key={idx} className="border-b border-border/50 hover:bg-secondary/20">
                              <td className="p-4 font-bold text-lg">{pkg.notifications}</td>
                              {(Object.keys(reachInfo) as ReachType[]).map((reach) => (
                                <td key={reach} className="p-4 text-center">
                                  <div className="space-y-2">
                                    <p className="font-semibold">${pkg.prices[reach].toFixed(2)}</p>
                                    <Button 
                                      size="sm" 
                                      className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                                      onClick={() => handlePurchase(pkg.notifications, reach, pkg.prices[reach])}
                                    >
                                      Buy
                                    </Button>
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Purchase Confirmation */}
                <AnimatePresence>
                  {selectedPackage && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="p-6 bg-gradient-to-r from-primary/20 to-cyan-500/20 rounded-xl border border-primary/30"
                    >
                      <h3 className="font-bold text-lg mb-4">Confirm Purchase</h3>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-lg">
                            <span className="font-bold text-primary">{selectedPackage.notifications}</span> Push Notifications
                          </p>
                          <p className="text-muted-foreground">
                            {reachInfo[selectedPackage.reach].label} reach ({reachInfo[selectedPackage.reach].radius})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary">${selectedPackage.price.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            ${(selectedPackage.price / selectedPackage.notifications).toFixed(2)} per notification
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setSelectedPackage(null)}>
                          Cancel
                        </Button>
                        <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black" onClick={confirmPurchase}>
                          <Check className="w-4 h-4 mr-2" />
                          Confirm Purchase
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}