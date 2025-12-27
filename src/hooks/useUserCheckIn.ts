import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CheckIn {
  venueId: string;
  venueName?: string;
}

export const useUserCheckIn = () => {
  const { user } = useAuth();
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCurrentCheckIn(null);
      setLoading(false);
      return;
    }

    const fetchCurrentCheckIn = async () => {
      try {
        const { data, error } = await supabase
          .from("check_ins")
          .select(`
            venue_id,
            venues (name)
          `)
          .eq("user_id", user.id)
          .is("checked_out_at", null)
          .order("checked_in_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setCurrentCheckIn({
            venueId: data.venue_id,
            venueName: (data.venues as any)?.name || undefined
          });
        } else {
          setCurrentCheckIn(null);
        }
      } catch (error) {
        console.error("Error fetching check-in:", error);
        setCurrentCheckIn(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentCheckIn();

    // Subscribe to real-time check-in changes for this user
    const channel = supabase
      .channel(`user-checkin-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "check_ins",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchCurrentCheckIn();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const isCheckedInAt = (venueId: string): boolean => {
    return currentCheckIn?.venueId === venueId;
  };

  return {
    currentCheckIn,
    isCheckedInAt,
    loading
  };
};
