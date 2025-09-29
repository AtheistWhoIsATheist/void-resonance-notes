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
 codex/extract-and-infer-quotes-from-philosophers
import Journal314 from "./pages/Journal314";

import PromptForge from "./pages/PromptForge";
 main
import NotFound from "./pages/NotFound";
import PromptForge from "./pages/PromptForge";

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
 codex/extract-and-infer-quotes-from-philosophers
          <Route path="/journal314" element={<Journal314 />} />

          <Route path="/prompt-forge" element={<PromptForge />} />
 main
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
