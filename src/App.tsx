import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Positions from "./pages/Positions";
import PositionDetail from "./pages/PositionDetail";
import Government from "./pages/Government";
import NotFound from "./pages/NotFound";
import V3Login from "./pages/v3/V3Login";
import V3Layout from "./pages/v3/V3Layout";
import V3Dashboard from "./pages/v3/V3Dashboard";
import V3Cases from "./pages/v3/V3Cases";
import V3CaseDetail from "./pages/v3/V3CaseDetail";
import V3Queue from "./pages/v3/V3Queue";
import V3Settings from "./pages/v3/V3Settings";
import V3Personnel from "./pages/v3/V3Personnel";
import V3Scanner from "./pages/v3/V3Scanner";
import V3Graph from "./pages/v3/V3Graph";
import V3Demo from "./pages/v3/V3Demo";
import { V3ProtectedRoute } from "./components/v3/V3ProtectedRoute";
import { AuthProvider } from "./api/AuthContext";

const DefenceLayout = lazy(() => import("./pages/v3/defence/DefenceLayout"));
const DefenceDashboard = lazy(() => import("./pages/v3/defence/DefenceDashboard"));
const DefenceAlerts = lazy(() => import("./pages/v3/defence/DefenceAlerts"));
const DefenceMap = lazy(() => import("./pages/v3/defence/DefenceMap"));
const DefencePersonnel = lazy(() => import("./pages/v3/defence/DefencePersonnel"));
const DefenceScan = lazy(() => import("./pages/v3/defence/DefenceScan"));
const DefenceFaceSearch = lazy(() => import("./pages/v3/defence/DefenceFaceSearch"));

const queryClient = new QueryClient();

const DefenceRouteFallback = () => (
  <div className="min-h-screen bg-background" />
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/p2/*" element={<Navigate to="/v3" replace />} />
            <Route path="/platform" element={<Navigate to="/v3" replace />} />
            {/* V3 Intelligence Platform */}
            <Route path="/v3" element={<V3Login />} />
            <Route path="/v3" element={<V3ProtectedRoute><V3Layout /></V3ProtectedRoute>}>
              <Route path="dashboard" element={<V3Dashboard />} />
              <Route path="cases" element={<V3Cases />} />
              <Route path="cases/:id" element={<V3CaseDetail />} />
              <Route path="scanner" element={<V3Scanner />} />
              <Route path="graph" element={<V3Graph />} />
              <Route path="personnel" element={<V3Personnel />} />
              <Route path="queue" element={<V3Queue />} />
              <Route path="settings" element={<V3Settings />} />
              <Route path="demo" element={<V3Demo />} />
            </Route>
            {/* Defence OSINT Platform */}
             <Route path="/v3/defence" element={<V3ProtectedRoute><Suspense fallback={<DefenceRouteFallback />}><DefenceLayout /></Suspense></V3ProtectedRoute>}>
               <Route index element={<Suspense fallback={<DefenceRouteFallback />}><DefenceDashboard /></Suspense>} />
               <Route path="alerts" element={<Suspense fallback={<DefenceRouteFallback />}><DefenceAlerts /></Suspense>} />
               <Route path="map" element={<Suspense fallback={<DefenceRouteFallback />}><DefenceMap /></Suspense>} />
               <Route path="personnel" element={<Suspense fallback={<DefenceRouteFallback />}><DefencePersonnel /></Suspense>} />
               <Route path="scan" element={<Suspense fallback={<DefenceRouteFallback />}><DefenceScan /></Suspense>} />
               <Route path="face-search" element={<Suspense fallback={<DefenceRouteFallback />}><DefenceFaceSearch /></Suspense>} />
            </Route>
            {/* Public pages */}
            <Route path="/government" element={<Government />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/positions/:id" element={<PositionDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
