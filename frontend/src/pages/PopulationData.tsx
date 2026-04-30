import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

/**
 * Format numeric values for display.
 * Ensures consistent decimals and handles missing values.
 */
function formatValue(value: number | null) {
  if (value === null || Number.isNaN(value)) return "N/A";
  return value.toFixed(1);
}

/**
 * Shortens long indicator names into readable labels.
 * Avoids overwhelming the UI with full dataset descriptions.
 */
function shortName(name: string) {
  if (name.includes("Severe mental strain")) return "Severe mental strain";
  if (name.includes("Anxiety or insomnia")) return "Anxiety or insomnia";
  if (name.includes("Psychiatric outpatient visits"))
    return "Psychiatric outpatient visits";
  return name;
}

export default function PopulationData() {
  const [rows, setRows] = useState<PopulationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<number | null>(
    null
  );

  /**
   * Fetch population data once on mount.
   */
  useEffect(() => {
    const fetchPopulationData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/sotkanet`);
        const data = await response.json();

        if (!response.ok || data.error) {
          toast.error(data.error || "Failed to load population data");
          return;
        }

        setRows(data.data ?? []);
      } catch (error) {
        console.error("Failed to fetch population data:", error);
        toast.error("Failed to load population data");
      } finally {
        setLoading(false);
      }
    };

    void fetchPopulationData();
  }, []);

  /**
   * Group raw rows by indicator_id.
   * Also sorts each group chronologically.
   */
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

  /**
   * Set default selected indicator once data is available.
   */
  useEffect(() => {
    if (groupedIndicators.length > 0 && selectedIndicatorId === null) {
      setSelectedIndicatorId(groupedIndicators[0].indicator_id);
    }
  }, [groupedIndicators, selectedIndicatorId]);

  /**
   * Get currently selected indicator group.
   */
  const selectedIndicator = useMemo(() => {
    return (
      groupedIndicators.find(
        (group) => group.indicator_id === selectedIndicatorId
      ) ?? null
    );
  }, [groupedIndicators, selectedIndicatorId]);

  /**
   * Extract latest available value for each indicator (used in cards).
   */
  const latestStats = useMemo(() => {
    return groupedIndicators.map((group) => {
      const latest = [...group.rows]
        .reverse()
        .find((row) => row.value !== null);

      return {
        indicator_id: group.indicator_id,
        indicator_name: group.indicator_name,
        region: group.region,
        latestYear: latest?.year ?? null,
        latestValue: latest?.value ?? null,
      };
    });
  }, [groupedIndicators]);

  /**
   * Prepare chart data (remove null values).
   */
  const chartData = useMemo(() => {
    if (!selectedIndicator) return [];

    return selectedIndicator.rows
      .filter((row) => row.value !== null)
      .map((row) => ({
        year: String(row.year),
        value: row.value as number,
      }));
  }, [selectedIndicator]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Population Data
        </h1>
        <p className="text-muted-foreground">
          Finnish mental health indicators for context and comparison
        </p>
      </div>

      {/* Loading / empty states */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Loading population data...
            </p>
          </CardContent>
        </Card>
      ) : groupedIndicators.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              No population data available.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Indicator summary cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {latestStats.map((stat) => {
              const isSelected =
                stat.indicator_id === selectedIndicatorId;

              return (
                <Card
                  key={stat.indicator_id}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "ring-2 ring-primary"
                      : "hover:bg-accent/40"
                  }`}
                  onClick={() =>
                    setSelectedIndicatorId(stat.indicator_id)
                  }
                >
                  <CardHeader className="pb-2">
                    <CardDescription>
                      {stat.region || "Finland"}
                    </CardDescription>
                    <CardTitle className="text-base">
                      {shortName(stat.indicator_name)}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="text-3xl font-bold">
                      {formatValue(stat.latestValue)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Latest year: {stat.latestYear ?? "N/A"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                {shortName(
                  selectedIndicator?.indicator_name || "Indicator"
                )}
              </CardTitle>
              <CardDescription>
                How this indicator changes over time
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) =>
                        value.toFixed(1)
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Yearly values</CardTitle>
              <CardDescription>
                Raw data for reference
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                {selectedIndicator?.rows.map((row) => (
                  <div
                    key={row.year}
                    className="flex justify-between px-4 py-2 text-sm border-t"
                  >
                    <span>{row.year}</span>
                    <span>{formatValue(row.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">
                These are population-level statistics from Finland.
                They help provide context, not diagnosis.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}