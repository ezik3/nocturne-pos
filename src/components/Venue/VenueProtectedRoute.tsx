import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface VenueProtectedRouteProps {
  children: React.ReactNode;
}

export default function VenueProtectedRoute({ children }: VenueProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkVenueStatus();
  }, []);

  const checkVenueStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Check if this user owns a venue and if it's approved
      const { data: venue, error } = await supabase
        .from('venues')
        .select('approval_status')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking venue status:', error);
        setIsApproved(false);
        setIsLoading(false);
        return;
      }

      // If no venue found or not approved, redirect to pending
      if (!venue || venue.approval_status !== 'approved') {
        setIsApproved(false);
      } else {
        setIsApproved(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsApproved(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isApproved) {
    return <Navigate to="/venue/pending-approval" replace />;
  }

  return <>{children}</>;
}
