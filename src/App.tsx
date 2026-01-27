import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LandingA from "./pages/LandingA";
import LandingB from "./pages/LandingB";
import LandingC from "./pages/LandingC";
import LandingD from "./pages/LandingD";
import LandingE from "./pages/LandingE";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/landing-a" element={<LandingA />} />
          <Route path="/landing-b" element={<LandingB />} />
          <Route path="/landing-c" element={<LandingC />} />
          <Route path="/landing-d" element={<LandingD />} />
          <Route path="/landing-e" element={<LandingE />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
