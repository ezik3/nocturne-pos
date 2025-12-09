import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Users, ShoppingCart, DollarSign, Clock, Star, TrendingUp,
  Utensils, MessageCircle, Radio, Activity, Bot, Menu as MenuIcon,
  ChevronRight, Bell, Settings, Eye, Megaphone
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import LiveChatOverlay from "@/components/Venue/LiveChatOverlay";
import NotificationSettingsModal from "@/components/Venue/NotificationSettingsModal";
import VenueNotificationToast from "@/components/Venue/VenueNotificationToast";
import GoLiveVideoPopup from "@/components/Venue/GoLiveVideoPopup";
import DealCreatorModal from "@/components/Venue/DealCreatorModal";
import TablesPopup from "@/components/Venue/TablesPopup";

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

const controlOrbs = [
  { id: "orders", icon: ShoppingCart, label: "Live Orders", color: "from-orange-500 to-red-500", count: 23 },
  { id: "kitchen", icon: Utensils, label: "Kitchen", color: "from-green-500 to-emerald-500", count: 8 },
  { id: "tables", icon: Users, label: "Tables", color: "from-blue-500 to-cyan-500", count: 18 },
  { id: "dj", icon: Radio, label: "DJ Booth", color: "from-purple-500 to-pink-500", count: null },
  { id: "chat", icon: MessageCircle, label: "Messages", color: "from-yellow-500 to-orange-500", count: 5 },
  { id: "ai", icon: Bot, label: "AI Waiter", color: "from-cyan-500 to-blue-500", count: null },
];

const recentActivity = [
  { time: "2 min ago", action: "New order #1234 received", type: "order", user: "Sarah M." },
  { time: "5 min ago", action: "Table 4 checked out", type: "checkout", user: "Mike J." },
  { time: "12 min ago", action: "Staff member John clocked in", type: "staff", user: "John D." },
  { time: "18 min ago", action: "New reservation for 8 PM", type: "reservation", user: "Emma W." },
];

const peopleAtVenue = [
  { id: "1", name: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", table: "4" },
  { id: "2", name: "Mike J.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", table: "7" },
  { id: "3", name: "Emma W.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", table: "12" },
  { id: "4", name: "Alex C.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", table: "3" },
  { id: "5", name: "Lisa K.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", table: "9" },
  { id: "6", name: "Tom H.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", table: "1" },
];

const FloatingOrb = ({ orb, index, onClick }: { orb: typeof controlOrbs[0]; index: number; onClick: () => void }) => {
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
      animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
      transition={{
        scale: { delay: index * 0.1, duration: 0.5 },
        y: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: index * 0.2 }
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br ${orb.color} 
        shadow-2xl flex items-center justify-center group border-2 border-white/30`}>
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${orb.color} opacity-60 blur-2xl 
          group-hover:opacity-90 transition-opacity`} />
        <orb.icon className="w-10 h-10 md:w-12 md:h-12 text-white relative z-10 drop-shadow-lg" />
        {orb.count !== null && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center 
            justify-center text-white text-sm font-bold shadow-lg border-2 border-white">
            {orb.count}
          </div>
        )}
      </div>
      <p className="text-center text-white text-sm mt-3 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {orb.label}
      </p>
    </motion.div>
  );
};

const AmbientParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(40)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-primary/50 rounded-full"
        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        animate={{ y: [-20, -100], opacity: [0, 0.8, 0] }}
        transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3, ease: "easeOut" }}
      />
    ))}
  </div>
);

export default function VenueHome() {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [showDealCreator, setShowDealCreator] = useState(false);
  const [showTablesPopup, setShowTablesPopup] = useState(false);
  const occupancyPercent = (venueData.currentOccupancy / venueData.maxCapacity) * 100;

  const handleOrbClick = (orbId: string) => {
    if (orbId === 'chat') setShowChat(true);
    if (orbId === 'tables') setShowTablesPopup(true); // Show popup instead of navigating
    if (orbId === 'kitchen') navigate('/venue/pos/kitchen');
    if (orbId === 'orders') navigate('/venue/pos/orders');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <VenueNotificationToast />
      <LiveChatOverlay isOpen={showChat} onClose={() => setShowChat(false)} />
      <NotificationSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <GoLiveVideoPopup 
        isLive={isLive} 
        onClose={() => setIsLive(false)} 
        streamerName="The Electric Lounge"
        viewerCount={47}
      />
      <DealCreatorModal isOpen={showDealCreator} onClose={() => setShowDealCreator(false)} availableCredits={15} />
      <TablesPopup isOpen={showTablesPopup} onClose={() => setShowTablesPopup(false)} />

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent" />
        <AmbientParticles />
      </div>

      <motion.div className="relative z-10 p-6" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-purple-400 bg-clip-text text-transparent">
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
            <Button variant="ghost" size="icon" className="relative text-white" onClick={() => setShowSettings(true)}>
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">3</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-white" onClick={() => setShowSettings(true)}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div className="relative z-10 px-6" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="text-2xl font-bold text-white">{venueData.currentOccupancy}</span>
                  <span className="text-slate-400">/ {venueData.maxCapacity}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">Currently Here</p>
                <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${occupancyPercent}%` }} />
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-orange-400" />
                  <span className="text-2xl font-bold text-white">{venueData.activeOrders}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">Active Orders</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-2xl font-bold text-white">${venueData.revenue.toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">Today's Revenue</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-2xl font-bold text-white">{venueData.avgWaitTime}</span>
                  <span className="text-slate-400">min</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">Avg Wait Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="relative z-10 h-[400px] md:h-[500px] mt-8">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-purple-500/40 flex items-center justify-center border-2 border-white/20" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/60 to-purple-500/60 flex items-center justify-center backdrop-blur-sm">
              <Eye className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <p className="text-center text-white mt-4 font-bold text-lg drop-shadow-lg">Control Center</p>
        </div>
        {controlOrbs.map((orb, index) => (
          <FloatingOrb key={orb.id} orb={orb} index={index} onClick={() => handleOrbClick(orb.id)} />
        ))}
      </div>

      <div className="relative z-10 px-6 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-primary" />Live Activity</h2>
              <Button variant="ghost" size="sm" className="text-primary">View All <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/50">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{activity.action}</p>
                    <p className="text-xs text-slate-400">{activity.time} • {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-green-400" />Who's Here</h2>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">{venueData.currentOccupancy} checked in</span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {peopleAtVenue.map((person) => (
                <div key={person.id} className="flex flex-col items-center group cursor-pointer">
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-green-500/50 group-hover:ring-green-500">
                      <AvatarImage src={person.avatar} />
                      <AvatarFallback>{person.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold border border-green-500 text-green-400">{person.table}</div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 truncate max-w-full">{person.name}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-slate-600 text-slate-300">View All Guests</Button>
          </CardContent>
        </Card>
      </div>

      <motion.div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-700">
          <CardContent className="p-3 flex items-center gap-3">
            <Button 
              className={isLive ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-green-500 to-emerald-500"} 
              onClick={() => setIsLive(!isLive)}
            >
              <Radio className={`w-4 h-4 mr-2 ${isLive ? 'animate-pulse' : ''}`} />
              {isLive ? 'End Live' : 'Go Live'}
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300"><MenuIcon className="w-4 h-4 mr-2" />Quick Menu</Button>
            <Button onClick={() => setShowDealCreator(true)} className="bg-gradient-to-r from-cyan-500 to-blue-500">
              <Megaphone className="w-4 h-4 mr-2" />Push Deal
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}