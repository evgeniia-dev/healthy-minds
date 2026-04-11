import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MoodCalendar } from "@/components/patient/MoodCalendar";
import { TrendCharts } from "@/components/patient/TrendCharts";
import { CorrelationHeatmap } from "@/components/patient/CorrelationHeatmap";
import { RiskIndicator } from "@/components/patient/RiskIndicator";
import { DailyCheckin } from "@/components/patient/DailyCheckin";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [populationData, setPopulationData] = useState<any[]>([]);

  const fetchEntries = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: true });
    if (data) setEntries(data);
  };

  const fetchPopulationData = async () => {
    const { data } = await supabase
      .from("finnish_health_cache")
      .select("indicator_name, value")
      .order("year", { ascending: false })
      .limit(10);
    if (data) setPopulationData(data);
  };

  useEffect(() => {
    fetchEntries();
    fetchPopulationData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Track your mental health and wellbeing</p>
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
