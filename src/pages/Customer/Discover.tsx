import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const Discover = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVenues = async () => {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .order("vibe_score", { ascending: false });

      if (error) {
        toast.error("Failed to load venues");
        console.error(error);
      } else {
        setVenues(data || []);
      }
      setLoading(false);
    };

    fetchVenues();
  }, []);

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
        <div className="text-lg">Discovering vibes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover Venues
          </h1>
          <p className="text-muted-foreground">
            Find the perfect vibe for your night out
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <Card
              key={venue.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/app/venue/${venue.id}`)}
            >
              {venue.image_url && (
                <div className="w-full h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={venue.image_url}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{venue.name}</CardTitle>
                  <Badge variant="secondary">{venue.venue_type || "Venue"}</Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {venue.city || "Location"} • {venue.address || ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {venue.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {venue.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-4 w-4 ${getVibeColor(venue.vibe_score)}`} />
                    <span className="text-sm font-medium">
                      {getVibeLabel(venue.vibe_score)}
                    </span>
                  </div>
                  {venue.capacity && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {venue.current_occupancy}/{venue.capacity}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {venues.length === 0 && (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No venues yet</h3>
            <p className="text-muted-foreground">
              Check back soon for exciting venues in your area!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Discover;
