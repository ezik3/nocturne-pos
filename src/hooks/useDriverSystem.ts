import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DriverProfile {
  id: string;
  user_id: string;
  drivers_license_id?: string;
  license_verified: boolean;
  vehicle_type?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  is_available: boolean;
  current_latitude?: number;
  current_longitude?: number;
  total_deliveries: number;
  total_rides: number;
  average_rating: number;
}

interface DeliveryOrder {
  id: string;
  customer_id: string;
  venue_id: string;
  driver_id?: string;
  status: string;
  pickup_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_fee: number;
  platform_fee: number;
  estimated_delivery_time?: string;
  special_instructions?: string;
  created_at: string;
}

interface RideBooking {
  id: string;
  customer_id: string;
  driver_id?: string;
  status: string;
  pickup_address: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  destination_address: string;
  destination_latitude?: number;
  destination_longitude?: number;
  estimated_fare?: number;
  actual_fare?: number;
  platform_fee: number;
  distance_km?: number;
  estimated_duration_minutes?: number;
  created_at: string;
}

interface DriverShift {
  id: string;
  driver_id: string;
  shift_type: 'delivery' | 'ride' | 'both';
  started_at: string;
  ended_at?: string;
  status: string;
  deliveries_completed: number;
  rides_completed: number;
  earnings: number;
}

export const useDriverSystem = () => {
  const { user } = useAuth();
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [activeShift, setActiveShift] = useState<DriverShift | null>(null);
  const [availableDeliveries, setAvailableDeliveries] = useState<DeliveryOrder[]>([]);
  const [availableRides, setAvailableRides] = useState<RideBooking[]>([]);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | RideBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDriver, setIsDriver] = useState(false);

  // Fetch driver profile
  const fetchDriverProfile = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setDriverProfile(data as DriverProfile);
      setIsDriver(true);
    }
    setLoading(false);
  }, [user]);

  // Register as driver
  const registerAsDriver = async (licenseId: string, vehicleType: string, vehicleDetails?: {
    make?: string;
    model?: string;
    plate?: string;
  }) => {
    if (!user) return { success: false, error: 'Not logged in' };

    const { data, error } = await supabase
      .from('driver_profiles')
      .insert({
        user_id: user.id,
        drivers_license_id: licenseId,
        vehicle_type: vehicleType,
        vehicle_make: vehicleDetails?.make,
        vehicle_model: vehicleDetails?.model,
        vehicle_plate: vehicleDetails?.plate,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to register as driver');
      return { success: false, error: error.message };
    }

    setDriverProfile(data as DriverProfile);
    setIsDriver(true);
    toast.success('Successfully registered as a JV Driver!');
    return { success: true, data };
  };

  // Start shift
  const startShift = async (shiftType: 'delivery' | 'ride' | 'both') => {
    if (!user || !driverProfile) return { success: false };

    // Update driver availability
    await supabase
      .from('driver_profiles')
      .update({ is_available: true })
      .eq('user_id', user.id);

    const { data, error } = await supabase
      .from('driver_shifts')
      .insert({
        driver_id: user.id,
        shift_type: shiftType,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to start shift');
      return { success: false };
    }

    setActiveShift(data as DriverShift);
    setDriverProfile(prev => prev ? { ...prev, is_available: true } : null);
    toast.success(`Shift started - ready for ${shiftType === 'both' ? 'deliveries & rides' : shiftType}!`);
    return { success: true };
  };

  // End shift
  const endShift = async () => {
    if (!user || !activeShift) return { success: false };

    // Update driver availability
    await supabase
      .from('driver_profiles')
      .update({ is_available: false })
      .eq('user_id', user.id);

    const { error } = await supabase
      .from('driver_shifts')
      .update({
        ended_at: new Date().toISOString(),
        status: 'ended',
      })
      .eq('id', activeShift.id);

    if (error) {
      toast.error('Failed to end shift');
      return { success: false };
    }

    const shiftSummary = { ...activeShift };
    setActiveShift(null);
    setDriverProfile(prev => prev ? { ...prev, is_available: false } : null);
    toast.success('Shift ended!');
    return { success: true, summary: shiftSummary };
  };

  // Update driver location
  const updateLocation = async (latitude: number, longitude: number) => {
    if (!user || !driverProfile) return;

    await supabase
      .from('driver_profiles')
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
        last_location_update: new Date().toISOString(),
      })
      .eq('user_id', user.id);
  };

  // Accept delivery order
  const acceptDelivery = async (orderId: string) => {
    if (!user) return { success: false };

    const { data, error } = await supabase
      .from('food_delivery_orders')
      .update({
        driver_id: user.id,
        status: 'driver_assigned',
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      toast.error('Failed to accept delivery');
      return { success: false };
    }

    setActiveOrder(data as DeliveryOrder);
    toast.success('Delivery accepted!');
    return { success: true, order: data };
  };

  // Accept ride
  const acceptRide = async (rideId: string) => {
    if (!user) return { success: false };

    const { data, error } = await supabase
      .from('ride_bookings')
      .update({
        driver_id: user.id,
        status: 'driver_assigned',
      })
      .eq('id', rideId)
      .select()
      .single();

    if (error) {
      toast.error('Failed to accept ride');
      return { success: false };
    }

    setActiveOrder(data as RideBooking);
    toast.success('Ride accepted!');
    return { success: true, ride: data };
  };

  // Update delivery status
  const updateDeliveryStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('food_delivery_orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update status');
      return { success: false };
    }

    if (status === 'delivered') {
      setActiveOrder(null);
      toast.success('Delivery completed!');
    }

    return { success: true };
  };

  // Update ride status
  const updateRideStatus = async (rideId: string, status: string) => {
    const { error } = await supabase
      .from('ride_bookings')
      .update({ status })
      .eq('id', rideId);

    if (error) {
      toast.error('Failed to update status');
      return { success: false };
    }

    if (status === 'completed') {
      setActiveOrder(null);
      toast.success('Ride completed!');
    }

    return { success: true };
  };

  // Book a ride (for customers)
  const bookRide = async (
    pickup: {
      address: string;
      latitude: number;
      longitude: number;
    }, 
    destination: {
      address: string;
      latitude: number;
      longitude: number;
    },
    fareEstimate?: {
      fare: number;
      distance: number;
      duration: number;
      driverEarnings: number;
      platformFee: number;
    }
  ) => {
    if (!user) return { success: false };

    // Use pre-calculated fare if provided, otherwise calculate basic estimate
    let estimatedFare: number;
    let distance: number;
    let duration: number;
    let driverEarnings: number;

    if (fareEstimate) {
      estimatedFare = fareEstimate.fare;
      distance = fareEstimate.distance;
      duration = fareEstimate.duration;
      driverEarnings = fareEstimate.driverEarnings;
    } else {
      // Fallback calculation
      distance = calculateDistance(
        pickup.latitude, pickup.longitude,
        destination.latitude, destination.longitude
      );
      estimatedFare = 3 + (distance * 1.5) + (Math.round(distance * 3) * 0.2);
      duration = Math.round(distance * 3);
      driverEarnings = estimatedFare - 0.10;
    }

    const { data, error } = await supabase
      .from('ride_bookings')
      .insert({
        customer_id: user.id,
        pickup_address: pickup.address,
        pickup_latitude: pickup.latitude,
        pickup_longitude: pickup.longitude,
        destination_address: destination.address,
        destination_latitude: destination.latitude,
        destination_longitude: destination.longitude,
        estimated_fare: estimatedFare,
        distance_km: distance,
        estimated_duration_minutes: duration,
        platform_fee: 0.10,
        driver_earnings: driverEarnings,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to book ride');
      return { success: false };
    }

    toast.success('Ride requested! Finding a driver...');
    return { success: true, booking: data };
  };

  // Helper: Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    fetchDriverProfile();

    // Subscribe to available deliveries
    const deliveryChannel = supabase
      .channel('available-deliveries')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'food_delivery_orders',
        filter: 'status=eq.venue_confirmed'
      }, (payload) => {
        if (payload.eventType === 'INSERT' && driverProfile?.is_available) {
          toast.info('New delivery available!', { duration: 5000 });
        }
      })
      .subscribe();

    // Subscribe to available rides
    const rideChannel = supabase
      .channel('available-rides')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ride_bookings',
        filter: 'status=eq.pending'
      }, (payload) => {
        if (payload.eventType === 'INSERT' && driverProfile?.is_available) {
          toast.info('New ride request!', { duration: 5000 });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(deliveryChannel);
      supabase.removeChannel(rideChannel);
    };
  }, [user, fetchDriverProfile, driverProfile?.is_available]);

  return {
    isDriver,
    driverProfile,
    activeShift,
    activeOrder,
    availableDeliveries,
    availableRides,
    loading,
    registerAsDriver,
    startShift,
    endShift,
    updateLocation,
    acceptDelivery,
    acceptRide,
    updateDeliveryStatus,
    updateRideStatus,
    bookRide,
    calculateDistance,
  };
};
