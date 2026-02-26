import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Beehive sends postback as form-urlencoded (Pagar.me format) or JSON
    let transactionId: string | null = null;
    let currentStatus: string | null = null;
    let rawBody: string | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await req.json();
      transactionId = json.id?.toString() || json.transaction?.id?.toString();
      currentStatus = json.current_status || json.status || json.transaction?.status;
      rawBody = JSON.stringify(json);
    } else {
      // Form-urlencoded (Pagar.me postback format)
      rawBody = await req.text();
      const params = new URLSearchParams(rawBody);
      transactionId = params.get("id") || params.get("transaction[id]");
      currentStatus = params.get("current_status") || params.get("transaction[status]");
    }

    console.log("📩 Beehive webhook received:", { transactionId, currentStatus, contentType });

    if (!transactionId || !currentStatus) {
      console.error("❌ Missing transactionId or status:", rawBody?.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Missing transactionId or status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only process paid/authorized events
    if (currentStatus !== "paid" && currentStatus !== "authorized") {
      console.log(`ℹ️ Ignoring status: ${currentStatus}`);
      return new Response(JSON.stringify({ ok: true, ignored: true, status: currentStatus }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up the order in abandoned_carts by transaction_id
    const { data: cart, error: cartError } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (cartError) {
      console.error("❌ DB lookup error:", cartError);
      return new Response(
        JSON.stringify({ error: "DB lookup failed", details: cartError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!cart) {
      console.warn("⚠️ No cart found for transaction_id:", transactionId);
      return new Response(
        JSON.stringify({ ok: true, warning: "No cart found for this transaction" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already processed
    if (cart.payment_status === "paid") {
      console.log("ℹ️ Already processed as paid, skipping duplicate");
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Found cart:", cart.id, "Customer:", cart.name, "UTMify Order:", cart.utmify_order_id);

    // Update cart status to paid
    await supabase
      .from("abandoned_carts")
      .update({ payment_status: "paid" })
      .eq("id", cart.id);

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const priceInCents = cart.amount_cents || 0;
    const kitLabel = cart.product_title || "Tapete Bandeja 3D";

    // Fire UTMify paid event
    const utmifyToken = Deno.env.get("UTMIFY_API_TOKEN");
    if (utmifyToken && cart.utmify_order_id) {
      const utmifyPayload = {
        orderId: cart.utmify_order_id,
        platform: "VeloxBR",
        paymentMethod: cart.payment_method === "credit_card" ? "credit_card" : "pix",
        status: "paid",
        createdAt: cart.created_at?.replace("T", " ").slice(0, 19) || now,
        approvedDate: now,
        refundedAt: null,
        customer: {
          name: cart.name || "",
          email: cart.email || "",
          phone: cart.phone || null,
          document: cart.cpf || null,
          country: "BR",
        },
        products: [
          {
            id: cart.selected_kit === "completo" ? "kit-completo" : "kit-interno",
            name: kitLabel,
            planId: null,
            planName: null,
            quantity: 1,
            priceInCents,
          },
        ],
        trackingParameters: {
          src: cart.src || null,
          sck: cart.sck || null,
          utm_source: cart.utm_source || null,
          utm_campaign: cart.utm_campaign || null,
          utm_medium: cart.utm_medium || null,
          utm_content: cart.utm_content || null,
          utm_term: cart.utm_term || null,
        },
        commission: {
          totalPriceInCents: priceInCents,
          gatewayFeeInCents: 0,
          userCommissionInCents: priceInCents,
          currency: "BRL",
        },
      };

      console.log("📤 Sending UTMify PAID (webhook):", JSON.stringify(utmifyPayload));

      try {
        const utmRes = await fetch("https://api.utmify.com.br/api-credentials/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-token": utmifyToken,
          },
          body: JSON.stringify(utmifyPayload),
        });
        const utmData = await utmRes.text();
        console.log("✅ UTMify webhook response:", utmRes.status, utmData);
      } catch (utmErr) {
        console.error("❌ UTMify webhook error:", utmErr);
      }
    } else {
      console.warn("⚠️ Missing UTMIFY_API_TOKEN or utmify_order_id, skipping UTMify");
    }

    // Fire notify-sale (pix_paid) via internal call
    try {
      const notifyUrl = `${supabaseUrl}/functions/v1/notify-sale`;
      await fetch(notifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          customerName: cart.name || "Cliente",
          amount: priceInCents,
          paymentMethod: "pix",
          product: kitLabel,
          city: cart.city || "Brasil",
          notificationType: "pix_paid",
        }),
      });
      console.log("✅ Notify-sale (pix_paid) sent via webhook");
    } catch (notifyErr) {
      console.error("❌ Notify-sale error:", notifyErr);
    }

    // Fire Meta CAPI Purchase event
    try {
      const metaUrl = `${supabaseUrl}/functions/v1/meta-events`;
      await fetch(metaUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          event_name: "Purchase",
          value: priceInCents / 100,
          currency: "BRL",
          email: cart.email || "",
          phone: cart.phone || "",
          name: cart.name || "",
          city: cart.city || "",
          state: cart.state || "",
          zip: cart.cep?.replace(/\D/g, "") || "",
          action_source: "system_generated",
        }),
      });
      console.log("✅ Meta Purchase event sent via webhook");
    } catch (metaErr) {
      console.error("❌ Meta event error:", metaErr);
    }

    // Fire TikTok CompletePayment event
    try {
      const ttUrl = `${supabaseUrl}/functions/v1/tiktok-events`;
      await fetch(ttUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          event: "CompletePayment",
          value: priceInCents / 100,
          currency: "BRL",
          email: cart.email || "",
          phone: cart.phone?.replace(/\D/g, "") || "",
          name: cart.name || "",
          city: cart.city || "",
          state: cart.state || "",
          zip: cart.cep?.replace(/\D/g, "") || "",
        }),
      });
      console.log("✅ TikTok event sent via webhook");
    } catch (ttErr) {
      console.error("❌ TikTok event error:", ttErr);
    }

    // Fire DiaLOG webhook
    try {
      const dialogWebhookUrl = Deno.env.get("DIALOG_WEBHOOK_URL");
      const dialogWebhookSecret = Deno.env.get("DIALOG_WEBHOOK_SECRET");

      if (dialogWebhookUrl && dialogWebhookSecret) {
        const dialogPayload = {
          order_id: cart.utmify_order_id || cart.id,
          status: "paid" as const,
          customer: {
            name: cart.name || "",
            email: cart.email || "",
            phone: cart.phone || "",
            address: cart.address || "",
            city: cart.city || "",
            state: cart.state || "",
            zip: cart.cep?.replace(/\D/g, "") || "",
          },
          products: [
            {
              name: kitLabel,
              quantity: 1,
              price: priceInCents / 100,
            },
          ],
        };

        const dialogBody = JSON.stringify(dialogPayload);
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(dialogWebhookSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(dialogBody));
        const signature = Array.from(new Uint8Array(signatureBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        const dialogRes = await fetch(dialogWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-webhook-signature": signature,
          },
          body: dialogBody,
        });
        console.log("✅ DiaLOG webhook sent:", dialogRes.status);
      } else {
        console.warn("⚠️ Missing DIALOG_WEBHOOK_URL or DIALOG_WEBHOOK_SECRET, skipping DiaLOG");
      }
    } catch (dialogErr) {
      console.error("❌ DiaLOG webhook error:", dialogErr);
    }

    return new Response(JSON.stringify({ ok: true, processed: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Beehive webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
