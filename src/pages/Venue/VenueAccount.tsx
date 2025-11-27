import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera, MapPin, Phone, Mail, Globe } from "lucide-react";

export default function VenueAccount() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary mb-6">Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="glass border-border">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary/20 text-primary text-2xl">JV</AvatarFallback>
              </Avatar>
              <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-xl font-bold mb-1">The Electric Lounge</h2>
            <p className="text-muted-foreground mb-4">Premium Nightclub</p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">123 Party Street, Sydney</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">+61 2 1234 5678</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">info@electriclounge.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">electriclounge.com</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="glass border-border lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Venue Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Venue Name</Label>
                <Input defaultValue="The Electric Lounge" className="bg-secondary/30 border-border" />
              </div>
              <div className="space-y-2">
                <Label>Venue Type</Label>
                <Input defaultValue="Nightclub" className="bg-secondary/30 border-border" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="info@electriclounge.com" className="bg-secondary/30 border-border" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue="+61 2 1234 5678" className="bg-secondary/30 border-border" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Address</Label>
                <Input defaultValue="123 Party Street, Sydney NSW 2000" className="bg-secondary/30 border-border" />
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input defaultValue="500" type="number" className="bg-secondary/30 border-border" />
              </div>
              <div className="space-y-2">
                <Label>Operating Hours</Label>
                <Input defaultValue="6 PM - 4 AM" className="bg-secondary/30 border-border" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" className="border-border">Cancel</Button>
              <Button className="bg-primary text-primary-foreground">Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
