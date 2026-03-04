import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BEEHIVE_API = "https://api.conta.paybeehive.com.br/v1";
const TIMEOUT_MS = 30000; // 30s timeout
const MAX_RETRIES = 3;

function getAuthToken(secretKey: string): string {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(`${secretKey}:x`);
  return btoa(String.fromCharCode(...encoded));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attempt = 1
): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);

    // 4xx = client error, don't retry
    if (res.status >= 400 && res.status < 500) {
      return res;
    }

    // 5xx = server error, retry
    if (!res.ok) {
      throw new Error(`Gateway ${res.status}`);
    }

    // Validate response is JSON before returning
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error(`⚠️ Non-JSON response (attempt ${attempt}):`, text.substring(0, 300));
      throw new Error("Gateway returned non-JSON response");
    }

    return res;
  } catch (err) {
    console.error(`❌ Beehive API error (attempt ${attempt}/${MAX_RETRIES}):`, err.message);

    if (attempt >= MAX_RETRIES) {
      throw new Error(`Gateway unavailable after ${MAX_RETRIES} attempts: ${err.message}`);
    }

    // Exponential backoff: 1s, 2s, 4s
    const delay = 1000 * Math.pow(2, attempt - 1);
    await new Promise((r) => setTimeout(r, delay));
    return fetchWithRetry(url, options, attempt + 1);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const secretKey = Deno.env.get("BEEHIVE_SECRET_KEY");
    if (!secretKey) {
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const authToken = getAuthToken(secretKey);

    // Handle status check for PIX polling
    if (body.checkStatus && body.transactionId) {
      const statusRes = await fetchWithRetry(
        `${BEEHIVE_API}/transactions/${body.transactionId}`,
        { headers: { Authorization: `Basic ${authToken}` } }
      );
      const statusData = await statusRes.json();
      return new Response(JSON.stringify(statusData), {
        status: statusRes.ok ? 200 : statusRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate required fields
    const { amount, paymentMethod, customer, items, card, shipping, installments, pix } = body;

    if (!amount || !paymentMethod || !customer || !items) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount, paymentMethod, customer, items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!customer.name || !customer.email) {
      return new Response(
        JSON.stringify({ error: "Customer name and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const postbackUrl = `${supabaseUrl}/functions/v1/beehive-webhook`;

    const transactionPayload: Record<string, unknown> = {
      amount,
      paymentMethod,
      customer,
      items,
      traceable: true,
      postbackUrl,
    };

    if (paymentMethod === "credit_card") {
      if (!card || !card.hash) {
        return new Response(
          JSON.stringify({ error: "Card hash is required for credit card payments" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      transactionPayload.card = { hash: card.hash };
      transactionPayload.installments = installments || 1;
    }

    if (paymentMethod === "pix") {
      transactionPayload.pix = pix || { expiresInDays: 1 };
    }

    if (shipping) {
      transactionPayload.shipping = shipping;
    }

    console.log("📤 Creating transaction:", paymentMethod, "amount:", amount);

    const response = await fetchWithRetry(`${BEEHIVE_API}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authToken}`,
      },
      body: JSON.stringify(transactionPayload),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("❌ Failed to parse Beehive response:", parseErr);
      return new Response(
        JSON.stringify({ error: "Gateway returned invalid response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      console.error("❌ Beehive transaction failed:", response.status, JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Payment failed", details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For PIX, validate that QR code data is present
    if (paymentMethod === "pix") {
      const pixCode = data.pix?.qrcode || data.pix?.url || data.pix_copy_paste || data.qr_code_text;
      if (!pixCode) {
        console.error("⚠️ PIX response missing QR data:", JSON.stringify(data).substring(0, 500));
        return new Response(
          JSON.stringify({ error: "PIX QR code not generated. Please try again.", details: data }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log("✅ Transaction created:", data.id, "status:", data.status);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ create-transaction error:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
