import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PopulationRow = {
  indicator_id: number;
  indicator_name: string;
  region: string | null;
  year: number;
  value: number | null;
};

type ApiResponse = {
  success?: boolean;
  error?: string;
  data?: PopulationRow[];
};

const FASTAPI_SOTKANET_URL = "http://localhost:8000/api/sotkanet";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function PopulationData() {
  const [data, setData] = useState<PopulationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchPopulationData = async () => {
    setLoading(true);

    try {
      const response = await fetch(FASTAPI_SOTKANET_URL);
      const result: ApiResponse = await response.json();

      if (!response.ok || result.error) {
        console.error("Failed to fetch population data:", result);
        toast.error(result.error || "Failed to load population data");
        setLoading(false);
        return;
      }

      setData(result.data ?? []);
    } catch (error) {
      console.error("Failed to fetch population data:", error);
      toast.error("Failed to load population data");
    }

    setLoading(false);
  };

  useEffect(() => {
    void fetchPopulationData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    await fetchPopulationData();
    toast.success("Population data refreshed");
    setSyncing(false);
  };

  const groupedData = useMemo(() => {
    const groups = new Map<string, PopulationRow[]>();

    for (const row of data) {
      const key = row.indicator_name;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(row);
    }

    return Array.from(groups.entries()).map(([indicatorName, rows]) => ({
      indicatorName,
      rows: rows
        .filter((row) => row.value !== null)
        .sort((a, b) => a.year - b.year)
        .map((row) => ({
          year: String(row.year),
          value: row.value,
          region: row.region ?? "Unknown",
        })),
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Finnish Population Health Data
          </h1>
          <p className="text-muted-foreground">
            Mental health indicators from THL Sotkanet via FastAPI
          </p>
        </div>

        <Button variant="outline" onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Loading population data...
          </CardContent>
        </Card>
      ) : groupedData.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              No population data available. Make sure the FastAPI backend is running on
              port 8000.
            </p>
            <Button className="mt-4" onClick={handleSync} disabled={syncing}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Refreshing..." : "Try Again"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        groupedData.map((group, index) => (
          <Card key={group.indicatorName}>
            <CardHeader>
              <CardTitle>{group.indicatorName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={group.rows}>
                    <CartesianGrid
                      stroke="hsl(var(--border))"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="year"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill={chartColors[index % chartColors.length]}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <p className="text-sm text-muted-foreground">
        Source: Finnish Institute for Health and Welfare (THL),{" "}
        <a
          href="https://sotkanet.fi"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Sotkanet
        </a>
        .
      </p>
    </div>
  );
}