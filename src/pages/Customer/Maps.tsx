import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDriverSystem } from '@/hooks/useDriverSystem';
import { useDeliveryFee } from '@/hooks/useDeliveryFee';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { 
  Navigation, Car, Bike, Package, MapPin, Clock, DollarSign, 
  Star, Play, Square, Search, X, User, CheckCircle2, ChevronUp,
  ChevronDown, TrendingUp, Calendar, Wallet, Route, Users, Gift, Navigation2
} from 'lucide-react';
import Web3FeedHeader from '@/components/Customer/Feed/Web3FeedHeader';

// Mapbox token from env or fallback
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || 'pk.your_token_here';

// Platform fee constant
const PLATFORM_FEE = 0.10;

const Maps = () => {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { calculateRideFare } = useDeliveryFee();
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
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [fareEstimate, setFareEstimate] = useState<{ fare: number; distance: number; duration: number; driverEarnings: number; platformFee: number } | null>(null);
  const [isForFriend, setIsForFriend] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');
  const [friendSuggestions, setFriendSuggestions] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

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
      style: 'mapbox://styles/mapbox/navigation-night-v1', // Colorful night style with roads highlighted
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

  // Geocoding search function using Mapbox
  const searchAddresses = useCallback(async (query: string, proximity?: { lat: number; lng: number }) => {
    if (!query || query.length < 3) return [];
    
    try {
      const proximityParam = proximity 
        ? `&proximity=${proximity.lng},${proximity.lat}` 
        : userLocation 
          ? `&proximity=${userLocation.lng},${userLocation.lat}` 
          : '';
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5${proximityParam}&types=address,poi`
      );
      const data = await response.json();
      return data.features || [];
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }, [userLocation]);

  // Handle pickup address search
  const handlePickupSearch = useCallback(async (value: string) => {
    setPickupAddress(value);
    if (value.length >= 3) {
      const results = await searchAddresses(value);
      setPickupSuggestions(results);
      setShowPickupSuggestions(true);
    } else {
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
    }
  }, [searchAddresses]);

  // Handle destination address search
  const handleDestinationSearch = useCallback(async (value: string) => {
    setDestinationAddress(value);
    if (value.length >= 3) {
      const results = await searchAddresses(value);
      setDestinationSuggestions(results);
      setShowDestinationSuggestions(true);
    } else {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
    }
  }, [searchAddresses]);

  // Select pickup suggestion
  const selectPickupSuggestion = (suggestion: any) => {
    setPickupAddress(suggestion.place_name);
    setPickupCoords({ lat: suggestion.center[1], lng: suggestion.center[0] });
    setShowPickupSuggestions(false);
    calculateFareEstimateFromRoute(
      { lat: suggestion.center[1], lng: suggestion.center[0] },
      destinationCoords
    );
  };

  // Select destination suggestion
  const selectDestinationSuggestion = (suggestion: any) => {
    setDestinationAddress(suggestion.place_name);
    setDestinationCoords({ lat: suggestion.center[1], lng: suggestion.center[0] });
    setShowDestinationSuggestions(false);
    calculateFareEstimateFromRoute(pickupCoords, { lat: suggestion.center[1], lng: suggestion.center[0] });
  };

  // Calculate fare estimate using real Mapbox directions API
  const calculateFareEstimateFromRoute = async (
    pickup: { lat: number; lng: number } | null,
    destination: { lat: number; lng: number } | null
  ) => {
    if (!pickup || !destination) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const distanceKm = route.distance / 1000;
        const durationMin = Math.round(route.duration / 60);
        
        // Use the hook's fare calculation for consistency
        const fareCalc = calculateRideFare(distanceKm, durationMin);
        
        setFareEstimate({
          fare: fareCalc.fare,
          distance: Math.round(distanceKm * 10) / 10,
          duration: durationMin,
          driverEarnings: fareCalc.driverEarnings,
          platformFee: fareCalc.platformFee,
        });
      }
    } catch (error) {
      console.error('Route calculation error:', error);
    }
  };

  // Use current location for pickup
  const useCurrentLocationForPickup = () => {
    if (userLocation) {
      setPickupCoords(userLocation);
      // Reverse geocode to get address
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${userLocation.lng},${userLocation.lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      )
        .then(res => res.json())
        .then(data => {
          if (data.features && data.features[0]) {
            setPickupAddress(data.features[0].place_name);
          } else {
            setPickupAddress('Current Location');
          }
        });
    }
  };

  // Search friends for ride booking
  const handleFriendSearch = useCallback(async (value: string) => {
    setFriendSearch(value);
    if (value.length >= 2) {
      // Mock friends data - in production would search customer_profiles
      const mockFriends = [
        { id: '1', display_name: 'Sarah Johnson', avatar_url: 'https://randomuser.me/api/portraits/women/32.jpg' },
        { id: '2', display_name: 'Mike Chen', avatar_url: 'https://randomuser.me/api/portraits/men/45.jpg' },
        { id: '3', display_name: 'Emma Williams', avatar_url: 'https://randomuser.me/api/portraits/women/67.jpg' },
        { id: '4', display_name: 'David Brown', avatar_url: 'https://randomuser.me/api/portraits/men/22.jpg' },
      ].filter(f => f.display_name.toLowerCase().includes(value.toLowerCase()));
      setFriendSuggestions(mockFriends);
    } else {
      setFriendSuggestions([]);
    }
  }, []);

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

    const pickup = pickupCoords || userLocation;
    const destination = destinationCoords;

    if (!pickup) {
      toast.error('Could not determine pickup location');
      return;
    }

    if (!destination) {
      toast.error('Could not determine destination');
      return;
    }

    const result = await bookRide(
      { address: pickupAddress, latitude: pickup.lat, longitude: pickup.lng },
      { address: destinationAddress, latitude: destination.lat, longitude: destination.lng }
    );

    if (result.success) {
      setShowRideBooking(false);
      setTrackingOrder(result.booking);
      setFareEstimate(null);
      setSelectedFriend(null);
      setIsForFriend(false);
      
      // Display route on map
      displayRoute(
        [pickup.lng, pickup.lat],
        [destination.lng, destination.lat]
      );
      
      if (isForFriend && selectedFriend) {
        toast.success(`Ride booked for ${selectedFriend.display_name}!`);
      }
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
                    Drivers keep <span className="text-cyan font-bold">100%</span> of fares!
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
        <DialogContent className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">
              Book a JV Ride
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Book for friend toggle - Switch style */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isForFriend ? 'bg-pink-500' : 'bg-white/10'
                }`}>
                  <Gift className={`w-5 h-5 ${isForFriend ? 'text-white' : 'text-pink-400'}`} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">Book for a Friend</p>
                  <p className="text-xs text-white/50">Send a ride to someone else</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsForFriend(!isForFriend);
                  setSelectedFriend(null);
                  setFriendSearch('');
                }}
                className={`relative w-14 h-7 rounded-full transition-all ${
                  isForFriend ? 'bg-pink-500' : 'bg-white/20'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all ${
                  isForFriend ? 'left-8' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Friend search */}
            {isForFriend && (
              <div className="relative">
                <label className="text-white/70 text-sm mb-1 block flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Search Friend
                </label>
                <Input
                  value={friendSearch}
                  onChange={(e) => handleFriendSearch(e.target.value)}
                  placeholder="Type a friend's name..."
                  className="bg-white/5 border-white/10 text-white"
                />
                {friendSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-white/20 rounded-xl overflow-hidden shadow-xl">
                    {friendSuggestions.map((friend) => (
                      <button
                        key={friend.id}
                        onClick={() => {
                          setSelectedFriend(friend);
                          setFriendSearch(friend.display_name);
                          setFriendSuggestions([]);
                        }}
                        className="w-full p-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                      >
                        <img src={friend.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                        <span className="text-white text-sm">{friend.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedFriend && (
                  <div className="mt-2 p-2 bg-pink-500/20 rounded-lg flex items-center gap-2 border border-pink-400/30">
                    <img src={selectedFriend.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                    <span className="text-pink-300 text-sm font-medium">{selectedFriend.display_name}</span>
                    <button 
                      onClick={() => {
                        setSelectedFriend(null);
                        setFriendSearch('');
                      }}
                      className="ml-auto p-1 hover:bg-white/10 rounded-full"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pickup Location with autocomplete */}
            <div className="relative">
              <label className="text-white/70 text-sm mb-1 block flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                Pickup Location
              </label>
              <div className="flex gap-2">
                <Input
                  value={pickupAddress}
                  onChange={(e) => handlePickupSearch(e.target.value)}
                  placeholder="Enter pickup address..."
                  className="bg-white/5 border-white/10 text-white flex-1"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={useCurrentLocationForPickup}
                  className="border-cyan/30 hover:bg-cyan/20"
                >
                  <Navigation2 className="w-4 h-4 text-cyan" />
                </Button>
              </div>
              {showPickupSuggestions && pickupSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-white/20 rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                  {pickupSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => selectPickupSuggestion(suggestion)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                    >
                      <MapPin className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white text-sm line-clamp-2">{suggestion.place_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination with autocomplete */}
            <div className="relative">
              <label className="text-white/70 text-sm mb-1 block flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                Destination
              </label>
              <Input
                value={destinationAddress}
                onChange={(e) => handleDestinationSearch(e.target.value)}
                placeholder="Where are you going?"
                className="bg-white/5 border-white/10 text-white"
              />
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-white/20 rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                  {destinationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => selectDestinationSuggestion(suggestion)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                    >
                      <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-white text-sm line-clamp-2">{suggestion.place_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fare Estimate */}
            {fareEstimate && (
              <div className="bg-gradient-to-r from-cyan/10 to-purple/10 rounded-xl p-4 border border-cyan/20">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Fare Estimate
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-white/50 text-xs">Fare</p>
                    <p className="text-green-400 font-bold text-lg">${fareEstimate.fare.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs">Distance</p>
                    <p className="text-cyan font-bold text-lg">{fareEstimate.distance} km</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs">Duration</p>
                    <p className="text-purple font-bold text-lg">{fareEstimate.duration} min</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-xs text-white/50">
                    <span>+ ${fareEstimate.platformFee.toFixed(2)} platform fee</span>
                    <span>Driver receives: <span className="text-green-400 font-medium">${fareEstimate.driverEarnings.toFixed(2)}</span></span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleBookRide}
              disabled={!pickupAddress || !destinationAddress || (isForFriend && !selectedFriend)}
              className="w-full bg-gradient-to-r from-cyan to-purple hover:opacity-90 disabled:opacity-50"
            >
              <Car className="w-4 h-4 mr-2" />
              {isForFriend && selectedFriend ? `Send Ride to ${selectedFriend.display_name}` : 'Find Driver'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Maps;
