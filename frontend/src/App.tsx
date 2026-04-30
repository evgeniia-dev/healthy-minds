import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/PatientDashboard";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import Checkin from "./pages/Checkin";
import Trends from "./pages/Trends";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import PopulationData from "./pages/PopulationData";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />

              {/* Authenticated app routes inside the shared layout */}
              <Route element={<AppLayout />}>
                {/* Patient routes */}
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/checkin" element={<Checkin />} />
                <Route path="/patient/trends" element={<Trends />} />

                {/* Professional routes */}
                <Route
                  path="/professional/dashboard"
                  element={<ProfessionalDashboard />}
                />
                <Route path="/professional/patients" element={<Patients />} />
                <Route
                  path="/professional/patients/:patientId"
                  element={<PatientDetail />}
                />

                {/* Shared routes */}
                <Route path="/population" element={<PopulationData />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback route for unknown pages */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;