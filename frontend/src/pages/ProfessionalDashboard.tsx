import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function ProfessionalDashboard() {
  const navigate = useNavigate();

  const [patientCount, setPatientCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);

  const fetchStats = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) return;

      setPatientCount(data.length);

      let totalNotes = 0;

      for (const patient of data) {
        const notesRes = await fetch(
          `${API_URL}/patients/${patient.id}/treatment-notes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const notes = await notesRes.json();

        if (notesRes.ok) {
          totalNotes += notes.length;
        }
      }

      setNoteCount(totalNotes);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = [
    {
      label: "Active Patients",
      value: patientCount,
      icon: Users,
      onClick: () => navigate("/professional/patients"),
      clickable: true,
    },
    {
      label: "Treatment Notes",
      value: noteCount,
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
          Overview of your patients and treatments
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={
              stat.clickable
                ? "cursor-pointer transition-colors hover:bg-accent/50"
                : "opacity-90"
            }
            onClick={stat.onClick}
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