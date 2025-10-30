import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Notes from "./pages/Notes";
import PhilosophyLab from "./pages/PhilosophyLab";
import Nihilism from "./pages/Nihilism";
import Nihiltheism from "./pages/Nihiltheism";
import Analysis from "./pages/Analysis";
import PromptForge from "./pages/PromptForge";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/philosophy-lab" element={<PhilosophyLab />} />
          <Route path="/nihilism" element={<Nihilism />} />
          <Route path="/nihiltheism" element={<Nihiltheism />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/prompt-forge" element={<PromptForge />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
