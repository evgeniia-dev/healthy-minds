import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrendCharts } from "@/components/patient/TrendCharts";
import { CorrelationHeatmap } from "@/components/patient/CorrelationHeatmap";

export default function Trends() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: true })
      .then(({ data }) => { if (data) setEntries(data); });
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Trends</h1>
      <TrendCharts entries={entries} />
      <CorrelationHeatmap entries={entries} />
    </div>
  );
}
