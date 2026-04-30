import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, FileText, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type Patient = {
  id: string;
};

type DashboardStat = {
  label: string;
  value: number | string;
  icon: typeof Users;
  onClick?: () => void;
  clickable: boolean;
};

export default function ProfessionalDashboard() {
  const navigate = useNavigate();

  const [patientCount, setPatientCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // First load all patients assigned to the current professional.
      const patientsResponse = await fetch(`${API_URL}/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const patientsData = await patientsResponse.json();

      if (!patientsResponse.ok) {
        toast.error(patientsData.detail || "Failed to load dashboard data");
        return;
      }

      const patients: Patient[] = patientsData;
      setPatientCount(patients.length);

      // Then load treatment notes for each patient to calculate total notes.
      const noteCounts = await Promise.all(
        patients.map(async (patient) => {
          try {
            const notesResponse = await fetch(
              `${API_URL}/patients/${patient.id}/treatment-notes`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const notesData = await notesResponse.json();

            if (!notesResponse.ok || !Array.isArray(notesData)) {
              return 0;
            }

            return notesData.length;
          } catch {
            return 0;
          }
        })
      );

      setNoteCount(noteCounts.reduce((sum, count) => sum + count, 0));
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const stats: DashboardStat[] = [
    {
      label: "Active Patients",
      value: loading ? "..." : patientCount,
      icon: Users,
      onClick: () => navigate("/professional/patients"),
      clickable: true,
    },
    {
      label: "Treatment Notes",
      value: loading ? "..." : noteCount,
      icon: FileText,
      clickable: false,
    },
    {
      label: "Population Data",
      value: "View",
      icon: TrendingUp,
      onClick: () => navigate("/population"),
      clickable: true,
    },
    {
      label: "Alerts",
      value: 0,
      icon: AlertTriangle,
      clickable: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Professional Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your patients, notes, and population data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            role={stat.clickable ? "button" : undefined}
            tabIndex={stat.clickable ? 0 : undefined}
            className={
              stat.clickable
                ? "cursor-pointer transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring"
                : "opacity-90"
            }
            onClick={stat.onClick}
            onKeyDown={(event) => {
              // Makes clickable cards usable with keyboard Enter/Space.
              if (
                stat.clickable &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                stat.onClick?.();
              }
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}