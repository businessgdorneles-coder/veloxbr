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
    const apiToken = Deno.env.get("UTMIFY_API_TOKEN") || config.utmify_token;
    if (!apiToken) {
      return new Response(
        JSON.stringify({ error: "UTMIFY_API_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      orderId,
      paymentMethod,
      status,
      customer,
      product,
      priceInCents,
      createdAt,
      approvedDate,
      refundedAt,
      trackingParameters,
    } = body;

    if (!orderId || !status || !customer || !product) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map payment method to UTMify format
    const utmifyPaymentMethod = paymentMethod === "credit_card" ? "credit_card" : "pix";

    // Map status to UTMify format
    let utmifyStatus: string;
    switch (status) {
      case "paid":
      case "authorized":
        utmifyStatus = "paid";
        break;
      case "waiting_payment":
        utmifyStatus = "waiting_payment";
        break;
      case "refused":
        utmifyStatus = "refused";
        break;
      case "refunded":
        utmifyStatus = "refunded";
        break;
      case "chargedback":
        utmifyStatus = "chargedback";
        break;
      default:
        utmifyStatus = "waiting_payment";
    }

    const utmifyPayload = {
      orderId,
      platform: "VeloxBR",
      paymentMethod: utmifyPaymentMethod,
      status: utmifyStatus,
      createdAt: createdAt || new Date().toISOString().replace("T", " ").slice(0, 19),
      approvedDate: approvedDate || (utmifyStatus === "paid" ? new Date().toISOString().replace("T", " ").slice(0, 19) : null),
      refundedAt: refundedAt || null,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || null,
        document: customer.document || null,
        country: "BR",
      },
      products: [
        {
          id: product.id || "tapete-bandeja-3d",
          name: product.name,
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: priceInCents,
        },
      ],
      trackingParameters: {
        src: trackingParameters?.src || null,
        sck: trackingParameters?.sck || null,
        utm_source: trackingParameters?.utm_source || null,
        utm_campaign: trackingParameters?.utm_campaign || null,
        utm_medium: trackingParameters?.utm_medium || null,
        utm_content: trackingParameters?.utm_content || null,
        utm_term: trackingParameters?.utm_term || null,
      },
      commission: {
        totalPriceInCents: priceInCents,
        gatewayFeeInCents: 0,
        userCommissionInCents: priceInCents,
        currency: "BRL",
      },
    };

    console.log("📤 Sending to UTMify API:", JSON.stringify(utmifyPayload));

    const response = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": apiToken,
      },
      body: JSON.stringify(utmifyPayload),
    });

    const responseText = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("UTMify returned non-JSON:", responseText.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "UTMify returned non-JSON response", raw: responseText.substring(0, 200) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      console.error("UTMify API error:", response.status, JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "UTMify request failed", status: response.status, details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ UTMify API success:", JSON.stringify(data));

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("UTMify edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
