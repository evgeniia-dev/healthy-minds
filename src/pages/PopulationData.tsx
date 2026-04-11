import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function PopulationData() {
  const [data, setData] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  const fetchData = () => {
    supabase
      .from("finnish_health_cache")
      .select("*")
      .order("year", { ascending: true })
      .then(({ data: d }) => { if (d) setData(d); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("sync-sotkanet");
      if (error) throw error;
      toast.success(`Synced ${result.synced} records from Sotkanet`);
      fetchData();
    } catch (e: any) {
      toast.error("Sync failed: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const byIndicator: Record<string, any[]> = data.reduce((acc: Record<string, any[]>, d) => {
    if (!acc[d.indicator_name]) acc[d.indicator_name] = [];
    acc[d.indicator_name].push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finnish Population Health Data</h1>
          <p className="text-muted-foreground">
            Mental health indicators from THL Sotkanet (CC 4.0)
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync Now"}
        </Button>
      </div>

      {Object.keys(byIndicator).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No population data cached yet. Click "Sync Now" to fetch data from Sotkanet.
            </p>
            <Button onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing…" : "Fetch Data"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(byIndicator).map(([name, items]) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Trend over time — Finland (regional average)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={items}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }} />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Source: Finnish Institute for Health and Welfare (THL),{" "}
        <a href="https://sotkanet.fi" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          Sotkanet
        </a>
        . Statistics produced by THL.
      </p>
    </div>
  );
}
