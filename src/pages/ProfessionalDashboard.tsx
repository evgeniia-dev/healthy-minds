import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfessionalDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      label: "Active Patients",
      value: 0,
      icon: Users,
      onClick: () => navigate("/professional/patients"),
      clickable: true,
    },
    {
      label: "Treatment Notes",
      value: 0,
      icon: FileText,
      onClick: undefined,
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
      onClick: undefined,
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