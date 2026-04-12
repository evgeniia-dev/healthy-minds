import { useEffect, useState } from "react";
import { TrendCharts } from "@/components/patient/TrendCharts";
import { CorrelationHeatmap } from "@/components/patient/CorrelationHeatmap";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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

export default function Trends() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
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
          toast.error(data.detail || "Failed to load trends");
          return;
        }

        setEntries(data);
      } catch (error) {
        console.error("Failed to fetch trends:", error);
        toast.error("Failed to load trends");
      }
    };

    void fetchEntries();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Trends</h1>
      <TrendCharts entries={entries} />
      <CorrelationHeatmap entries={entries} />
    </div>
  );
}