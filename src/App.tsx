import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { hasLocalStorageNotes } from "@/utils/localStorageMigration";
import Index from "./pages/Index";
import Notes from "./pages/Notes";
import PhilosophyLab from "./pages/PhilosophyLab";
import KnowledgeAtlas from "./pages/KnowledgeAtlas";
import Nihilism from "./pages/Nihilism";
import Nihiltheism from "./pages/Nihiltheism";
import Analysis from "./pages/Analysis";
import PromptForge from "./pages/PromptForge";
import UncEnginePage from "./pages/UncEngine";
import NotFound from "./pages/NotFound";
 codex/define-loveable-core-tenets-and-data-model
import PromptForge from "./pages/PromptForge";

import Auth from "./pages/Auth";
import MigrationPrompt from "./components/MigrationPrompt";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
 main

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [showMigration, setShowMigration] = useState(false);
  const [checkingMigration, setCheckingMigration] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      const migrationKey = `migration_completed_${user.id}`;
      const hasMigrated = localStorage.getItem(migrationKey);
      const hasNotes = hasLocalStorageNotes();
      
      if (!hasMigrated && hasNotes) {
        setShowMigration(true);
      }
      setCheckingMigration(false);
    } else if (!loading) {
      setCheckingMigration(false);
    }
  }, [user, loading]);

  if (loading || checkingMigration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showMigration && user) {
    return (
      <MigrationPrompt
        userId={user.id}
        onComplete={() => setShowMigration(false)}
      />
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/philosophy-lab"
        element={
          <ProtectedRoute>
            <PhilosophyLab />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nihilism"
        element={
          <ProtectedRoute>
            <Nihilism />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nihiltheism"
        element={
          <ProtectedRoute>
            <Nihiltheism />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis"
        element={
          <ProtectedRoute>
            <Analysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prompt-forge"
        element={
          <ProtectedRoute>
            <PromptForge />
          </ProtectedRoute>
        }
      />
      <Route
        path="/knowledge-atlas"
        element={
          <ProtectedRoute>
            <KnowledgeAtlas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/unc-engine"
        element={
          <ProtectedRoute>
            <UncEnginePage />
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
 codex/define-loveable-core-tenets-and-data-model
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

        <Toaster />
        <Sonner />
        <AppContent />
 main
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
