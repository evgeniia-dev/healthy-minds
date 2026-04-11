import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INDICATORS = [
  { id: 4355, name: "Severe mental strain (%), age 20-64" },
  { id: 4356, name: "Anxiety or insomnia (%), age 20-64" },
  { id: 289,  name: "Psychiatric outpatient visits per 1000" },
];

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const results: any[] = [];

    for (const ind of INDICATORS) {
      for (const year of YEARS) {
        try {
          const url = `https://sotkanet.fi/rest/1.1/json?indicator=${ind.id}&years=${year}&genders=total`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (!Array.isArray(data) || data.length === 0) continue;

          // Compute national average across all regions
          const values = data.filter((d: any) => d.value != null).map((d: any) => d.value);
          if (values.length === 0) continue;
          const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;

          results.push({
            indicator_id: ind.id,
            indicator_name: ind.name,
            year,
            value: Math.round(avg * 10) / 10,
            region: "Finland (avg)",
            fetched_at: new Date().toISOString(),
          });
        } catch {
          continue;
        }
      }
    }

    if (results.length > 0) {
      await supabase.from("finnish_health_cache").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const { error } = await supabase.from("finnish_health_cache").insert(results);
      if (error) throw error;
    }

    return new Response(JSON.stringify({ synced: results.length }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Sync error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
