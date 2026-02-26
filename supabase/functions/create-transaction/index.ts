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
    const secretKey = Deno.env.get("BEEHIVE_SECRET_KEY");
    if (!secretKey) {
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    // Handle status check for PIX polling
    if (body.checkStatus && body.transactionId) {
      const encoder = new TextEncoder();
      const encoded = encoder.encode(`${secretKey}:x`);
      const authToken = btoa(String.fromCharCode(...encoded));

      const statusRes = await fetch(`https://api.conta.paybeehive.com.br/v1/transactions/${body.transactionId}`, {
        headers: { Authorization: `Basic ${authToken}` },
      });
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

    // Validate customer
    if (!customer.name || !customer.email) {
      return new Response(
        JSON.stringify({ error: "Customer name and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const postbackUrl = `${supabaseUrl}/functions/v1/beehive-webhook`;

    // Build transaction payload
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

    // Basic auth: secret_key:x -> base64 (using TextEncoder to handle all characters)
    const encoder = new TextEncoder();
    const encoded = encoder.encode(`${secretKey}:x`);
    const authToken = btoa(String.fromCharCode(...encoded));

    const response = await fetch("https://api.conta.paybeehive.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authToken}`,
      },
      body: JSON.stringify(transactionPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Payment failed", details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
