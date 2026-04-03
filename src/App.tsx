import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Notes from "./pages/Notes";
import PhilosophyLab from "./pages/PhilosophyLab";
import KnowledgeAtlas from "./pages/KnowledgeAtlas";
import Nihilism from "./pages/Nihilism";
import Nihiltheism from "./pages/Nihiltheism";
import NihiltheismEngine from "./pages/NihiltheismEngine";
import Analysis from "./pages/Analysis";
import PromptForge from "./pages/PromptForge";
import UncEnginePage from "./pages/UncEngine";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/philosophy-lab" element={<PhilosophyLab />} />
          <Route path="/nihilism" element={<Nihilism />} />
          <Route path="/nihiltheism" element={<Nihiltheism />} />
          <Route path="/nihiltheism-engine" element={<NihiltheismEngine />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/prompt-forge" element={<PromptForge />} />
          <Route path="/knowledge-atlas" element={<KnowledgeAtlas />} />
          <Route path="/unc-engine" element={<UncEnginePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
