import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("META_ACCESS_TOKEN");
    const pixelId = Deno.env.get("META_PIXEL_ID");

    if (!accessToken || !pixelId) {
      return new Response(
        JSON.stringify({ error: "Meta credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { eventName, userData, customData, eventSourceUrl } = body;

    if (!eventName) {
      return new Response(
        JSON.stringify({ error: "eventName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract client IP from request headers
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || req.headers.get("x-real-ip")
      || userData?.ip;

    // Build user_data with hashed PII
    const user_data: Record<string, unknown> = {};
    if (userData?.email) user_data.em = [await sha256(userData.email)];
    if (userData?.phone) user_data.ph = [await sha256(userData.phone.replace(/\D/g, ""))];
    if (userData?.firstName) user_data.fn = [await sha256(userData.firstName)];
    if (userData?.lastName) user_data.ln = [await sha256(userData.lastName)];
    if (clientIp) user_data.client_ip_address = clientIp;
    if (userData?.userAgent) user_data.client_user_agent = userData.userAgent;
    if (userData?.fbc) user_data.fbc = userData.fbc;
    if (userData?.fbp) user_data.fbp = userData.fbp;

    const eventData: Record<string, unknown> = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: crypto.randomUUID(),
      action_source: "website",
      user_data,
    };

    if (eventSourceUrl) eventData.event_source_url = eventSourceUrl;
    if (customData) eventData.custom_data = customData;

    const API_URL = `https://graph.facebook.com/v21.0/${pixelId}/events`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [eventData],
        access_token: accessToken,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.warn("Meta CAPI warning:", JSON.stringify(result));
      // Return 200 anyway — pixel event already fired client-side.
      // CAPI errors for missing PII (e.g. PageView) should not break the app.
      return new Response(
        JSON.stringify({ success: false, warning: "Meta CAPI rejected event (insufficient PII)", details: result }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
