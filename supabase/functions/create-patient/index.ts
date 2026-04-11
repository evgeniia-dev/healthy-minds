import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const body = await req.json();
    const email = body?.email?.trim();
    const fullName = body?.full_name?.trim();
    const professionalId = body?.professional_id?.trim();

    if (!email || !fullName || !professionalId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: email, full_name, professional_id",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const redirectTo = `${req.headers.get("origin") || "http://localhost:8090"}/auth`;

    const { data: inviteData, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: fullName,
          role: "patient",
        },
        redirectTo,
      });

    if (inviteError || !inviteData.user) {
      return new Response(
        JSON.stringify({
          error: inviteError?.message || "Failed to invite patient",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const patientId = inviteData.user.id;

    const { error: linkError } = await adminClient
      .from("patient_professional_links")
      .insert({
        patient_id: patientId,
        professional_id: professionalId,
      });

    if (linkError) {
      return new Response(
        JSON.stringify({
          error: `Patient invited but linking failed: ${linkError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: patientId,
        email: inviteData.user.email,
        message: "Patient invitation email sent",
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