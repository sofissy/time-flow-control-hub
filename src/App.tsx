
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";

import Index from "./pages/Index";
import Customers from "./pages/Customers";
import Projects from "./pages/Projects";
import Reports from "./pages/Reports";
import WeeklyEntry from "./pages/WeeklyEntry";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <BrowserRouter>
        {/* TooltipProvider must be inside the React component tree after BrowserRouter */}
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/weekly" element={<WeeklyEntry />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
