import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, ShoppingCart, DollarSign, Clock, Star, TrendingUp,
  Utensils, MessageCircle, Radio, Activity, Bot, Menu as MenuIcon,
  ChevronRight, Bell, Settings, Eye
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Mock venue data
const venueData = {
  name: "The Electric Lounge",
  vibeLevel: "🔥 Lit",
  currentOccupancy: 156,
  maxCapacity: 250,
  activeOrders: 23,
  pendingOrders: 8,
  revenue: 4280,
  avgWaitTime: 12,
  rating: 4.8,
};

// VibeSphere Orbs for venue owner control
const controlOrbs = [
  { id: "orders", icon: ShoppingCart, label: "Live Orders", color: "from-orange-500 to-red-500", count: 23 },
  { id: "kitchen", icon: Utensils, label: "Kitchen", color: "from-green-500 to-emerald-500", count: 8 },
  { id: "tables", icon: Users, label: "Tables", color: "from-blue-500 to-cyan-500", count: 18 },
  { id: "dj", icon: Radio, label: "DJ Booth", color: "from-purple-500 to-pink-500", count: null },
  { id: "chat", icon: MessageCircle, label: "Messages", color: "from-yellow-500 to-orange-500", count: 5 },
  { id: "ai", icon: Bot, label: "AI Waiter", color: "from-cyan-500 to-blue-500", count: null },
];

// Recent activity
const recentActivity = [
  { time: "2 min ago", action: "New order #1234 received", type: "order", user: "Sarah M." },
  { time: "5 min ago", action: "Table 4 checked out", type: "checkout", user: "Mike J." },
  { time: "12 min ago", action: "Staff member John clocked in", type: "staff", user: "John D." },
  { time: "18 min ago", action: "New reservation for 8 PM", type: "reservation", user: "Emma W." },
];

// People at venue
const peopleAtVenue = [
  { id: "1", name: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", table: "4" },
  { id: "2", name: "Mike J.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", table: "7" },
  { id: "3", name: "Emma W.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", table: "12" },
  { id: "4", name: "Alex C.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", table: "3" },
  { id: "5", name: "Lisa K.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", table: "9" },
  { id: "6", name: "Tom H.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", table: "1" },
];

// Floating Orb Component
const FloatingOrb = ({ 
  orb, 
  index, 
  onClick 
}: { 
  orb: typeof controlOrbs[0]; 
  index: number; 
  onClick: () => void;
}) => {
  const positions = [
    { top: "15%", left: "15%" },
    { top: "15%", right: "15%" },
    { top: "45%", left: "8%" },
    { top: "45%", right: "8%" },
    { top: "75%", left: "20%" },
    { top: "75%", right: "20%" },
  ];

  const pos = positions[index] || positions[0];

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={pos}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: [0, -10, 0],
      }}
      transition={{
        scale: { delay: index * 0.1, duration: 0.5 },
        y: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: index * 0.2 }
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${orb.color} 
        shadow-lg flex items-center justify-center group`}>
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${orb.color} opacity-50 blur-xl 
          group-hover:opacity-80 transition-opacity`} />
        
        {/* Icon */}
        <orb.icon className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />
        
        {/* Count badge */}
        {orb.count !== null && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center 
            justify-center text-white text-xs font-bold shadow-lg">
            {orb.count}
          </div>
        )}
      </div>
      
      {/* Label */}
      <p className="text-center text-white text-sm mt-2 font-medium drop-shadow-lg">
        {orb.label}
      </p>
    </motion.div>
  );
};

// Ambient particles
const AmbientParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-primary/30 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [-20, -100],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: "easeOut",
        }}
      />
    ))}
  </div>
);

export default function VenueHome() {
  const [selectedOrb, setSelectedOrb] = useState<string | null>(null);
  const occupancyPercent = (venueData.currentOccupancy / venueData.maxCapacity) * 100;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-background overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
        <AmbientParticles />
      </div>

      {/* Header */}
      <motion.div 
        className="relative z-10 p-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-neon-cyan to-neon-purple bg-clip-text text-transparent">
              {venueData.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xl">{venueData.vibeLevel}</span>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{venueData.rating}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                3
              </span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div 
        className="relative z-10 px-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="text-2xl font-bold">{venueData.currentOccupancy}</span>
                  <span className="text-muted-foreground">/ {venueData.maxCapacity}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Currently Here</p>
                <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-orange-400" />
                  <span className="text-2xl font-bold">{venueData.activeOrders}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Active Orders</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-2xl font-bold">${venueData.revenue.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Today's Revenue</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-2xl font-bold">{venueData.avgWaitTime}</span>
                  <span className="text-muted-foreground">min</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Avg Wait Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* VibeSphere Control Center */}
      <div className="relative z-10 h-[400px] md:h-[500px] mt-8">
        {/* Center venue pulse */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-neon-purple/30 
              flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/50 to-neon-purple/50 
              flex items-center justify-center backdrop-blur-sm">
              <Eye className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <p className="text-center text-white/80 mt-4 font-medium">Control Center</p>
        </div>

        {/* Floating Control Orbs */}
        {controlOrbs.map((orb, index) => (
          <FloatingOrb
            key={orb.id}
            orb={orb}
            index={index}
            onClick={() => setSelectedOrb(orb.id)}
          />
        ))}
      </div>

      {/* Bottom Section - Activity & People */}
      <div className="relative z-10 px-6 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Live Activity
                </h2>
                <Button variant="ghost" size="sm" className="text-primary">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <motion.div 
                    key={i} 
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time} • {activity.user}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* People at Venue */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  Who's Here
                </h2>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  {venueData.currentOccupancy} checked in
                </span>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {peopleAtVenue.map((person, i) => (
                  <motion.div
                    key={person.id}
                    className="flex flex-col items-center group cursor-pointer"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12 ring-2 ring-green-500/50 group-hover:ring-green-500">
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback>{person.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full 
                        flex items-center justify-center text-[10px] font-bold border border-green-500 text-green-400">
                        {person.table}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 truncate max-w-full">{person.name}</p>
                  </motion.div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4 border-border/50">
                View All Guests
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions Bar */}
      <motion.div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Go Live
            </Button>
            <Button variant="outline" className="border-border/50">
              <MenuIcon className="w-4 h-4 mr-2" />
              Quick Menu
            </Button>
            <Button variant="outline" className="border-border/50">
              <Bot className="w-4 h-4 mr-2" />
              AI Settings
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}