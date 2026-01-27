import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DemoA from "./pages/DemoA";
import DemoB from "./pages/DemoB";
import DemoC from "./pages/DemoC";
import DemoD from "./pages/DemoD";
import DemoE from "./pages/DemoE";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo-a" element={<DemoA />} />
          <Route path="/demo-b" element={<DemoB />} />
          <Route path="/demo-c" element={<DemoC />} />
          <Route path="/demo-d" element={<DemoD />} />
          <Route path="/demo-e" element={<DemoE />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
