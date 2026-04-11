import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INDICATORS = [
  { id: 4355, name: "Severe mental strain (%), age 20-64" },
  { id: 4356, name: "Anxiety or insomnia (%), age 20-64" },
  { id: 289, name: "Psychiatric outpatient visits per 1000" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 9 + i);

    const rowsToInsert: {
      indicator_id: number;
      indicator_name: string;
      region: string;
      year: number;
      value: number | null;
    }[] = [];

    for (const indicator of INDICATORS) {
      for (const year of years) {
        const url =
          `https://sotkanet.fi/rest/1.1/json?indicator=${indicator.id}` +
          `&years=${year}&genders=total`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch Sotkanet indicator ${indicator.id} for ${year}`
          );
        }

        const raw = await response.json();

        if (!Array.isArray(raw)) {
          continue;
        }

        const numericValues = raw
          .map((item) => {
            const value = Number(item?.value);
            return Number.isFinite(value) ? value : null;
          })
          .filter((value): value is number => value !== null);

        const nationalAverage =
          numericValues.length > 0
            ? numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length
            : null;

        rowsToInsert.push({
          indicator_id: indicator.id,
          indicator_name: indicator.name,
          region: "Finland (avg)",
          year,
          value: nationalAverage,
        });
      }
    }

    const { error: deleteError } = await adminClient
      .from("finnish_health_cache")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: `Failed to clear old cache: ${deleteError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (rowsToInsert.length > 0) {
      const { error: insertError } = await adminClient
        .from("finnish_health_cache")
        .insert(rowsToInsert);

      if (insertError) {
        return new Response(
          JSON.stringify({ error: `Failed to store data: ${insertError.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted: rowsToInsert.length,
        message: "Sotkanet data synced successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});