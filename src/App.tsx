import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import P2 from "./pages/P2";
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
