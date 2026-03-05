import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { P2AuthProvider } from "@/contexts/P2AuthContext";
import { P2ProtectedRoute } from "@/components/p2/P2ProtectedRoute";
import Index from "./pages/Index";
import P2 from "./pages/P2";
import P2Login from "./pages/P2Login";
import P2Register from "./pages/P2Register";
import P2Mfa from "./pages/P2Mfa";
import P2DashboardLayout from "./pages/P2DashboardLayout";
import P2DashboardHome from "./pages/P2DashboardHome";
import { P2Cases, P2Graph } from "./pages/P2DashboardPlaceholders";
import P2ReportsPage from "./pages/P2ReportsPage";
import P2SettingsPage from "./pages/P2SettingsPage";
import P2Analytics from "./pages/P2Analytics";
import P2RiskQueue from "./pages/P2RiskQueue";
import P2CaseDetail from "./pages/P2CaseDetail";
import P2CaseGraph from "./pages/P2CaseGraph";
import Positions from "./pages/Positions";
import PositionDetail from "./pages/PositionDetail";
import Government from "./pages/Government";
import Platform from "./pages/Platform";
import Tanitim from "./pages/Tanitim";
import Huda from "./pages/Huda";
import P2Apply from "./pages/P2Apply";
import P2ApplyStatus from "./pages/P2ApplyStatus";
import P2Certificate from "./pages/P2Certificate";
import P2Verify from "./pages/P2Verify";
import P2ApplyDashboard from "./pages/P2ApplyDashboard";
import P2Support from "./pages/P2Support";
import P2AdminLayout from "./pages/P2AdminLayout";
import P2AdminDashboard from "./pages/P2AdminDashboard";
import { AdminUsers, AdminConsulates, AdminApi, AdminBilling, AdminConfig } from "./pages/P2AdminPlaceholders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <P2AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            {/* P2 entry - redirect to login */}
            <Route path="/p2" element={<P2ProtectedRoute><P2 /></P2ProtectedRoute>} />
            <Route path="/p2/login" element={<P2Login />} />
            <Route path="/p2/register" element={<P2Register />} />
            <Route path="/p2/auth/mfa" element={<P2Mfa />} />
            <Route path="/p2/apply" element={<P2Apply />} />
            <Route path="/p2/apply/status/:id" element={<P2ApplyStatus />} />
            <Route path="/p2/apply/dashboard" element={<P2ApplyDashboard />} />
            <Route path="/p2/apply/support" element={<P2Support />} />
            <Route path="/p2/apply/certificate/:id" element={<P2Certificate />} />
            <Route path="/verify/:certId" element={<P2Verify />} />
            <Route path="/verify" element={<P2Verify />} />
            {/* P2 protected dashboard */}
            <Route path="/p2/dashboard" element={<P2ProtectedRoute><P2DashboardLayout /></P2ProtectedRoute>}>
              <Route index element={<P2DashboardHome />} />
              <Route path="queue" element={<P2RiskQueue />} />
              <Route path="cases" element={<P2Cases />} />
              <Route path="cases/:id" element={<P2CaseDetail />} />
              <Route path="cases/:id/graph" element={<P2CaseGraph />} />
              <Route path="graph" element={<P2Graph />} />
              <Route path="analytics" element={<P2Analytics />} />
              <Route path="reports" element={<P2ReportsPage />} />
              <Route path="settings" element={<P2SettingsPage />} />
            </Route>
            {/* Admin panel */}
            <Route path="/p2/admin" element={<P2ProtectedRoute><P2AdminLayout /></P2ProtectedRoute>}>
              <Route index element={<P2AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="consulates" element={<AdminConsulates />} />
              <Route path="api" element={<AdminApi />} />
              <Route path="billing" element={<AdminBilling />} />
              <Route path="config" element={<AdminConfig />} />
            </Route>
            {/* Other routes */}
            <Route path="/government" element={<Government />} />
            <Route path="/platform" element={<Platform />} />
            <Route path="/tanitim" element={<Tanitim />} />
            <Route path="/huda" element={<Huda />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/positions/:id" element={<PositionDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </P2AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
