import { useState } from "react";
import { Heart, MessageSquare, Image, Calendar, UserPlus, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import FeedHeader from "@/components/Customer/Feed/FeedHeader";

interface Notification {
  id: string;
  type: "like" | "comment" | "tag" | "event" | "follow";
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  highlight?: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "like",
    user: { name: "Emma W.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" },
    content: "liked your post",
    highlight: "\"Last night was 🔥!\"",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "comment",
    user: { name: "Mike B.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
    content: "commented on your post:",
    highlight: "\"Can't wait for the next event!\"",
    time: "15 minutes ago",
    read: false,
  },
  {
    id: "3",
    type: "tag",
    user: { name: "Soph L.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
    content: "tagged you in a photo at",
    highlight: "Club Neon",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "event",
    user: { name: "Dave K.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
    content: "invited you to an event:",
    highlight: "\"Summer Beats Festival\"",
    time: "1 day ago",
    read: true,
  },
  {
    id: "5",
    type: "follow",
    user: { name: "Liv D.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" },
    content: "started following you",
    time: "2 days ago",
    read: true,
  },
  {
    id: "6",
    type: "like",
    user: { name: "Jake R.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
    content: "liked your post",
    highlight: "\"Sunset vibes at the rooftop\"",
    time: "3 days ago",
    read: true,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "like":
      return <Heart className="w-5 h-5" />;
    case "comment":
      return <MessageSquare className="w-5 h-5" />;
    case "tag":
      return <Image className="w-5 h-5" />;
    case "event":
      return <Calendar className="w-5 h-5" />;
    case "follow":
      return <UserPlus className="w-5 h-5" />;
  }
};

const getIconColor = (type: Notification["type"]) => {
  switch (type) {
    case "like":
      return "bg-neon-pink/20 text-neon-pink";
    case "comment":
      return "bg-neon-purple/20 text-neon-purple";
    case "tag":
      return "bg-neon-purple/20 text-neon-purple";
    case "event":
      return "bg-neon-pink/20 text-neon-pink";
    case "follow":
      return "bg-neon-purple/20 text-neon-purple";
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-black">
      <FeedHeader />
      
      <div className="px-4 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-neon-cyan">Notifications</h1>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/20"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-secondary/20 rounded-2xl border border-border/30 overflow-hidden">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 hover:bg-secondary/30 transition-colors cursor-pointer ${
                !notification.read ? "bg-neon-cyan/5" : ""
              } ${index !== notifications.length - 1 ? "border-b border-border/20" : ""}`}
            >
              {/* User Avatar with Ring */}
              <div className="relative">
                <Avatar className="w-14 h-14 border-2 border-neon-cyan">
                  <AvatarImage src={notification.user.avatar} />
                  <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
                </Avatar>
                {!notification.read && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-pink rounded-full" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-foreground">
                  <span className="font-bold text-white">{notification.user.name}</span>
                  {" "}{notification.content}
                  {notification.highlight && (
                    <span className="text-neon-cyan"> {notification.highlight}</span>
                  )}
                </p>
                <p className="text-foreground/50 text-sm mt-1">{notification.time}</p>
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-border/30">
            <p className="text-foreground/60 text-lg">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
