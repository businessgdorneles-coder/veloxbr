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
    const body = await req.json();
    const { customerName, amount, paymentMethod, product, city, notificationType } = body;

    let webhookUrl: string;
    if (notificationType === "pix_paid") {
      webhookUrl = "https://api.pushcut.io/fpGGxdRPpz8LT_ltAUhgw/notifications/PIX%20PAGO%20%E2%9C%85";
    } else if (notificationType === "card_paid") {
      webhookUrl = "https://api.pushcut.io/fpGGxdRPpz8LT_ltAUhgw/notifications/Algu%C3%A9m%20pagou%20no%20cart%C3%A3o%20";
    } else {
      webhookUrl = "https://api.pushcut.io/fpGGxdRPpz8LT_ltAUhgw/notifications/Venda%20Gerada%20%F0%9F%92%85";
    }

    const methodLabel = paymentMethod === "pix" ? "PIX" : "Cartão de Crédito";
    const amountFormatted = (amount / 100).toFixed(2).replace(".", ",");

    let title: string;
    let text: string;

    if (notificationType === "pix_generated") {
      title = `🔔 PIX Gerado! R$ ${amountFormatted}`;
      text = `${customerName} (${city || "Brasil"}) gerou um PIX para ${product}. Aguardando pagamento...`;
    } else if (notificationType === "pix_paid") {
      title = `PIX PAGO ✅ R$ ${amountFormatted}`;
      text = `${customerName} (${city || "Brasil"}) confirmou o pagamento via PIX de ${product}!`;
    } else {
      title = `💳 Cartão Aprovado! R$ ${amountFormatted}`;
      text = `${customerName} (${city || "Brasil"}) comprou ${product} via ${methodLabel}!`;
    }

    const notificationBody = { title, text };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notificationBody),
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(
        JSON.stringify({ error: "Pushcut request failed", details: text }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
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
