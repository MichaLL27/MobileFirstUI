import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AIProfileApp from "@/pages/AIProfileApp";

function Router() {
  return (
    <Switch>
      {/* 
        Since the user requested a single-page app-like experience 
        without React Router logic for the internal navigation,
        we mount the main app component at the root.
      */}
      <Route path="/" component={AIProfileApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
