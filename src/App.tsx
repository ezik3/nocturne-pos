import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth/AuthPage";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import UserVerifyEmail from "./pages/Auth/User/VerifyEmail";
import UserVerifyPhone from "./pages/Auth/User/VerifyPhone";
import UserIDVerification from "./pages/Auth/User/IDVerification";
import UserFacialRecognition from "./pages/Auth/User/FacialRecognition";
import UserPrivateKeyGeneration from "./pages/Auth/User/PrivateKeyGeneration";
import UserProfileSetup from "./pages/Auth/User/ProfileSetup";
import VenueSignup from "./pages/Auth/Venue/Signup";
import VenueVerifyEmail from "./pages/Auth/Venue/VerifyEmail";
import VenueVerifyPhone from "./pages/Auth/Venue/VerifyPhone";
import VenueIDVerification from "./pages/Auth/Venue/IDVerification";
import VenueFacialRecognition from "./pages/Auth/Venue/FacialRecognition";
import VenuePrivateKeyGeneration from "./pages/Auth/Venue/PrivateKeyGeneration";
import VenueProfileSetup from "./pages/Auth/Venue/ProfileSetup";
import VenuePendingApproval from "./pages/Auth/Venue/PendingApproval";
import VenueProtectedRoute from "./components/Venue/VenueProtectedRoute";
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
const EmployeeLogin = lazy(() => import("./pages/POS/EmployeeLogin"));
import CustomerLayout from "./components/Customer/CustomerLayout";
import DiscoverNew from "./pages/Customer/DiscoverNew";
import ProfileNew from "./pages/Customer/ProfileNew";
import Wallet from "./pages/Customer/Wallet";
import CityView from "./pages/Customer/CityView";
import PublicPostView from "./pages/Customer/PublicPostView";
import Top10 from "./pages/Customer/Top10";
import Notifications from "./pages/Customer/Notifications";
const ImmersiveVenue = lazy(() => import("./pages/Customer/ImmersiveVenue"));
const ImmersiveFeed = lazy(() => import("./pages/Customer/ImmersiveFeed"));
const Maps = lazy(() => import("./pages/Customer/Maps"));

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

// Admin imports
import AdminLayout from "./components/Admin/AdminLayout";
import AdminProtectedRoute from "./components/Admin/AdminProtectedRoute";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboardPage from "./pages/Admin/AdminDashboard";
import AdminUsersPage from "./pages/Admin/AdminUsers";
import AdminVenuesPage from "./pages/Admin/AdminVenues";
import AdminTreasuryPage from "./pages/Admin/AdminTreasury";
import AdminMintBurnPage from "./pages/Admin/AdminMintBurn";
import AdminTransactionsPage from "./pages/Admin/AdminTransactions";
import AdminDepositsPage from "./pages/Admin/AdminDeposits";
import AdminWithdrawalsPage from "./pages/Admin/AdminWithdrawals";
import AdminWalletFreezesPage from "./pages/Admin/AdminWalletFreezes";
import AdminAuditLogPage from "./pages/Admin/AdminAuditLog";
import AdminRolesPage from "./pages/Admin/AdminRoles";
import AdminSettingsPage from "./pages/Admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          
          {/* User Registration Flow */}
          <Route path="/user/verify-email" element={<UserVerifyEmail />} />
          <Route path="/user/verify-phone" element={<UserVerifyPhone />} />
          <Route path="/user/id-verification" element={<UserIDVerification />} />
          <Route path="/user/facial-recognition" element={<UserFacialRecognition />} />
          <Route path="/user/private-key" element={<UserPrivateKeyGeneration />} />
          <Route path="/user/profile-setup" element={<UserProfileSetup />} />
          
          {/* Venue Registration Flow */}
          <Route path="/venue/signup" element={<VenueSignup />} />
          <Route path="/venue/verify-email" element={<VenueVerifyEmail />} />
          <Route path="/venue/verify-phone" element={<VenueVerifyPhone />} />
          <Route path="/venue/id-verification" element={<VenueIDVerification />} />
          <Route path="/venue/facial-recognition" element={<VenueFacialRecognition />} />
          <Route path="/venue/private-key" element={<VenuePrivateKeyGeneration />} />
          <Route path="/venue/profile-setup" element={<VenueProfileSetup />} />
          <Route path="/venue/pending-approval" element={<VenuePendingApproval />} />
          
          {/* Customer App Routes */}
          <Route path="/app/feed/immersive" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
                  <ImmersiveFeed />
                </Suspense>
              </CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/app/venue/:id" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
                  <ImmersiveVenue />
                </Suspense>
              </CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/app/city-view" element={
            <ProtectedRoute>
              <CustomerLayout>
                <CityView />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/app/public-post" element={
            <ProtectedRoute>
              <CustomerLayout>
                <PublicPostView />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/app/top10" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Top10 />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/app/venues" element={
            <ProtectedRoute>
              <CustomerLayout>
                <DiscoverNew />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/app/profile" element={
            <ProtectedRoute>
              <CustomerLayout>
                <ProfileNew />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/app/wallet" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Wallet />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/app/messages" element={
            <ProtectedRoute>
              <CustomerLayout>
                <div className="min-h-screen bg-black p-8 text-white">Messages Coming Soon</div>
              </CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/app/notifications" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Notifications />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/app/maps" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Maps...</div>}>
                  <Maps />
                </Suspense>
              </CustomerLayout>
            </ProtectedRoute>
          } />

          {/* Venue Management Routes - Protected */}
          <Route path="/venue/home" element={
            <VenueProtectedRoute>
              <VenueLayout>
                <VenueHome />
              </VenueLayout>
            </VenueProtectedRoute>
          } />
          <Route path="/venue/menu" element={
            <VenueProtectedRoute>
              <VenueLayout>
                <VenueMenu />
              </VenueLayout>
            </VenueProtectedRoute>
          } />
          <Route path="/venue/orders" element={
            <VenueProtectedRoute>
              <VenueLayout>
                <VenueOrders />
              </VenueLayout>
            </VenueProtectedRoute>
          } />
          <Route path="/venue/credits" element={
            <VenueProtectedRoute>
              <VenueLayout>
                <VenueCredits />
              </VenueLayout>
            </VenueProtectedRoute>
          } />
          <Route path="/venue/assign" element={
            <VenueProtectedRoute>
              <VenueLayout>
                <VenueAssign />
              </VenueLayout>
            </VenueProtectedRoute>
          } />
          <Route path="/venue/notifications" element={
            <VenueProtectedRoute>
              <VenueLayout>
                <VenueNotifications />
              </VenueLayout>
            </VenueProtectedRoute>
          } />
          <Route path="/venue/messages" element={
            <VenueProtectedRoute>
              <VenueLayout>
                <VenueMessages />
              </VenueLayout>
            </VenueProtectedRoute>
          } />
          <Route path="/venue/account" element={
            <VenueProtectedRoute>
              <VenueLayout>
                <VenueAccount />
              </VenueLayout>
            </VenueProtectedRoute>
          } />
          <Route path="/venue/settings" element={
            <VenueProtectedRoute>
              <VenueLayout>
                <VenueSettings />
              </VenueLayout>
            </VenueProtectedRoute>
          } />
          
          {/* Employee Work Mode Login */}
          <Route path="/venue/pos/login" element={
            <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
              <EmployeeLogin />
            </Suspense>
          } />
            
          {/* POS Routes - Protected */}
          <Route path="/venue/pos/dashboard" element={
            <ProtectedRoute>
              <POSLayout>
                <Dashboard />
              </POSLayout>
            </ProtectedRoute>
          } />
          <Route path="/venue/pos/new-order" element={
            <ProtectedRoute>
              <POSLayout>
                <NewOrder />
              </POSLayout>
            </ProtectedRoute>
          } />
          <Route path="/venue/pos/kitchen" element={
            <ProtectedRoute>
              <POSLayout>
                <Kitchen />
              </POSLayout>
            </ProtectedRoute>
          } />
          <Route path="/venue/pos/orders" element={
            <ProtectedRoute>
              <POSLayout>
                <Orders />
              </POSLayout>
            </ProtectedRoute>
          } />
          <Route path="/venue/pos/menu" element={
            <ProtectedRoute>
              <POSLayout>
                <Menu />
              </POSLayout>
            </ProtectedRoute>
          } />
          <Route path="/venue/pos/inventory" element={
            <ProtectedRoute>
              <POSLayout>
                <Inventory />
              </POSLayout>
            </ProtectedRoute>
          } />
          <Route path="/venue/pos/tables" element={
            <ProtectedRoute>
              <POSLayout>
                <Tables />
              </POSLayout>
            </ProtectedRoute>
          } />
          <Route path="/venue/pos/floorplan" element={
            <ProtectedRoute>
              <POSLayout>
                <Suspense fallback={<div className="p-8">Loading Floorplan...</div>}>
                  <FloorplanEditor />
                </Suspense>
              </POSLayout>
            </ProtectedRoute>
          } />
          <Route path="/venue/pos/sales" element={
            <ProtectedRoute>
              <POSLayout>
                <Sales />
              </POSLayout>
            </ProtectedRoute>
          } />
          <Route path="/venue/pos/staff" element={
            <ProtectedRoute>
              <POSLayout>
                <Staff />
              </POSLayout>
            </ProtectedRoute>
          } />
          <Route path="/venue/pos/analytics" element={
            <ProtectedRoute>
              <POSLayout>
                <Analytics />
              </POSLayout>
            </ProtectedRoute>
          } />
          <Route path="/venue/pos/settings" element={
            <ProtectedRoute>
              <POSLayout>
                <Settings />
              </POSLayout>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <Navigate to="/admin/dashboard" replace />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminLayout><AdminDashboardPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/users" element={<AdminProtectedRoute><AdminLayout><AdminUsersPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/venues" element={<AdminProtectedRoute><AdminLayout><AdminVenuesPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/treasury" element={<AdminProtectedRoute><AdminLayout><AdminTreasuryPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/mint-burn" element={<AdminProtectedRoute><AdminLayout><AdminMintBurnPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/transactions" element={<AdminProtectedRoute><AdminLayout><AdminTransactionsPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/deposits" element={<AdminProtectedRoute><AdminLayout><AdminDepositsPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/withdrawals" element={<AdminProtectedRoute><AdminLayout><AdminWithdrawalsPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/wallet-freezes" element={<AdminProtectedRoute><AdminLayout><AdminWalletFreezesPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/audit-log" element={<AdminProtectedRoute><AdminLayout><AdminAuditLogPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/roles" element={<AdminProtectedRoute><AdminLayout><AdminRolesPage /></AdminLayout></AdminProtectedRoute>} />
          <Route path="/admin/settings" element={<AdminProtectedRoute><AdminLayout><AdminSettingsPage /></AdminLayout></AdminProtectedRoute>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/app" element={<Navigate to="/app/feed/immersive" replace />} />
          <Route path="/app/feed" element={<Navigate to="/app/feed/immersive" replace />} />
          <Route path="/venue" element={<Navigate to="/venue/home" replace />} />
            
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;