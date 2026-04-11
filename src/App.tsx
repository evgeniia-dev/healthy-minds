import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
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
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route element={<AppLayout />}>
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/checkin" element={<Checkin />} />
                <Route path="/patient/trends" element={<Trends />} />

                <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
                <Route path="/professional/patients" element={<Patients />} />
                <Route
                  path="/professional/patients/:patientId"
                  element={<PatientDetail />}
                />

                <Route path="/population" element={<PopulationData />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;