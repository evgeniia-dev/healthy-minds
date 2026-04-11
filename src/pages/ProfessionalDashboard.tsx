import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patientCount, setPatientCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("patient_professional_links")
      .select("id", { count: "exact", head: true })
      .eq("professional_id", user.id)
      .then(({ count, error }) => {
        if (error) {
          console.error("Failed to fetch patient count:", error);
          return;
        }
        setPatientCount(count ?? 0);
      });

    supabase
      .from("treatment_notes")
      .select("id", { count: "exact", head: true })
      .eq("professional_id", user.id)
      .then(({ count, error }) => {
        if (error) {
          console.error("Failed to fetch note count:", error);
          return;
        }
        setNoteCount(count ?? 0);
      });
  }, [user]);

  const stats = [
    {
      label: "Active Patients",
      value: patientCount,
      icon: Users,
      onClick: () => navigate("/professional/patients"),
    },
    {
      label: "Treatment Notes",
      value: noteCount,
      icon: FileText,
      onClick: () => navigate("/professional/patients"),
    },
    {
      label: "Population Data",
      value: "View",
      icon: TrendingUp,
      onClick: () => navigate("/population"),
    },
    {
      label: "Alerts",
      value: 0,
      icon: AlertTriangle,
      onClick: () => {},
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
            className="cursor-pointer transition-colors hover:bg-accent/50"
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