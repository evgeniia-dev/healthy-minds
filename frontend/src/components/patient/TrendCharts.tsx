import { useMemo, useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      .filter((entry) => parseISO(entry.entry_date) >= cutoff)
      .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
      .map((entry) => ({
        date: format(parseISO(entry.entry_date), "MMM d"),
        mood: entry.mood_score,
        sleep: entry.sleep_hours,
        stress: entry.stress_level,
      }));
  }, [entries, period]);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="space-y-3 px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Trends</CardTitle>
            <CardDescription className="mt-1">
              See how your mood, stress, and sleep change over time.
            </CardDescription>
          </div>

          <div className="flex gap-1">
            {periods.map((periodOption) => (
              <Button
                key={periodOption.days}
                variant={period === periodOption.days ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(periodOption.days)}
              >
                {periodOption.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:px-6">
        {data.length === 0 ? (
          <p className="px-2 py-6 text-sm text-muted-foreground">
            No check-ins recorded for this period yet.
          </p>
        ) : (
          <div className="h-[280px] w-full sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 12,
                  right: 12,
                  left: -16,
                  bottom: 8,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />

                <XAxis
                  dataKey="date"
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 12,
                  }}
                  tickMargin={8}
                />

                <YAxis
                  domain={[0, 10]}
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 12,
                  }}
                  tickMargin={8}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                  name="Mood"
                  connectNulls
                />

                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                  name="Stress"
                  connectNulls
                />

                <Line
                  type="monotone"
                  dataKey="sleep"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                  name="Sleep (hours)"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}