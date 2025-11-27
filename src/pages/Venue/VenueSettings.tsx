import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Shield, CreditCard, Users, Palette, Globe } from "lucide-react";

const settingSections = [
  {
    title: "Notifications",
    icon: Bell,
    settings: [
      { label: "New order alerts", description: "Get notified when a new order is placed", enabled: true },
      { label: "Staff check-in alerts", description: "Get notified when staff clock in/out", enabled: true },
      { label: "Low stock warnings", description: "Get notified when items are running low", enabled: false },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    settings: [
      { label: "Two-factor authentication", description: "Add an extra layer of security", enabled: true },
      { label: "Session timeout", description: "Auto logout after 30 minutes of inactivity", enabled: false },
    ],
  },
  {
    title: "Payments",
    icon: CreditCard,
    settings: [
      { label: "Accept JV Coin", description: "Allow customers to pay with JV Coin", enabled: true },
      { label: "Accept cards", description: "Allow card payments via Stripe", enabled: true },
      { label: "Auto-withdrawals", description: "Automatically withdraw to bank daily", enabled: false },
    ],
  },
];

export default function VenueSettings() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary mb-6">Settings</h1>

      <div className="space-y-6">
        {settingSections.map((section) => (
          <Card key={section.title} className="glass border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
              <div className="space-y-4">
                {section.settings.map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                    <div>
                      <Label className="font-medium">{setting.label}</Label>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch defaultChecked={setting.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Quick Actions */}
        <Card className="glass border-border">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border">
                <Users className="h-5 w-5 text-primary" />
                <span>Manage Staff</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border">
                <Palette className="h-5 w-5 text-primary" />
                <span>Customize Theme</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border">
                <Globe className="h-5 w-5 text-primary" />
                <span>Public Profile</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>Billing</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
