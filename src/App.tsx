
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import MonthlySummary from './pages/MonthlySummary';
import Summary from './pages/Summary';
import NotFound from "./pages/NotFound";
import { InstallPwa } from "./components/InstallPwa";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <InstallPwa />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/monthly-summary" element={<MonthlySummary />} />
          <Route path="/summary" element={<Summary />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
