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
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { 
  Navigation, Car, Bike, Package, MapPin, Clock, DollarSign, 
  Star, Play, Square, Search, X, User, CheckCircle2, ChevronUp,
  ChevronDown, TrendingUp, Calendar, Wallet, Route
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
  const [showEarningsPopup, setShowEarningsPopup] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [driverPanelExpanded, setDriverPanelExpanded] = useState(true);
  
  // Mock earnings data (in production, fetch from database)
  const [earnings, setEarnings] = useState({
    lastDrive: 12.50,
    currentShift: 0,
    today: 45.00,
    thisWeek: 312.75,
    thisMonth: 1250.00,
  });
  
  // Driver signup form
  const [licenseId, setLicenseId] = useState('');
  const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle' | 'bicycle'>('car');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  // Ride booking form
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  // Route visualization
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);

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
    
    // Create geolocate control and store ref
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    });
    geolocateControlRef.current = geolocateControl;
    map.current.addControl(geolocateControl, 'top-right');

    // Auto-trigger geolocation when map loads
    map.current.on('load', () => {
      if (!map.current) return;
      setMapLoaded(true);
      
      // Trigger geolocation automatically
      setTimeout(() => {
        geolocateControl.trigger();
      }, 500);
      
      // Add route source
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      // Add route layer with gradient
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#00FFFF',
          'line-width': 6,
          'line-opacity': 0.8
        }
      });

      // Add route outline for better visibility
      map.current.addLayer({
        id: 'route-outline',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#8B5CF6',
          'line-width': 10,
          'line-opacity': 0.4
        }
      }, 'route');
    });

    // Get user location and add marker
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
      (error) => {
        console.log('Geolocation error:', error);
        toast.error('Could not get your location - using default');
      }
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Function to fetch and display route
  const displayRoute = useCallback(async (start: [number, number], end: [number, number]) => {
    if (!map.current) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;
        
        setRouteCoordinates(coordinates);

        // Update route on map
        const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          });
        }

        // Add destination marker
        new mapboxgl.Marker({ color: '#EF4444' })
          .setLngLat(end)
          .setPopup(new mapboxgl.Popup().setHTML('<strong>Destination</strong>'))
          .addTo(map.current);

        // Fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
        map.current.fitBounds(bounds, { padding: 100 });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
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

  // Update shift earnings when shift changes
  useEffect(() => {
    if (activeShift) {
      setEarnings(prev => ({
        ...prev,
        currentShift: activeShift.earnings || 0
      }));
    }
  }, [activeShift]);

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
      
      // Display route on map
      displayRoute(
        [userLocation.lng, userLocation.lat],
        [mockDestination.longitude, mockDestination.latitude]
      );
    }
  };

  // Handle panel drag
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 50) {
      setDriverPanelExpanded(false);
    } else if (info.offset.y < -50) {
      setDriverPanelExpanded(true);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Web3FeedHeader />

      {/* Map Container - Full screen with explicit dimensions */}
      <div 
        ref={mapContainer} 
        className="fixed inset-0 top-14 z-0 w-full"
        style={{ height: 'calc(100vh - 56px)' }}
      />
      
      {/* Loading Indicator */}
      {!mapLoaded && (
        <div className="fixed inset-0 top-14 z-5 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-cyan/30 border-t-cyan rounded-full animate-spin" />
            <span className="text-white/70 text-sm">Loading map...</span>
          </div>
        </div>
      )}

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

      {/* Bottom Panel - Swipeable for Driver */}
      <AnimatePresence>
        <motion.div 
          className="fixed bottom-0 left-0 right-0 z-20"
          initial={false}
          animate={{ 
            y: activeTab === 'driver' && !driverPanelExpanded ? 200 : 0 
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Drag Handle for Driver Tab */}
          {activeTab === 'driver' && isDriver && (
            <div 
              className="flex justify-center py-2 cursor-grab active:cursor-grabbing"
              onClick={() => setDriverPanelExpanded(!driverPanelExpanded)}
            >
              <motion.div 
                className="w-12 h-1.5 bg-white/30 rounded-full"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={handleDragEnd}
              />
            </div>
          )}

          <div className="bg-gradient-to-t from-black via-black/95 to-transparent pt-6 pb-6 px-4">
            
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
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <Route className="w-4 h-4" />
                        Route Active
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-white/80">
                        <span className="text-white/50">To:</span> {trackingOrder.destination_address}
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/50">Est. Fare:</span> ${trackingOrder.estimated_fare?.toFixed(2)}
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/50">Distance:</span> {trackingOrder.distance_km?.toFixed(1)} km
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
                  <motion.div 
                    className="space-y-4"
                    animate={{ opacity: driverPanelExpanded ? 1 : 0.5 }}
                  >
                    {/* Driver Stats with Earnings */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                      {/* Header with toggle */}
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
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setShowEarningsPopup(true)}
                            className="flex items-center gap-1 bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
                          >
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-bold text-sm">
                              ${earnings.currentShift.toFixed(2)}
                            </span>
                          </button>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-white font-bold">{driverProfile?.average_rating?.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
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

                      {/* Quick Earnings Display */}
                      {activeShift && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-black/30 rounded-lg p-2 text-center">
                            <p className="text-white/50 text-xs">Last Drive</p>
                            <p className="text-green-400 font-bold text-sm">${earnings.lastDrive.toFixed(2)}</p>
                          </div>
                          <div className="bg-black/30 rounded-lg p-2 text-center">
                            <p className="text-white/50 text-xs">This Shift</p>
                            <p className="text-cyan font-bold text-sm">${earnings.currentShift.toFixed(2)}</p>
                          </div>
                          <div className="bg-black/30 rounded-lg p-2 text-center">
                            <p className="text-white/50 text-xs">This Week</p>
                            <p className="text-purple font-bold text-sm">${earnings.thisWeek.toFixed(2)}</p>
                          </div>
                        </div>
                      )}

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
                            <span className="text-green-400 text-sm font-bold">
                              ${activeShift.earnings?.toFixed(2) || '0.00'} earned
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

                    {/* Collapse indicator */}
                    <button 
                      onClick={() => setDriverPanelExpanded(!driverPanelExpanded)}
                      className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white/60 transition-colors py-1"
                    >
                      {driverPanelExpanded ? (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span className="text-xs">Swipe down for full map</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span className="text-xs">Swipe up for driver panel</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.div>
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
        </motion.div>
      </AnimatePresence>

      {/* Earnings Popup Modal */}
      <Dialog open={showEarningsPopup} onOpenChange={setShowEarningsPopup}>
        <DialogContent className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan bg-clip-text text-transparent flex items-center gap-2">
              <Wallet className="w-6 h-6 text-green-400" />
              Your Earnings
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Total Earnings Card */}
            <div className="bg-gradient-to-r from-green-500/20 to-cyan/20 rounded-2xl p-6 border border-green-500/30 text-center">
              <p className="text-white/60 text-sm mb-1">Total This Month</p>
              <p className="text-4xl font-bold text-white">${earnings.thisMonth.toFixed(2)}</p>
              <div className="flex items-center justify-center gap-1 mt-2 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+15% from last month</span>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-cyan" />
                  </div>
                  <span className="text-white/60 text-sm">Last Drive</span>
                </div>
                <p className="text-white font-bold text-xl">${earnings.lastDrive.toFixed(2)}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-white/60 text-sm">This Shift</span>
                </div>
                <p className="text-white font-bold text-xl">${earnings.currentShift.toFixed(2)}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple" />
                  </div>
                  <span className="text-white/60 text-sm">Today</span>
                </div>
                <p className="text-white font-bold text-xl">${earnings.today.toFixed(2)}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-white/60 text-sm">This Week</span>
                </div>
                <p className="text-white font-bold text-xl">${earnings.thisWeek.toFixed(2)}</p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-bold mb-3">Performance</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-white/50 text-xs">Deliveries</p>
                  <p className="text-cyan font-bold">{driverProfile?.total_deliveries || 0}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs">Rides</p>
                  <p className="text-purple font-bold">{driverProfile?.total_rides || 0}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs">Rating</p>
                  <p className="text-yellow-400 font-bold flex items-center justify-center gap-1">
                    <Star className="w-3 h-3" />
                    {driverProfile?.average_rating?.toFixed(1) || '5.0'}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowEarningsPopup(false)}
              className="w-full bg-gradient-to-r from-cyan to-purple hover:opacity-90"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
