import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Brain,
  Search,
  FileQuestion,
  Lightbulb,
  Infinity,
  Sparkles,
  BrainCircuit,
  User,
  LogOut,
  Settings,
  Network,
  Hammer,
} from "lucide-react";

export const Navigation = () => {
  const location = useLocation();
  

  const primaryRoutes = [
    { path: "/notes", label: "Notes", icon: BookOpen, accent: true },
    { path: "/philosophy-lab", label: "Philosophy Lab", icon: Brain, accent: true },
    { path: "/unc-engine", label: "UNC Engine", icon: BrainCircuit, accent: true },
    { path: "/knowledge-atlas", label: "Knowledge Atlas", icon: Network, accent: true },
    { path: "/prompt-forge", label: "Prompt Forge", icon: Sparkles, accent: true },
  ];

  const secondaryRoutes = [
    { path: "/nihilism", label: "Nihilism", icon: Search },
    { path: "/nihiltheism", label: "Nihiltheism", icon: Lightbulb },
    { path: "/nihiltheism-engine", label: "NKE", icon: BrainCircuit },
    { path: "/analysis", label: "Analysis", icon: FileQuestion },
    { path: "/prompt-forge", label: "Prompt Forge", icon: Hammer },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-swift group"
          >
            <Infinity className="h-6 w-6 text-resonance group-hover:rotate-180 transition-all duration-500" />
            <span className="font-semibold text-lg">Infinity Notes</span>
          </Link>

          <div className="flex items-center space-x-2">
            {primaryRoutes.map((route) => {
              const Icon = route.icon;
              return (
                <Button
                  key={route.path}
                  asChild
                  variant={isActive(route.path) ? "default" : "ghost"}
                  className={`transition-contemplative ${
                    route.accent ? "hover:bg-primary/10 hover:text-primary" : "hover:bg-muted"
                  }`}
                >
                  <Link to={route.path}>
                    <Icon className="h-4 w-4 mr-2" />
                    {route.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {secondaryRoutes.map((route) => {
              const Icon = route.icon;
              return (
                <Button
                  key={route.path}
                  asChild
                  variant={isActive(route.path) ? "secondary" : "ghost"}
                  size="sm"
                  className="text-muted-foreground hover:text-foreground transition-swift"
                >
                  <Link to={route.path}>
                    <Icon className="h-3 w-3 mr-1" />
                    {route.label}
                  </Link>
                </Button>
              );
            })}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2" aria-label="User menu">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
