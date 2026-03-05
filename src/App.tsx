import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import P2 from "./pages/P2";
import P2Login from "./pages/P2Login";
import P2Register from "./pages/P2Register";
import P2Mfa from "./pages/P2Mfa";
import P2DashboardLayout from "./pages/P2DashboardLayout";
import P2DashboardHome from "./pages/P2DashboardHome";
import { P2Queue, P2Cases, P2Graph, P2Analytics, P2Reports, P2Settings } from "./pages/P2DashboardPlaceholders";
import Positions from "./pages/Positions";
import PositionDetail from "./pages/PositionDetail";
import Government from "./pages/Government";
import Platform from "./pages/Platform";
import Tanitim from "./pages/Tanitim";
import Huda from "./pages/Huda";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/p2" element={<P2 />} />
          <Route path="/p2/login" element={<P2Login />} />
          <Route path="/p2/register" element={<P2Register />} />
          <Route path="/p2/auth/mfa" element={<P2Mfa />} />
          <Route path="/p2/dashboard" element={<P2DashboardLayout />}>
            <Route index element={<P2DashboardHome />} />
            <Route path="queue" element={<P2Queue />} />
            <Route path="cases" element={<P2Cases />} />
            <Route path="graph" element={<P2Graph />} />
            <Route path="analytics" element={<P2Analytics />} />
            <Route path="reports" element={<P2Reports />} />
            <Route path="settings" element={<P2Settings />} />
          </Route>
          <Route path="/government" element={<Government />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="/tanitim" element={<Tanitim />} />
          <Route path="/huda" element={<Huda />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/positions/:id" element={<PositionDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
