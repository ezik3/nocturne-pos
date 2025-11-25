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
import CustomerLayout from "./components/Customer/CustomerLayout";
import Feed from "./pages/Customer/Feed";
import Discover from "./pages/Customer/Discover";
import Profile from "./pages/Customer/Profile";
import VenueDetail from "./pages/Customer/VenueDetail";
import Wallet from "./pages/Customer/Wallet";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<Index />} />
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
                  <Route path="profile" element={<Profile />} />
                  <Route path="wallet" element={<Wallet />} />
                  <Route path="*" element={<Feed />} />
                </Routes>
              </CustomerLayout>
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
                    <Route path="orders" element={<Orders />} />
                    <Route path="menu" element={<Menu />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="tables" element={<Tables />} />
                    <Route path="floorplan" element={<Suspense fallback={<div className="p-8">Loading Floorplan...</div>}><FloorplanEditor /></Suspense>} />
                    <Route path="sales" element={<Sales />} />
                    <Route path="staff" element={<Staff />} />
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
