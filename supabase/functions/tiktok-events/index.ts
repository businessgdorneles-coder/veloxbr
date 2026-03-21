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
    const accessToken = Deno.env.get("TIKTOK_ACCESS_TOKEN") || config.tiktok_token;
    const pixelCode = "D6BLOCJC77U2V3Q5KFF0";

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing TIKTOK_ACCESS_TOKEN" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      event = "CompletePayment",
      event_id,
      value,
      currency = "BRL",
      content_type = "product",
      email,
      phone,
      name: userName,
      city,
      state,
      zip,
      client_ip,
      client_user_agent,
      ttclid,
      ttp,
    } = body;

    // Hash user data with SHA-256 per TikTok requirements
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
    if (email) userData.email = await hashValue(email);
    if (phone) userData.phone_number = await hashValue(phone);
    if (city) userData.city = await hashValue(city);
    if (state) userData.state = await hashValue(state);
    if (zip) userData.zip_code = await hashValue(zip);
    if (client_ip) userData.ip = client_ip;
    if (client_user_agent) userData.user_agent = client_user_agent;
    if (ttclid) userData.ttclid = ttclid;
    if (ttp) userData.ttp = ttp;

    // Split name into first/last
    if (userName) {
      const parts = userName.trim().split(" ");
      userData.first_name = await hashValue(parts[0]);
      if (parts.length > 1) {
        userData.last_name = await hashValue(parts.slice(1).join(" "));
      }
    }

    const eventData = {
      pixel_code: pixelCode,
      partner_name: "VeloxBR",
      event: event,
      event_id: event_id || crypto.randomUUID(),
      event_time: Math.floor(Date.now() / 1000),
      context: {
        user_agent: client_user_agent || "",
        ip: client_ip || "",
        user: userData,
        page: {
          url: body.page_url || Deno.env.get("SITE_URL") || "https://kwtbwcwidcjrtsosbbpn.supabase.co",
        },
      },
      properties: {
        contents: [
          {
            content_type: content_type,
            content_id: "tapete-bandeja-3d",
          },
        ],
        value: value,
        currency: currency,
      },
    };

    const url = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

    const tiktokResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify({
        event_source: "web",
        event_source_id: pixelCode,
        data: [eventData],
      }),
    });

    const result = await tiktokResponse.json();

    console.log("TikTok Events API response:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      status: tiktokResponse.ok ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("TikTok Events API error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
