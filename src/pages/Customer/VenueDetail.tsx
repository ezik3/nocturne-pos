import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, TrendingUp, CheckCircle } from "lucide-react";

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

const VenueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    const fetchVenue = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to load venue");
        console.error(error);
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

      setIsCheckedIn(!!data);
    };

    fetchVenue();
    checkIfCheckedIn();
  }, [id, user]);

  const handleCheckIn = async () => {
    if (!user || !id) {
      toast.error("Please sign in to check in");
      return;
    }

    const { error } = await supabase.from("check_ins").insert({
      user_id: user.id,
      venue_id: id,
      visibility: "public",
    });

    if (error) {
      toast.error("Failed to check in");
      console.error(error);
    } else {
      toast.success("Checked in successfully!");
      setIsCheckedIn(true);
    }
  };

  const getVibeColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-orange-500";
  };

  const getVibeLabel = (score: number) => {
    if (score >= 80) return "🔥 On Fire";
    if (score >= 50) return "⚡ Buzzing";
    return "✨ Chill";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading venue...</div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Venue not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          {venue.image_url && (
            <div className="w-full h-64 overflow-hidden rounded-t-lg">
              <img
                src={venue.image_url}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{venue.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  {venue.address && `${venue.address}, `}
                  {venue.city}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {venue.venue_type || "Venue"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {venue.description && (
              <p className="text-muted-foreground text-lg">{venue.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <TrendingUp className={`h-8 w-8 mb-2 ${getVibeColor(venue.vibe_score)}`} />
                    <p className="font-semibold">{getVibeLabel(venue.vibe_score)}</p>
                    <p className="text-sm text-muted-foreground">Current Vibe</p>
                  </div>
                </CardContent>
              </Card>

              {venue.capacity && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <Users className="h-8 w-8 mb-2" />
                      <p className="font-semibold">
                        {venue.current_occupancy}/{venue.capacity}
                      </p>
                      <p className="text-sm text-muted-foreground">Occupancy</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle className="h-8 w-8 mb-2" />
                    <p className="font-semibold">{isCheckedIn ? "Checked In" : "Check In"}</p>
                    <p className="text-sm text-muted-foreground">Status</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleCheckIn}
                disabled={isCheckedIn}
                className="flex-1"
                size="lg"
              >
                {isCheckedIn ? "Already Checked In" : "Check In Now"}
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                View Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VenueDetail;
