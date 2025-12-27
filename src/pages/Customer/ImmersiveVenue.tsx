import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCheckIn } from "@/hooks/useUserCheckIn";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Web3FeedHeader from "@/components/Customer/Feed/Web3FeedHeader";
import VibeSphere from "@/components/VibeSphere/VibeSphere";
import CheckinConflictModal from "@/components/Customer/CheckinConflictModal";
import { 
  MapPin, 
  Users, 
  Star, 
  Clock, 
  Phone, 
  Globe, 
  CheckCircle,
  ChevronLeft,
  Play,
  Calendar,
  Shirt,
  AlertCircle,
  Navigation
} from "lucide-react";

interface Venue {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  venue_type?: string;
  vibe_score: number;
  current_occupancy: number;
  capacity?: number;
  image_url?: string;
}

// Mock venue details (would come from DB in production)
const venueDetails = {
  ageRestriction: "21+",
  dressCode: "Smart Casual - No sportswear, sneakers allowed",
  hours: {
    "Mon-Thu": "4PM - 1AM",
    "Fri-Sat": "4PM - 2AM",
    "Sun": "4PM - 12AM"
  },
  phone: "+1 (555) 123-4567",
  website: "www.skylineslounge.com",
  rating: 4.8,
  reviewCount: 896,
  features: ["Rooftop", "Live DJ", "VIP Area", "Full Bar", "Restaurant"],
};

const ImmersiveVenue = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentCheckIn } = useUserCheckIn();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showVibeSphere, setShowVibeSphere] = useState(false);
  const [userStatus, setUserStatus] = useState<"at" | "heading" | "maybe" | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Mock crowd data
  const [crowdStatus] = useState({
    at: 127, // Green - checked in at venue
    heading: 45, // Orange - heading to venue
    maybe: 89, // Red - maybe going
  });

  useEffect(() => {
    const fetchVenue = async () => {
      if (!id) {
        // Use mock data if no ID
        setVenue({
          id: "mock",
          name: "Skyline Lounge",
          description: "Perched atop one of the city's most iconic skyscrapers, Skyline Lounge offers an unparalleled experience combining breathtaking panoramic views, world-class cocktails, and exquisite cuisine. Our expert mixologists craft signature drinks that perfectly complement the stunning cityscape.",
          address: "123 Skyview Tower, Downtown",
          city: "New York",
          venue_type: "Rooftop Bar & Restaurant",
          vibe_score: 92,
          current_occupancy: 127,
          capacity: 200,
          image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        // Use mock data if venue not found
        setVenue({
          id: id,
          name: "Skyline Lounge",
          description: "Perched atop one of the city's most iconic skyscrapers, Skyline Lounge offers an unparalleled experience combining breathtaking panoramic views, world-class cocktails, and exquisite cuisine. Our expert mixologists craft signature drinks that perfectly complement the stunning cityscape.",
          address: "123 Skyview Tower, Downtown",
          city: "New York",
          venue_type: "Rooftop Bar & Restaurant",
          vibe_score: 92,
          current_occupancy: 127,
          capacity: 200,
          image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
        });
      } else {
        setVenue(data);
      }
      setLoading(false);
    };

    const checkIfCheckedIn = async () => {
      if (!user || !id) return;

      const { data } = await supabase
        .from("check_ins")
        .select("*")
        .eq("user_id", user.id)
        .eq("venue_id", id)
        .is("checked_out_at", null)
        .single();

      if (data) {
        setIsCheckedIn(true);
        setUserStatus("at");
      }
    };

    fetchVenue();
    checkIfCheckedIn();
  }, [id, user]);

  const handleCheckIn = async () => {
    if (!user) {
      toast.error("Please sign in to check in");
      return;
    }

    // Check if already checked in at another venue
    if (currentCheckIn && currentCheckIn.venueId !== id) {
      setShowConflictModal(true);
      return;
    }

    await performCheckIn();
  };

  const performCheckIn = async () => {
    // Start transition animation
    setIsTransitioning(true);

    if (!id || id === "mock") {
      // Mock check-in - wait for transition
      setTimeout(() => {
        setIsCheckedIn(true);
        setUserStatus("at");
        setIsTransitioning(false);
        setShowVibeSphere(true);
      }, 3000);
      return;
    }

    const { error } = await supabase.from("check_ins").insert({
      user_id: user!.id,
      venue_id: id,
      visibility: "public",
    });

    if (error) {
      toast.error("Failed to check in");
      setIsTransitioning(false);
      console.error(error);
    } else {
      // Wait for transition to complete
      setTimeout(() => {
        setIsCheckedIn(true);
        setUserStatus("at");
        setIsTransitioning(false);
        setShowVibeSphere(true);
      }, 3000);
    }
  };

  const handleCheckoutAndContinue = async () => {
    if (!user || !currentCheckIn) return;

    setIsCheckingOut(true);

    // Checkout from current venue
    const { error: checkoutError } = await supabase
      .from("check_ins")
      .update({ checked_out_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("venue_id", currentCheckIn.venueId)
      .is("checked_out_at", null);

    if (checkoutError) {
      toast.error("Failed to checkout from current venue");
      setIsCheckingOut(false);
      console.error(checkoutError);
      return;
    }

    toast.success(`Checked out of ${currentCheckIn.venueName || "previous venue"}`);
    setShowConflictModal(false);
    setIsCheckingOut(false);

    // Small delay to allow real-time update to propagate
    setTimeout(() => {
      performCheckIn();
    }, 500);
  };

  const handleExitVibeSphere = () => {
    setShowVibeSphere(false);
    // Navigate back to previous page
    navigate(-1);
  };

  const handleStatusChange = (status: "at" | "heading" | "maybe") => {
    if (status === "at" && !isCheckedIn) {
      handleCheckIn();
    } else {
      setUserStatus(status);
      const statusMessages = {
        at: "You're marked as @ this venue",
        heading: "You're marked as heading to this venue",
        maybe: "You're marked as maybe going",
      };
      toast.success(statusMessages[status]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-cyan/30 rounded-full animate-ping" />
            <div className="absolute inset-2 border-4 border-purple/50 rounded-full animate-pulse" />
          </div>
          <p className="text-white/80 animate-pulse">Loading venue...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-lg text-white">Venue not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden" style={{ overflowY: showVibeSphere ? 'hidden' : 'auto' }}>
      <Web3FeedHeader />
      
      {/* Hero Section with Venue Image */}
      <div className="relative h-[50vh] mt-14">
        <img 
          src={venue.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"} 
          alt={venue.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Video Play Button */}
        <button className="absolute top-4 left-16 w-12 h-12 bg-pink/80 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
          <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
        </button>

        {/* Crowd Status Indicators - Top Right */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => handleStatusChange("at")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all ${
              userStatus === "at" 
                ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
                : "bg-black/50 text-green-400 hover:bg-green-500/30"
            }`}
          >
            <div className="w-3 h-3 bg-green-400 rounded-full" />
            <span className="text-sm font-medium">{crowdStatus.at}</span>
          </button>
          <button
            onClick={() => handleStatusChange("heading")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all ${
              userStatus === "heading" 
                ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]" 
                : "bg-black/50 text-orange-400 hover:bg-orange-500/30"
            }`}
          >
            <div className="w-3 h-3 bg-orange-400 rounded-full" />
            <span className="text-sm font-medium">{crowdStatus.heading}</span>
          </button>
          <button
            onClick={() => handleStatusChange("maybe")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all ${
              userStatus === "maybe" 
                ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                : "bg-black/50 text-red-400 hover:bg-red-500/30"
            }`}
          >
            <div className="w-3 h-3 bg-red-400 rounded-full" />
            <span className="text-sm font-medium">{crowdStatus.maybe}</span>
          </button>
        </div>

        {/* Venue Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-4xl font-bold text-white mb-2">{venue.name}</h1>
          <p className="text-cyan text-lg font-medium mb-2">{venue.venue_type}</p>
          <div className="flex items-center gap-4 text-white/80">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-gold fill-gold" />
              <span>{venueDetails.rating}</span>
              <span className="text-white/50">({venueDetails.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-5 h-5" />
              <span>{venue.current_occupancy}/{venue.capacity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - About */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-secondary/20 rounded-2xl p-6 border border-border/30">
            <h2 className="text-cyan text-2xl font-bold mb-4">About {venue.name}</h2>
            <p className="text-white/80 leading-relaxed">{venue.description}</p>
            
            {/* Features */}
            <div className="flex flex-wrap gap-2 mt-4">
              {venueDetails.features.map((feature) => (
                <Badge key={feature} variant="secondary" className="bg-purple/20 text-purple border-purple/30">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {/* Venue Rules */}
          <div className="bg-secondary/20 rounded-2xl p-6 border border-border/30">
            <h2 className="text-pink text-2xl font-bold mb-4">Venue Info</h2>
            
            <div className="space-y-4">
              {/* Age Restriction */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-pink" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Age Restriction</h3>
                  <p className="text-white/60">{venueDetails.ageRestriction} - Valid ID required</p>
                </div>
              </div>

              {/* Dress Code */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shirt className="w-6 h-6 text-purple" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Dress Code</h3>
                  <p className="text-white/60">{venueDetails.dressCode}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-cyan" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Hours</h3>
                  <div className="text-white/60 space-y-1">
                    {Object.entries(venueDetails.hours).map(([day, hours]) => (
                      <p key={day}><span className="text-white/80">{day}:</span> {hours}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Who's Here - People at venue */}
          <div className="bg-secondary/20 rounded-2xl p-6 border border-border/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-cyan text-xl font-bold">Who's Here</h2>
              <span className="text-white/50 text-sm">{crowdStatus.at} people</span>
            </div>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Avatar key={i} className="w-12 h-12 border-2 border-black">
                  <AvatarImage src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 30}.jpg`} />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
              ))}
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white/70 text-sm border-2 border-black">
                +{crowdStatus.at - 8}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details & Actions */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-secondary/20 rounded-2xl p-6 border border-border/30">
            <h2 className="text-cyan text-xl font-bold mb-4">Contact</h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/80">
                <MapPin className="w-5 h-5 text-cyan" />
                <span className="text-sm">{venue.address}</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Phone className="w-5 h-5 text-cyan" />
                <span className="text-sm">{venueDetails.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Globe className="w-5 h-5 text-cyan" />
                <span className="text-sm">{venueDetails.website}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Check In Button */}
            <Button
              onClick={handleCheckIn}
              disabled={isCheckedIn}
              className={`w-full h-14 text-lg font-semibold rounded-xl ${
                isCheckedIn 
                  ? "bg-green-500/30 text-green-400 border border-green-500/50" 
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
              }`}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {isCheckedIn ? "@ " + venue.name : "Check In"}
            </Button>

            {/* Heading To Button */}
            <Button
              onClick={() => handleStatusChange("heading")}
              variant="outline"
              className={`w-full h-12 rounded-xl ${
                userStatus === "heading"
                  ? "bg-orange-500/30 border-orange-500 text-orange-400"
                  : "border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
              }`}
            >
              <Navigation className="w-5 h-5 mr-2" />
              Heading There
            </Button>

            {/* Maybe Going Button */}
            <Button
              onClick={() => handleStatusChange("maybe")}
              variant="outline"
              className={`w-full h-12 rounded-xl ${
                userStatus === "maybe"
                  ? "bg-red-500/30 border-red-500 text-red-400"
                  : "border-red-500/50 text-red-400 hover:bg-red-500/20"
              }`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Maybe Going
            </Button>

            {/* Enter VenueVerse Button - shows when checked in */}
            {isCheckedIn && !showVibeSphere && (
              <Button
                onClick={() => setShowVibeSphere(true)}
                className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-cyan via-purple to-pink text-white shadow-[0_0_30px_rgba(0,217,255,0.3)]"
              >
                🌐 Enter VenueVerse
              </Button>
            )}

            {/* Call Waiter Button */}
            {isCheckedIn && (
              <Button
                onClick={() => toast.success("Waiter called! They'll be with you shortly.")}
                variant="outline"
                className="w-full h-12 border-pink/50 text-pink hover:bg-pink/20 rounded-xl"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Waiter
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* VibeSphere Immersive Experience */}
      <VibeSphere
        isCheckedIn={isCheckedIn}
        isTransitioning={isTransitioning}
        venueName={venue.name}
        venueType={venue.venue_type}
        vibeLevel="🔥 Lit"
        priceLevel="💰 $$"
        hours="Closes 2 AM"
        venueId={venue.id}
        onExit={handleExitVibeSphere}
      />

      {/* Checkin Conflict Modal */}
      <CheckinConflictModal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        currentVenueName={currentCheckIn?.venueName || "Unknown Venue"}
        newVenueName={venue.name}
        onCheckoutAndContinue={handleCheckoutAndContinue}
        isLoading={isCheckingOut}
      />
    </div>
  );
};

export default ImmersiveVenue;
