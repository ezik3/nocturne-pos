import { User, Store, Wallet, Flag, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "user",
    message: "New user registered",
    detail: "john.doe@example.com",
    time: "2 minutes ago",
    icon: User,
  },
  {
    id: 2,
    type: "venue",
    message: "Venue pending approval",
    detail: "The Blue Lagoon Bar",
    time: "15 minutes ago",
    icon: Store,
  },
  {
    id: 3,
    type: "transaction",
    message: "Large deposit detected",
    detail: "$5,000 AUD → 5,000 JVC",
    time: "32 minutes ago",
    icon: Wallet,
  },
  {
    id: 4,
    type: "report",
    message: "Content flagged for review",
    detail: "Post #4829 - Inappropriate content",
    time: "1 hour ago",
    icon: Flag,
  },
  {
    id: 5,
    type: "user",
    message: "User upgraded to Gold",
    detail: "sarah.smith@example.com",
    time: "2 hours ago",
    icon: User,
  },
];

const typeColors: Record<string, string> = {
  user: "bg-primary/10 text-primary",
  venue: "bg-warning/10 text-warning",
  transaction: "bg-success/10 text-success",
  report: "bg-destructive/10 text-destructive",
};

export function RecentActivity() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <button className="text-xs text-primary hover:underline">View all</button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className={cn("p-2 rounded-lg", typeColors[activity.type])}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activity.message}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="w-3 h-3" />
              {activity.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
