import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PIXEL_ID = "D6BLOCJC77U2V3Q5KFF0";
const API_URL = `https://business-api.tiktok.com/open_api/v1.3/event/track/`;


async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("TIKTOK_ACCESS_TOKEN");
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "TikTok access token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { event, userData, properties } = body;

    if (!event) {
      return new Response(
        JSON.stringify({ error: "event is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash PII fields
    const user: Record<string, string> = {};
    if (userData?.email) user.email = await sha256(userData.email);
    if (userData?.phone) user.phone_number = await sha256(userData.phone.replace(/\D/g, ""));
    if (userData?.ip) user.ip = userData.ip;
    if (userData?.userAgent) user.user_agent = userData.userAgent;
    if (userData?.ttclid) user.ttclid = userData.ttclid;

    const eventData: Record<string, unknown> = {
      event,
      event_time: Math.floor(Date.now() / 1000),
      event_id: crypto.randomUUID(),
      user,
    };

    // Map event-specific properties
    if (properties) {
      const contents = properties.contents || [];
      const props: Record<string, unknown> = {};

      if (contents.length > 0) props.contents = contents;
      if (properties.value) props.value = properties.value;
      if (properties.currency) props.currency = properties.currency || "BRL";
      if (properties.content_type) props.content_type = properties.content_type;

      eventData.properties = props;
    }

    const payload = {
      event_source: "web",
      event_source_id: PIXEL_ID,
      data: [eventData],
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || result.code !== 0) {
      console.error("TikTok API error:", JSON.stringify(result));
      return new Response(
        JSON.stringify({ error: "TikTok API error", details: result }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
