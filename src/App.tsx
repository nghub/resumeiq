import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Snowfall } from "@/components/Snowfall";
import { Header } from "@/components/Header";
import { useAppSettings, useIsOwner } from "@/hooks/useAppSettings";
import Index from "./pages/Index";
import IndexV2 from "./pages/IndexV2";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import JobAutomation from "./pages/JobAutomation";
import JobDrafts from "./pages/JobDrafts";
import AdminSettings from "./pages/AdminSettings";
import ApplicationTracker from "./pages/ApplicationTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function LandingPage() {
  const { settings, loading } = useAppSettings();
  
  if (loading) {
    return null;
  }
  
  return settings.landingPageVersion === "v2" ? <IndexV2 /> : <Index />;
}

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isOwner, loading: ownerLoading } = useIsOwner();
  
  if (authLoading || ownerLoading) {
    return null;
  }
  
  if (!user || !isOwner) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

const App = () => {
  const [isSnowing, setIsSnowing] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="resume-ai-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Snowfall isActive={isSnowing} />
            <BrowserRouter>
              <Header onSnowToggle={() => setIsSnowing(!isSnowing)} isSnowing={isSnowing} />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<OwnerRoute><Dashboard /></OwnerRoute>} />
                <Route path="/history" element={<AuthRoute><History /></AuthRoute>} />
                <Route path="/job-automation" element={<OwnerRoute><JobAutomation /></OwnerRoute>} />
                <Route path="/job-drafts" element={<OwnerRoute><JobDrafts /></OwnerRoute>} />
                <Route path="/admin-settings" element={<AdminSettings />} />
                <Route path="/app-tracker" element={<ApplicationTracker />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
