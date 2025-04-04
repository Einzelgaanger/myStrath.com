import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SplashScreen } from "@/components/ui/splash-screen";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import AcademicSelectionPage from "@/pages/academic-selection-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import UnitPage from "@/pages/unit-page";
import ProfilePage from "@/pages/profile-page";
import BadgeDemoPage from "@/pages/badge-demo-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { useAuth } from "./hooks/use-auth";
import { WebSocketProvider } from "./contexts/websocket-context";
import { useState } from "react";

// Wrapper component for root path to handle redirects
function RootRedirect() {
  const { user, isLoading } = useAuth();
  
  // If logged in, redirect to dashboard
  if (user && !isLoading) {
    return <Redirect to="/dashboard" />;
  }
  
  // Otherwise show landing page
  return <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/academic-selection" component={AcademicSelectionPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/unit/:unitId" component={UnitPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/badge-demo" component={BadgeDemoPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider queryClient={queryClient}>
        <WebSocketProvider>
          {showSplash ? (
            <SplashScreen 
              duration={3000} 
              minDuration={1500} 
              title="Stratizens"
              onDone={() => setShowSplash(false)} 
            />
          ) : null}
          <Router />
          <Toaster />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
