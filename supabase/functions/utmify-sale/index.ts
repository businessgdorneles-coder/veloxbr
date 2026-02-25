import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiToken = Deno.env.get("UTMIFY_API_TOKEN");
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
      trackingParameters: trackingParameters || {
        src: null,
        sck: null,
        utm_source: null,
        utm_campaign: null,
        utm_medium: null,
        utm_content: null,
        utm_term: null,
      },
      commission: {
        totalPriceInCents: priceInCents,
        gatewayFeeInCents: 0,
        userCommissionInCents: priceInCents,
        currency: "BRL",
      },
    };

    const response = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": apiToken,
      },
      body: JSON.stringify(utmifyPayload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("UTMify API error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "UTMify request failed", details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
