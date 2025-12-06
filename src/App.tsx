import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth/AuthPage";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import POSLayout from "./components/POS/POSLayout";
import Dashboard from "./pages/POS/Dashboard";
import NewOrder from "./pages/POS/NewOrder";
import Kitchen from "./pages/POS/Kitchen";
import KitchenEnhanced from "./pages/POS/KitchenEnhanced";
import Orders from "./pages/POS/Orders";
import Menu from "./pages/POS/Menu";
import Inventory from "./pages/POS/Inventory";
import Tables from "./pages/POS/Tables";
import Sales from "./pages/POS/Sales";
import Staff from "./pages/POS/Staff";
import Analytics from "./pages/POS/Analytics";
import Settings from "./pages/POS/Settings";
const FloorplanEditor = lazy(() => import("./pages/POS/FloorplanEditor"));
const KitchenDisplay = lazy(() => import("./pages/POS/KitchenDisplay"));
const StaffRoster = lazy(() => import("./pages/POS/StaffRoster"));
import CustomerLayout from "./components/Customer/CustomerLayout";
import Feed from "./pages/Customer/Feed";
import Discover from "./pages/Customer/Discover";
import Profile from "./pages/Customer/Profile";
import VenueDetail from "./pages/Customer/VenueDetail";
import Wallet from "./pages/Customer/Wallet";
const ImmersiveVenue = lazy(() => import("./pages/Customer/ImmersiveVenue"));

// Venue Management imports
import VenueLayout from "./components/Venue/VenueLayout";
import VenueHome from "./pages/Venue/VenueHome";
import VenueMenu from "./pages/Venue/VenueMenu";
import VenueOrders from "./pages/Venue/VenueOrders";
import VenueCredits from "./pages/Venue/VenueCredits";
import VenueAssign from "./pages/Venue/VenueAssign";
import VenueNotifications from "./pages/Venue/VenueNotifications";
import VenueMessages from "./pages/Venue/VenueMessages";
import VenueAccount from "./pages/Venue/VenueAccount";
import VenueSettings from "./pages/Venue/VenueSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          
          {/* Customer App Routes */}
          <Route path="/app/*" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Routes>
                  <Route path="feed" element={<Feed />} />
                  <Route path="discover" element={<Discover />} />
                  <Route path="venue/:id" element={<VenueDetail />} />
                  <Route path="venue/:id/immersive" element={
                    <Suspense fallback={<div className="p-8">Loading...</div>}>
                      <ImmersiveVenue venueName="The Electric Lounge" venueType="Nightclub" priceRange="$$" closingTime="2 AM" />
                    </Suspense>
                  } />
                  <Route path="profile" element={<Profile />} />
                  <Route path="wallet" element={<Wallet />} />
                  <Route path="*" element={<Feed />} />
                </Routes>
              </CustomerLayout>
            </ProtectedRoute>
          } />

          {/* Venue Management Routes - Protected */}
          <Route path="/venue/*" element={
            <ProtectedRoute>
              <VenueLayout>
                <Routes>
                  <Route path="home" element={<VenueHome />} />
                  <Route path="menu" element={<VenueMenu />} />
                  <Route path="orders" element={<VenueOrders />} />
                  <Route path="credits" element={<VenueCredits />} />
                  <Route path="assign" element={<VenueAssign />} />
                  <Route path="notifications" element={<VenueNotifications />} />
                  <Route path="messages" element={<VenueMessages />} />
                  <Route path="account" element={<VenueAccount />} />
                  <Route path="settings" element={<VenueSettings />} />
                  <Route path="*" element={<VenueHome />} />
                </Routes>
              </VenueLayout>
            </ProtectedRoute>
          } />
            
          {/* POS Routes - Protected */}
            <Route path="/venue/pos/*" element={
              <ProtectedRoute>
                <POSLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="new-order" element={<NewOrder />} />
                    <Route path="kitchen" element={<Kitchen />} />
                    <Route path="kitchen-enhanced" element={<KitchenEnhanced />} />
                    <Route path="kitchen-display" element={<Suspense fallback={<div className="p-8">Loading...</div>}><KitchenDisplay /></Suspense>} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="menu" element={<Menu />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="tables" element={<Tables />} />
                    <Route path="floorplan" element={<Suspense fallback={<div className="p-8">Loading Floorplan...</div>}><FloorplanEditor /></Suspense>} />
                    <Route path="sales" element={<Sales />} />
                    <Route path="staff" element={<Staff />} />
                    <Route path="staff-roster" element={<Suspense fallback={<div className="p-8">Loading...</div>}><StaffRoster /></Suspense>} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Dashboard />} />
                  </Routes>
                </POSLayout>
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
