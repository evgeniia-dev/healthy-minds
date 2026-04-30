import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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

              {/* Protected routes inside the shared app layout */}
              <Route element={<AppLayout />}>
                {/* Patient-only routes */}
                <Route
                  path="/patient/dashboard"
                  element={
                    <ProtectedRoute role="patient">
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/checkin"
                  element={
                    <ProtectedRoute role="patient">
                      <Checkin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/trends"
                  element={
                    <ProtectedRoute role="patient">
                      <Trends />
                    </ProtectedRoute>
                  }
                />

                {/* Professional-only routes */}
                <Route
                  path="/professional/dashboard"
                  element={
                    <ProtectedRoute role="professional">
                      <ProfessionalDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/professional/patients"
                  element={
                    <ProtectedRoute role="professional">
                      <Patients />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/professional/patients/:patientId"
                  element={
                    <ProtectedRoute role="professional">
                      <PatientDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Shared authenticated routes */}
                <Route
                  path="/population"
                  element={
                    <ProtectedRoute>
                      <PopulationData />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
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