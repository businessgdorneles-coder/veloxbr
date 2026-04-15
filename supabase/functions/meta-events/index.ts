import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getIntegrationConfig(): Promise<Record<string, string>> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const res = await fetch(`${supabaseUrl}/rest/v1/site_content?key=eq.integrations&select=value`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!res.ok) return {};
    const data = await res.json();
    return (data?.[0]?.value as Record<string, string>) || {};
  } catch { return {}; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const config = await getIntegrationConfig();
    const pixelId = Deno.env.get("META_PIXEL_ID") || config.meta_pixel_id;
    const accessToken = Deno.env.get("META_CONVERSION_API_TOKEN") || config.meta_capi_token;

    if (!pixelId || !accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing META_PIXEL_ID or META_CONVERSION_API_TOKEN" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      event_name = "Purchase",
      value,
      currency = "BRL",
      email,
      phone,
      name: userName,
      city,
      state,
      zip,
      client_ip,
      client_user_agent,
      fbc,
      fbp,
      event_id,
    } = body;

    // Hash user data with SHA-256 for Meta requirements
    const hashValue = async (val: string | undefined) => {
      if (!val) return undefined;
      const normalized = val.trim().toLowerCase();
      const encoder = new TextEncoder();
      const data = encoder.encode(normalized);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    };

    const userData: Record<string, string | undefined> = {};
    if (email) userData.em = await hashValue(email);
    if (phone) userData.ph = await hashValue(phone);
    if (userName) userData.fn = await hashValue(userName.split(" ")[0]);
    if (userName && userName.split(" ").length > 1)
      userData.ln = await hashValue(userName.split(" ").slice(1).join(" "));
    if (city) userData.ct = await hashValue(city);
    if (state) userData.st = await hashValue(state);
    if (zip) userData.zp = await hashValue(zip);
    if (client_ip) userData.client_ip_address = client_ip;
    if (client_user_agent) userData.client_user_agent = client_user_agent;
    if (fbc) userData.fbc = fbc;
    if (fbp) userData.fbp = fbp;

    const eventData = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event_id || crypto.randomUUID(),
          action_source: "website",
          user_data: userData,
          custom_data: {
            value: value,
            currency: currency,
            content_type: "product",
          },
        },
      ],
    };

    const url = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`;

    const metaResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    const result = await metaResponse.json();

    console.log("Meta CAPI response:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      status: metaResponse.ok ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Meta CAPI error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
