import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type PopulationRow = {
  indicator_id: number;
  indicator_name: string;
  region: string | null;
  year: number;
  value: number | null;
};

export default function PopulationData() {
  const [rows, setRows] = useState<PopulationRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Population Data</h1>
        <p className="text-muted-foreground">
          Finnish mental health indicators from Sotkanet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sotkanet Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading population data...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No population data available.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((row, index) => (
                <div key={`${row.indicator_id}-${row.year}-${index}`} className="rounded-lg border p-3">
                  <div className="font-medium">{row.indicator_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {row.region} · {row.year}
                  </div>
                  <div className="mt-1 text-sm">
                    Value: {row.value ?? "N/A"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}