import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type PopulationRow = {
  indicator_id: number;
  indicator_name: string;
  region: string | null;
  year: number;
  value: number | null;
};

type IndicatorGroup = {
  indicator_id: number;
  indicator_name: string;
  region: string | null;
  rows: PopulationRow[];
};

function formatValue(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }
  return value.toFixed(1);
}

export default function PopulationData() {
  const [rows, setRows] = useState<PopulationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPopulationData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/sotkanet`);
        const data = await response.json();

        if (!response.ok || data.error) {
          toast.error(data.error || "Failed to load population data");
          setLoading(false);
          return;
        }

        setRows(data.data ?? []);
      } catch (error) {
        console.error("Failed to fetch population data:", error);
        toast.error("Failed to load population data");
      }

      setLoading(false);
    };

    void fetchPopulationData();
  }, []);

  const groupedIndicators = useMemo<IndicatorGroup[]>(() => {
    const map = new Map<number, IndicatorGroup>();

    for (const row of rows) {
      if (!map.has(row.indicator_id)) {
        map.set(row.indicator_id, {
          indicator_id: row.indicator_id,
          indicator_name: row.indicator_name,
          region: row.region,
          rows: [],
        });
      }

      map.get(row.indicator_id)!.rows.push(row);
    }

    return Array.from(map.values())
      .map((group) => ({
        ...group,
        rows: [...group.rows].sort((a, b) => a.year - b.year),
      }))
      .sort((a, b) => a.indicator_name.localeCompare(b.indicator_name));
  }, [rows]);

  useEffect(() => {
    if (groupedIndicators.length > 0 && selectedIndicatorId === null) {
      setSelectedIndicatorId(groupedIndicators[0].indicator_id);
    }
  }, [groupedIndicators, selectedIndicatorId]);

  const selectedIndicator = useMemo(() => {
    return groupedIndicators.find((group) => group.indicator_id === selectedIndicatorId) ?? null;
  }, [groupedIndicators, selectedIndicatorId]);

  const chartData = useMemo(() => {
    if (!selectedIndicator) {
      return [];
    }

    return selectedIndicator.rows.map((row) => ({
      year: String(row.year),
      value: row.value,
    }));
  }, [selectedIndicator]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Population Data</h1>
        <p className="text-muted-foreground">
          Finnish mental health indicators from Sotkanet
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Loading population data...</p>
          </CardContent>
        </Card>
      ) : groupedIndicators.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">No population data available.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {groupedIndicators.map((group) => {
              const latestWithValue = [...group.rows]
                .reverse()
                .find((row) => row.value !== null);

              const isSelected = group.indicator_id === selectedIndicatorId;

              return (
                <Card
                  key={group.indicator_id}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "ring-2 ring-primary" : "hover:bg-accent/40"
                  }`}
                  onClick={() => setSelectedIndicatorId(group.indicator_id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base leading-snug">
                      {group.indicator_name}
                    </CardTitle>
                    <CardDescription>{group.region || "Finland"}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="text-3xl font-bold">
                      {latestWithValue ? formatValue(latestWithValue.value) : "N/A"}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Latest year: {latestWithValue ? latestWithValue.year : "N/A"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedIndicator?.indicator_name || "Trend"}
              </CardTitle>
              <CardDescription>Year-by-year national average</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      formatter={(value: number | null) =>
                        value === null ? "N/A" : value.toFixed(1)
                      }
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Indicator Data</CardTitle>
              <CardDescription>
                Clean yearly values for the selected metric
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                {selectedIndicator?.rows.map((row) => (
                  <div
                    key={`${row.indicator_id}-${row.year}`}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div className="font-medium">{row.year}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatValue(row.value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Data source: Sotkanet Statistics and Indicator Bank, maintained by the
            Finnish Institute for Health and Welfare (THL). These public Finnish
            population-level indicators are shown for contextual reference and do
            not represent clinical diagnosis.
          </p>
        </>
      )}
    </div>
  );
}