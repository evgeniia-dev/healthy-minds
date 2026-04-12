import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MoodCalendar } from "@/components/patient/MoodCalendar";
import { TrendCharts } from "@/components/patient/TrendCharts";
import { CorrelationHeatmap } from "@/components/patient/CorrelationHeatmap";
import { RiskIndicator } from "@/components/patient/RiskIndicator";
import { DailyCheckin } from "@/components/patient/DailyCheckin";
import { toast } from "sonner";

const API_URL = "http://127.0.0.1:8000";

type MoodEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  mood_score: number;
  sleep_hours: number | null;
  stress_level: number | null;
  exercise_minutes: number | null;
  notes: string | null;
};

type PopulationRow = {
  indicator_id: number;
  indicator_name: string;
  region: string | null;
  year: number;
  value: number | null;
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [populationData, setPopulationData] = useState<PopulationRow[]>([]);

  const fetchEntries = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/mood-entries/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Failed to load check-in data");
        return;
      }

      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch mood entries:", error);
      toast.error("Failed to load check-in data");
    }
  };

  const fetchPopulationData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sotkanet`);
      const data = await response.json();

      if (!response.ok || data.error) {
        toast.error(data.error || "Failed to load population data");
        return;
      }

      setPopulationData(data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch population data:", error);
      toast.error("Failed to load population data");
    }
  };

  useEffect(() => {
    if (user?.role === "patient") {
      void fetchEntries();
    }
    void fetchPopulationData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your mental health and wellbeing
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DailyCheckin onSuccess={fetchEntries} />
        <RiskIndicator entries={entries} populationData={populationData} />
      </div>

      <MoodCalendar entries={entries} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TrendCharts entries={entries} />
        <CorrelationHeatmap entries={entries} />
      </div>
    </div>
  );
}