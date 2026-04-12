import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays, parseISO } from "date-fns";

interface MoodEntry {
  entry_date: string;
  mood_score: number;
  sleep_hours: number | null;
  stress_level: number | null;
  exercise_minutes: number | null;
}

const periods = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export function TrendCharts({ entries }: { entries: MoodEntry[] }) {
  const [period, setPeriod] = useState(30);

  const data = useMemo(() => {
    const cutoff = subDays(new Date(), period);
    return entries
      .filter((e) => parseISO(e.entry_date) >= cutoff)
      .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
      .map((e) => ({
        date: format(parseISO(e.entry_date), "MMM d"),
        mood: e.mood_score,
        sleep: e.sleep_hours,
        stress: e.stress_level,
        exercise: e.exercise_minutes,
      }));
  }, [entries, period]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Trends</CardTitle>
          <div className="flex gap-1">
            {periods.map((p) => (
              <Button key={p.days} variant={period === p.days ? "default" : "outline"} size="sm" onClick={() => setPeriod(p.days)}>
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }} />
              <Legend />
              <Line type="monotone" dataKey="mood" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Mood" />
              <Line type="monotone" dataKey="stress" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} name="Stress" />
              <Line type="monotone" dataKey="sleep" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Sleep (h)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
