import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Navigation, Clock, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeolocation } from "@/hooks/useGeolocation";

interface DeliveryAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string, lat: number, lng: number) => void;
  venueLocation: { lat: number; lng: number } | null;
  venueName: string;
  maxDeliveryRadius?: number;
}

export const DeliveryAddressModal: React.FC<DeliveryAddressModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  venueLocation,
  venueName,
  maxDeliveryRadius = 20
}) => {
  const [address, setAddress] = useState("");
  const [manualLat, setManualLat] = useState<number | null>(null);
  const [manualLng, setManualLng] = useState<number | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { latitude, longitude, loading, error: geoError, requestLocation } = useGeolocation({ 
    enableHighAccuracy: true 
  });

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const currentLat = useCurrentLocation ? latitude : manualLat;
  const currentLng = useCurrentLocation ? longitude : manualLng;

  const distance = venueLocation && currentLat && currentLng
    ? calculateDistance(venueLocation.lat, venueLocation.lng, currentLat, currentLng)
    : null;

  const isWithinDeliveryRadius = distance !== null && distance <= maxDeliveryRadius;
  const estimatedTime = distance ? Math.round(15 + (distance * 3)) : null; // Base 15 min + 3 min per km

  const handleConfirm = () => {
    if (!currentLat || !currentLng) {
      setError("Please provide your delivery location");
      return;
    }
    if (!isWithinDeliveryRadius) {
      setError(`Sorry, ${venueName} only delivers within ${maxDeliveryRadius}km`);
      return;
    }
    if (!address.trim()) {
      setError("Please enter your delivery address");
      return;
    }
    onConfirm(address, currentLat, currentLng);
  };

  useEffect(() => {
    if (useCurrentLocation && !latitude && !loading) {
      requestLocation();
    }
  }, [useCurrentLocation]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Truck className="w-6 h-6" />
                <span className="font-bold text-lg">Delivery Address</span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Location Options */}
            <div className="flex gap-2">
              <Button
                variant={useCurrentLocation ? "default" : "outline"}
                className={`flex-1 ${useCurrentLocation ? "bg-primary" : ""}`}
                onClick={() => setUseCurrentLocation(true)}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Use My Location
              </Button>
              <Button
                variant={!useCurrentLocation ? "default" : "outline"}
                className={`flex-1 ${!useCurrentLocation ? "bg-primary" : ""}`}
                onClick={() => setUseCurrentLocation(false)}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Enter Address
              </Button>
            </div>

            {/* Current Location Status */}
            {useCurrentLocation && (
              <div className="bg-muted/50 rounded-xl p-3">
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Getting your location...
                  </div>
                ) : geoError ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {geoError}
                    <Button variant="link" size="sm" onClick={requestLocation}>
                      Retry
                    </Button>
                  </div>
                ) : latitude && longitude ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    Location detected
                  </div>
                ) : null}
              </div>
            )}

            {/* Address Input */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                {useCurrentLocation ? "Confirm your delivery address" : "Enter your delivery address"}
              </label>
              <Input
                placeholder="e.g., 123 Main St, Apt 4, Brisbane QLD 4000"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setError(null);
                }}
                className="bg-background"
              />
            </div>

            {/* Distance & Time Info */}
            {distance !== null && (
              <div className={`rounded-xl p-4 ${
                isWithinDeliveryRadius 
                  ? "bg-green-500/10 border border-green-500/30" 
                  : "bg-red-500/10 border border-red-500/30"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-5 h-5 ${isWithinDeliveryRadius ? "text-green-500" : "text-red-500"}`} />
                    <span className={isWithinDeliveryRadius ? "text-green-500" : "text-red-500"}>
                      {distance.toFixed(1)} km away
                    </span>
                  </div>
                  {isWithinDeliveryRadius && estimatedTime && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{estimatedTime}-{estimatedTime + 10} min</span>
                    </div>
                  )}
                </div>
                {!isWithinDeliveryRadius && (
                  <p className="text-red-400 text-sm mt-2">
                    Sorry, {venueName} only delivers within {maxDeliveryRadius}km. You're {(distance - maxDeliveryRadius).toFixed(1)}km too far.
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Confirm Button */}
            <Button
              onClick={handleConfirm}
              disabled={!isWithinDeliveryRadius || !address.trim() || (!currentLat || !currentLng)}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
            >
              {isWithinDeliveryRadius 
                ? `Confirm Delivery Location` 
                : distance 
                  ? "Outside Delivery Area"
                  : "Enter Address"
              }
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
