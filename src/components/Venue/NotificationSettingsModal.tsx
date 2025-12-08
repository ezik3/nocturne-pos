import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, ShoppingCart, MessageCircle, DollarSign, Users, AlertTriangle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  volume: number;
  newOrders: boolean;
  orderUpdates: boolean;
  messages: boolean;
  salesAlerts: boolean;
  staffActivity: boolean;
  lowInventory: boolean;
  customerCheckIns: boolean;
  aiWaiterRequests: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  sound: true,
  volume: 70,
  newOrders: true,
  orderUpdates: true,
  messages: true,
  salesAlerts: true,
  staffActivity: false,
  lowInventory: true,
  customerCheckIns: false,
  aiWaiterRequests: true,
};

export default function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('venue_notification_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('venue_notification_settings', JSON.stringify(settings));
    toast.success("Notification settings saved!");
    onClose();
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const notificationTypes = [
    { key: 'newOrders', label: 'New Orders', icon: ShoppingCart, description: 'Get notified when a new order is placed' },
    { key: 'orderUpdates', label: 'Order Updates', icon: Bell, description: 'Updates on order status changes' },
    { key: 'messages', label: 'Customer Messages', icon: MessageCircle, description: 'Messages from customers and staff' },
    { key: 'salesAlerts', label: 'Sales Milestones', icon: DollarSign, description: 'Alerts for sales goals and milestones' },
    { key: 'staffActivity', label: 'Staff Activity', icon: Users, description: 'Clock in/out and break notifications' },
    { key: 'lowInventory', label: 'Low Inventory', icon: AlertTriangle, description: 'Alerts when stock is running low' },
    { key: 'customerCheckIns', label: 'Customer Check-ins', icon: Users, description: 'When customers check in to your venue' },
    { key: 'aiWaiterRequests', label: 'AI Waiter Requests', icon: Bell, description: 'When customers call the AI waiter' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="glass border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Settings
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Master Toggle */}
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <Label className="text-base font-semibold">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive live alerts across all pages</p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => updateSetting('enabled', checked)}
                  />
                </div>

                {/* Sound Settings */}
                <div className={`space-y-4 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                      <Label>Sound Alerts</Label>
                    </div>
                    <Switch
                      checked={settings.sound}
                      onCheckedChange={(checked) => updateSetting('sound', checked)}
                    />
                  </div>

                  {settings.sound && (
                    <div className="flex items-center gap-4">
                      <Label className="text-sm text-muted-foreground w-16">Volume</Label>
                      <Slider
                        value={[settings.volume]}
                        onValueChange={([value]) => updateSetting('volume', value)}
                        max={100}
                        step={10}
                        className="flex-1"
                      />
                      <span className="text-sm w-8">{settings.volume}%</span>
                    </div>
                  )}
                </div>

                {/* Notification Types */}
                <div className={`space-y-3 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Notification Types
                  </Label>
                  
                  {notificationTypes.map(({ key, label, icon: Icon, description }) => (
                    <div 
                      key={key} 
                      className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <Label className="font-medium">{label}</Label>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings[key as keyof NotificationSettings] as boolean}
                        onCheckedChange={(checked) => updateSetting(key as keyof NotificationSettings, checked)}
                      />
                    </div>
                  ))}
                </div>

                {/* Save Button */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button className="flex-1 neon-glow" onClick={handleSave}>
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}