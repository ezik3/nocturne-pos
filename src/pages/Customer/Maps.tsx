import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDriverSystem } from '@/hooks/useDriverSystem';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Navigation, Car, Bike, Package, MapPin, Clock, DollarSign, 
  Star, Play, Square, Search, X, User, CheckCircle2
} from 'lucide-react';
import Web3FeedHeader from '@/components/Customer/Feed/Web3FeedHeader';

// Mapbox token from env or fallback
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || 'pk.your_token_here';

const Maps = () => {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const {
    isDriver,
    driverProfile,
    activeShift,
    activeOrder,
    registerAsDriver,
    startShift,
    endShift,
    updateLocation,
    bookRide,
    calculateDistance,
  } = useDriverSystem();

  const [activeTab, setActiveTab] = useState<'explore' | 'ride' | 'driver'>('explore');
  const [showDriverSignup, setShowDriverSignup] = useState(false);
  const [showRideBooking, setShowRideBooking] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  
  // Driver signup form
  const [licenseId, setLicenseId] = useState('');
  const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle' | 'bicycle'>('car');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  // Ride booking form
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [153.0251, -27.4698], // Brisbane default
      zoom: 13,
      pitch: 45,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-right');

    // Get user location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        map.current?.flyTo({ center: [longitude, latitude], zoom: 14 });
        
        // Add user marker
        new mapboxgl.Marker({ color: '#00FFFF' })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML('<strong>You are here</strong>'))
          .addTo(map.current!);
      },
      () => {
        toast.error('Could not get your location');
      }
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Track driver location when on shift
  useEffect(() => {
    if (!activeShift || !driverProfile?.is_available) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updateLocation(latitude, longitude);
      },
      null,
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeShift, driverProfile?.is_available, updateLocation]);

  // Handle driver registration
  const handleDriverSignup = async () => {
    if (!licenseId) {
      toast.error('Please enter your driver\'s license ID');
      return;
    }

    const result = await registerAsDriver(licenseId, vehicleType, {
      make: vehicleMake,
      model: vehicleModel,
      plate: vehiclePlate,
    });

    if (result.success) {
      setShowDriverSignup(false);
      setLicenseId('');
      setVehicleMake('');
      setVehicleModel('');
      setVehiclePlate('');
    }
  };

  // Handle ride booking
  const handleBookRide = async () => {
    if (!pickupAddress || !destinationAddress) {
      toast.error('Please enter pickup and destination');
      return;
    }

    // For demo, use user's location as pickup
    if (!userLocation) {
      toast.error('Could not determine your location');
      return;
    }

    // Mock destination coordinates (in real app, would geocode the address)
    const mockDestination = {
      latitude: userLocation.lat + 0.02,
      longitude: userLocation.lng + 0.02,
    };

    const result = await bookRide(
      { address: pickupAddress, latitude: userLocation.lat, longitude: userLocation.lng },
      { address: destinationAddress, latitude: mockDestination.latitude, longitude: mockDestination.longitude }
    );

    if (result.success) {
      setShowRideBooking(false);
      setTrackingOrder(result.booking);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Web3FeedHeader />

      {/* Map Container */}
      <div ref={mapContainer} className="fixed inset-0 top-14 z-0" />

      {/* Overlay Controls */}
      <div className="fixed top-20 left-4 right-4 z-10">
        {/* Tab Navigation */}
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-1 border border-white/10 inline-flex">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'explore' 
                ? 'bg-gradient-to-r from-cyan to-purple text-white' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            Explore
          </button>
          <button
            onClick={() => setActiveTab('ride')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'ride' 
                ? 'bg-gradient-to-r from-cyan to-purple text-white' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4 inline mr-2" />
            Book Ride
          </button>
          <button
            onClick={() => setActiveTab('driver')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'driver' 
                ? 'bg-gradient-to-r from-cyan to-purple text-white' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4 inline mr-2" />
            Driver
          </button>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="bg-gradient-to-t from-black via-black/95 to-transparent pt-10 pb-6 px-4">
          
          {/* Ride Tab Content */}
          {activeTab === 'ride' && (
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                  <Car className="w-5 h-5 text-cyan" />
                  JV Ride
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Book a ride for just <span className="text-cyan font-bold">$0.10</span> platform fee. Drivers keep 100%!
                </p>
                <Button
                  onClick={() => setShowRideBooking(true)}
                  className="w-full bg-gradient-to-r from-cyan to-purple hover:opacity-90"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Book a Ride
                </Button>
              </div>

              {/* Active Ride Tracking */}
              {trackingOrder && (
                <div className="bg-gradient-to-r from-green-500/20 to-cyan/20 backdrop-blur-xl rounded-2xl p-4 border border-green-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-green-400 animate-pulse" />
                      Finding Driver...
                    </h4>
                    <span className="text-green-400 text-sm">Live</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-white/80">
                      <span className="text-white/50">To:</span> {trackingOrder.destination_address}
                    </p>
                    <p className="text-white/80">
                      <span className="text-white/50">Est. Fare:</span> ${trackingOrder.estimated_fare?.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Driver Tab Content */}
          {activeTab === 'driver' && (
            <div className="space-y-4">
              {!isDriver ? (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-purple" />
                    Become a JV Driver
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    Keep 100% of your earnings! We only charge venues $0.10 per order.
                  </p>
                  <Button
                    onClick={() => setShowDriverSignup(true)}
                    className="w-full bg-gradient-to-r from-purple to-pink hover:opacity-90"
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Sign Up to Drive
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Driver Stats */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          driverProfile?.is_available 
                            ? 'bg-green-500/20 ring-2 ring-green-500' 
                            : 'bg-white/10'
                        }`}>
                          <Car className={`w-6 h-6 ${driverProfile?.is_available ? 'text-green-400' : 'text-white/50'}`} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">Driver Mode</h4>
                          <p className="text-white/50 text-sm">
                            {driverProfile?.is_available ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-bold">{driverProfile?.average_rating?.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-black/30 rounded-xl p-3 text-center">
                        <Package className="w-5 h-5 text-cyan mx-auto mb-1" />
                        <p className="text-white font-bold">{driverProfile?.total_deliveries}</p>
                        <p className="text-white/50 text-xs">Deliveries</p>
                      </div>
                      <div className="bg-black/30 rounded-xl p-3 text-center">
                        <Car className="w-5 h-5 text-purple mx-auto mb-1" />
                        <p className="text-white font-bold">{driverProfile?.total_rides}</p>
                        <p className="text-white/50 text-xs">Rides</p>
                      </div>
                    </div>

                    {!activeShift ? (
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => startShift('delivery')}
                          size="sm"
                          className="bg-cyan/20 hover:bg-cyan/30 text-cyan border border-cyan/30"
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Delivery
                        </Button>
                        <Button
                          onClick={() => startShift('ride')}
                          size="sm"
                          className="bg-purple/20 hover:bg-purple/30 text-purple border border-purple/30"
                        >
                          <Car className="w-4 h-4 mr-1" />
                          Rides
                        </Button>
                        <Button
                          onClick={() => startShift('both')}
                          size="sm"
                          className="bg-gradient-to-r from-cyan to-purple hover:opacity-90"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Both
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-green-500/20 rounded-xl p-3 border border-green-500/30">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-400 font-medium">
                              Active: {activeShift.shift_type === 'both' ? 'Delivery & Rides' : activeShift.shift_type}
                            </span>
                          </div>
                          <span className="text-white/50 text-sm">
                            ${activeShift.earnings.toFixed(2)} earned
                          </span>
                        </div>
                        <Button
                          onClick={endShift}
                          variant="outline"
                          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          End Shift
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Explore Tab Content */}
          {activeTab === 'explore' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  placeholder="Search venues, cities..."
                  className="pl-10 bg-black/50 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Driver Signup Modal */}
      <Dialog open={showDriverSignup} onOpenChange={setShowDriverSignup}>
        <DialogContent className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">
              Become a JV Driver
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-500/10 to-cyan/10 rounded-xl p-4 border border-green-500/20">
              <h4 className="text-white font-bold mb-2">Why Drive with JV?</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>✓ Keep 100% of your earnings</li>
                <li>✓ $0 platform fees for drivers</li>
                <li>✓ Instant JVC payouts</li>
                <li>✓ Delivery + Rides in one app</li>
              </ul>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Driver's License ID *</label>
              <Input
                value={licenseId}
                onChange={(e) => setLicenseId(e.target.value)}
                placeholder="Enter your license number"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Vehicle Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'car', icon: Car, label: 'Car' },
                  { type: 'motorcycle', icon: Bike, label: 'Motorcycle' },
                  { type: 'bicycle', icon: Bike, label: 'Bicycle' },
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setVehicleType(type as any)}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                      vehicleType === type
                        ? 'bg-cyan/20 border-cyan text-cyan'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {vehicleType !== 'bicycle' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Make</label>
                    <Input
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      placeholder="Toyota"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Model</label>
                    <Input
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Camry"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-1 block">License Plate</label>
                  <Input
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="ABC123"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </>
            )}

            <Button
              onClick={handleDriverSignup}
              className="w-full bg-gradient-to-r from-cyan to-purple hover:opacity-90"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Registration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ride Booking Modal */}
      <Dialog open={showRideBooking} onOpenChange={setShowRideBooking}>
        <DialogContent className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">
              Book a JV Ride
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-cyan/10 to-purple/10 rounded-xl p-4 border border-cyan/20">
              <p className="text-white/80 text-sm">
                Platform fee: Only <span className="text-cyan font-bold">$0.10</span>
                <br />
                <span className="text-white/50">Drivers keep 100% of the fare!</span>
              </p>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                Pickup Location
              </label>
              <Input
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Current location or enter address"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                Destination
              </label>
              <Input
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="Where are you going?"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <Button
              onClick={handleBookRide}
              className="w-full bg-gradient-to-r from-cyan to-purple hover:opacity-90"
            >
              <Car className="w-4 h-4 mr-2" />
              Find Driver
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Maps;
