import { Store, Check, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const pendingVenues = [
  {
    id: 1,
    name: "The Rooftop Lounge",
    location: "Sydney, NSW",
    submittedAt: "2 hours ago",
    category: "Bar & Nightclub",
  },
  {
    id: 2,
    name: "Bella Italia",
    location: "Melbourne, VIC",
    submittedAt: "5 hours ago",
    category: "Restaurant",
  },
  {
    id: 3,
    name: "Sunset Beach Club",
    location: "Gold Coast, QLD",
    submittedAt: "1 day ago",
    category: "Beach Club",
  },
];

export function PendingApprovals() {
  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Pending Approvals</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-warning/10 text-warning rounded-full">
            {pendingVenues.length}
          </span>
        </div>
        <button className="text-xs text-primary hover:underline">View all</button>
      </div>
      <div className="space-y-3">
        {pendingVenues.map((venue) => (
          <div
            key={venue.id}
            className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50"
          >
            <div className="p-3 rounded-lg bg-warning/10">
              <Store className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{venue.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />
                {venue.location}
                <span className="text-border">•</span>
                {venue.category}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">
                <X className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
