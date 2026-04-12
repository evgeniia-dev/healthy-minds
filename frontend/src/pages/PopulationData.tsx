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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function shortName(name: string) {
  if (name.includes("Severe mental strain")) {
    return "Severe mental strain";
  }
  if (name.includes("Anxiety or insomnia")) {
    return "Anxiety or insomnia";
  }
  if (name.includes("Psychiatric outpatient visits")) {
    return "Psychiatric outpatient visits";
  }
  return name;
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

  const latestStats = useMemo(() => {
    return groupedIndicators.map((group) => {
      const latestWithValue = [...group.rows].reverse().find((row) => row.value !== null);
      return {
        indicator_id: group.indicator_id,
        indicator_name: group.indicator_name,
        region: group.region,
        latestYear: latestWithValue?.year ?? null,
        latestValue: latestWithValue?.value ?? null,
      };
    });
  }, [groupedIndicators]);

  const chartData = useMemo(() => {
    if (!selectedIndicator) {
      return [];
    }

    return selectedIndicator.rows
      .filter((row) => row.value !== null)
      .map((row) => ({
        year: String(row.year),
        value: row.value as number,
      }));
  }, [selectedIndicator]);

  const tableRows = useMemo(() => {
    if (!selectedIndicator) {
      return [];
    }

    return selectedIndicator.rows;
  }, [selectedIndicator]);

  return (
    <div className="space-y-5">
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
            {latestStats.map((stat) => {
              const isSelected = stat.indicator_id === selectedIndicatorId;

              return (
                <Card
                  key={stat.indicator_id}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "ring-2 ring-primary" : "hover:bg-accent/40"
                  }`}
                  onClick={() => setSelectedIndicatorId(stat.indicator_id)}
                >
                  <CardHeader className="pb-2">
                    <CardDescription>{stat.region || "Finland"}</CardDescription>
                    <CardTitle className="text-base leading-snug">
                      {shortName(stat.indicator_name)}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold">
                      {formatValue(stat.latestValue)}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Latest year: {stat.latestYear ?? "N/A"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <CardTitle>{shortName(selectedIndicator?.indicator_name || "Indicator")}</CardTitle>
                  <CardDescription>
                    National trend over time
                  </CardDescription>
                </div>

                <div className="w-full md:w-[320px]">
                  <Select
                    value={selectedIndicatorId ? String(selectedIndicatorId) : undefined}
                    onValueChange={(value) => setSelectedIndicatorId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select indicator" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupedIndicators.map((group) => (
                        <SelectItem
                          key={group.indicator_id}
                          value={String(group.indicator_id)}
                        >
                          {shortName(group.indicator_name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      formatter={(value: number) => value.toFixed(1)}
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
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Yearly values</CardTitle>
              <CardDescription>
                Selected indicator, cleaned for quick comparison
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-2 bg-muted/40 px-4 py-3 text-sm font-medium">
                  <div>Year</div>
                  <div className="text-right">Value</div>
                </div>

                {tableRows.map((row) => (
                  <div
                    key={`${row.indicator_id}-${row.year}`}
                    className="grid grid-cols-2 border-t px-4 py-3 text-sm"
                  >
                    <div>{row.year}</div>
                    <div className="text-right text-muted-foreground">
                      {formatValue(row.value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Data source: Sotkanet Statistics and Indicator Bank, maintained by the
                Finnish Institute for Health and Welfare (THL). These public Finnish
                population-level indicators are shown for contextual reference and do
                not represent clinical diagnosis.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}