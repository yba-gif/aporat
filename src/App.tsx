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
import V3Defence from "./pages/v3/V3Defence";
import V3Queue from "./pages/v3/V3Queue";
import V3Settings from "./pages/v3/V3Settings";
import V3Personnel from "./pages/v3/V3Personnel";
import V3Scanner from "./pages/v3/V3Scanner";
import V3Graph from "./pages/v3/V3Graph";
import { V3ProtectedRoute } from "./components/v3/V3ProtectedRoute";
import { AuthProvider } from "./api/AuthContext";

const queryClient = new QueryClient();

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
            {/* Redirect legacy routes */}
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
              <Route path="defence" element={<V3Defence />} />
              <Route path="personnel" element={<V3Personnel />} />
              <Route path="queue" element={<V3Queue />} />
              <Route path="settings" element={<V3Settings />} />
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
