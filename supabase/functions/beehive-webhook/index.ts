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

    const contentType = req.headers.get("content-type") || "";
    let transactionId: string | null = null;
    let currentStatus: string | null = null;
    let rawBody: string | null = null;

    if (contentType.includes("application/json")) {
      const json = await req.json();
      rawBody = JSON.stringify(json);
      const type = json.type as string | undefined;

      if (type === "transfer") {
        // Transfers are not related to orders — just acknowledge
        console.log("📩 Transfer postback received, status:", json.data?.status);
        return new Response(JSON.stringify({ ok: true, ignored: true, type: "transfer" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (type === "checkout") {
        // Checkout postback: transaction is nested inside data.transaction
        const tx = json.data?.transaction;
        transactionId = tx?.id?.toString() ?? null;
        currentStatus = tx?.status ?? null;
      } else {
        // type === "transaction" (or legacy format without type field)
        // json.id = event ID, json.data.id = actual transaction ID
        transactionId = json.data?.id?.toString() ?? json.id?.toString() ?? null;
        currentStatus = json.data?.status ?? json.current_status ?? json.status ?? null;
      }

      console.log("📦 Beehive postback parsed:", {
        type,
        eventId: json.id,
        transactionId,
        currentStatus,
      });
    } else {
      // Form-urlencoded (legacy Pagar.me format)
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

    // If cart is missing address/customer data, fetch from Beehive transaction API
    if (!cart.city || !cart.address_street) {
      try {
        const secretKey = Deno.env.get("BEEHIVE_SECRET_KEY");
        if (secretKey) {
          const encoder = new TextEncoder();
          const encoded = encoder.encode(`${secretKey}:x`);
          const authToken = btoa(String.fromCharCode(...encoded));
          const txRes = await fetch(`https://api.conta.paybeehive.com.br/v1/transactions/${transactionId}`, {
            headers: { Authorization: `Basic ${authToken}` },
          });
          if (txRes.ok) {
            const txData = await txRes.json();
            const shipping = txData.shipping?.address || {};
            const customer = txData.customer || {};
            const updateFields: Record<string, unknown> = {};

            if (!cart.name && customer.name) updateFields.name = customer.name;
            if (!cart.email && customer.email) updateFields.email = customer.email;
            if (!cart.phone && customer.phone) updateFields.phone = customer.phone;
            if (!cart.cpf && customer.document?.number) updateFields.cpf = customer.document.number;
            if (!cart.city && shipping.city) updateFields.city = shipping.city;
            if (!cart.state && shipping.state) updateFields.state = shipping.state;
            if (!cart.cep && shipping.zipCode) updateFields.cep = shipping.zipCode;
            if (!cart.address_street && shipping.street) updateFields.address_street = shipping.street;
            if (!cart.address_number && shipping.streetNumber) updateFields.address_number = shipping.streetNumber;
            if (!cart.address_complement && shipping.complement) updateFields.address_complement = shipping.complement;
            if (!cart.neighborhood && shipping.neighborhood) updateFields.neighborhood = shipping.neighborhood;
            if (!cart.address) {
              const parts = [shipping.street, shipping.streetNumber].filter(Boolean).join(", ");
              const extra = [shipping.complement, shipping.neighborhood].filter(Boolean).join(" - ");
              updateFields.address = extra ? `${parts} - ${extra}` : parts;
            }

            if (Object.keys(updateFields).length > 0) {
              await supabase.from("abandoned_carts").update(updateFields).eq("id", cart.id);
              // Merge into cart object for downstream use
              Object.assign(cart, updateFields);
              console.log("📍 Enriched cart from Beehive transaction:", JSON.stringify(updateFields));
            }
          }
        }
      } catch (enrichErr) {
        console.error("⚠️ Failed to enrich cart from Beehive:", enrichErr);
      }
    }

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const priceInCents = cart.amount_cents || 0;
    const kitLabel = cart.product_title || "Tapete Bandeja 3D";

    // Generate utmify_order_id if missing (safety net)
    const utmifyOrderId = cart.utmify_order_id || `VELOX-WH-${Date.now()}`;

    // Update cart status to paid + ensure utmify_order_id is set
    await supabase
      .from("abandoned_carts")
      .update({ payment_status: "paid", utmify_order_id: utmifyOrderId })
      .eq("id", cart.id);

    // Fire all downstream integrations in parallel
    const utmifyToken = Deno.env.get("UTMIFY_API_TOKEN");

    const utmifyPayload = {
      orderId: utmifyOrderId,
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

    const integrationCalls: Promise<unknown>[] = [
      // Notify-sale
      fetch(`${supabaseUrl}/functions/v1/notify-sale`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceRoleKey}` },
        body: JSON.stringify({
          customerName: cart.name || "Cliente",
          amount: priceInCents,
          paymentMethod: cart.payment_method || "pix",
          product: kitLabel,
          city: cart.city || "Brasil",
          notificationType: "pix_paid",
        }),
      }).then(() => console.log("✅ Notify-sale sent")).catch((e) => console.error("❌ Notify-sale error:", e)),

      // Meta CAPI
      fetch(`${supabaseUrl}/functions/v1/meta-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceRoleKey}` },
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
      }).then(() => console.log("✅ Meta event sent")).catch((e) => console.error("❌ Meta event error:", e)),

      // TikTok
      fetch(`${supabaseUrl}/functions/v1/tiktok-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceRoleKey}` },
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
      }).then(() => console.log("✅ TikTok event sent")).catch((e) => console.error("❌ TikTok event error:", e)),
    ];

    // UTMify (conditional)
    if (utmifyToken) {
      console.log("📤 Sending UTMify PAID (webhook):", JSON.stringify(utmifyPayload));
      integrationCalls.push(
        fetch("https://api.utmify.com.br/api-credentials/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-token": utmifyToken },
          body: JSON.stringify(utmifyPayload),
        }).then(async (r) => console.log("✅ UTMify response:", r.status, await r.text()))
          .catch((e) => console.error("❌ UTMify error:", e))
      );
    } else {
      console.warn("⚠️ Missing UTMIFY_API_TOKEN, skipping UTMify");
    }

    await Promise.allSettled(integrationCalls);
    console.log("✅ All integrations fired in parallel");

    // Fire DiaLOG webhook
    try {
      const dialogWebhookUrl = Deno.env.get("DIALOG_WEBHOOK_URL");
      const dialogWebhookSecret = Deno.env.get("DIALOG_WEBHOOK_SECRET");

      if (dialogWebhookUrl && dialogWebhookSecret) {
        // Parse address components: prefer individual fields, fallback to parsing concatenated string
        // Concatenated format: "Rua X, 123 - Complemento - Bairro"
        let addrStreet = cart.address_street || "";
        let addrNumber = cart.address_number || "";
        let addrComplement = cart.address_complement || "";
        let addrNeighborhood = cart.neighborhood || "";

        if (!addrStreet && cart.address) {
          // Parse concatenated address: "Street, Number - Complement - Neighborhood"
          const raw = cart.address;
          const commaIdx = raw.indexOf(",");
          if (commaIdx > 0) {
            addrStreet = raw.substring(0, commaIdx).trim();
            const rest = raw.substring(commaIdx + 1).trim();
            const parts = rest.split(" - ").map((p: string) => p.trim());
            addrNumber = parts[0] || "S/N";
            if (parts.length === 3) {
              addrComplement = parts[1] || "";
              addrNeighborhood = parts[2] || "";
            } else if (parts.length === 2) {
              addrNeighborhood = parts[1] || "";
            }
          } else {
            addrStreet = raw;
            addrNumber = "S/N";
          }
        }

        const fullAddress = addrStreet
          ? `${addrStreet}, ${addrNumber || "S/N"}${addrComplement ? ` - ${addrComplement}` : ""}${addrNeighborhood ? ` - ${addrNeighborhood}` : ""}`
          : cart.address || "";

        const dialogPayload = {
          order_id: utmifyOrderId,
          status: "paid" as const,
          customer: {
            name: cart.name || "",
            email: cart.email || "",
            phone: cart.phone || "",
            document: cart.cpf || "",
            address: fullAddress || addrStreet || cart.address || "",
            street: addrStreet,
            number: addrNumber || "S/N",
            complement: addrComplement,
            neighborhood: addrNeighborhood,
            city: cart.city || "",
            state: cart.state || "",
            zip: cart.cep?.replace(/\D/g, "") || "",
            zipcode: cart.cep?.replace(/\D/g, "") || "",
            country: "BR",
          },
          shipping: {
            address: fullAddress || addrStreet || cart.address || "",
            street: addrStreet,
            number: addrNumber || "S/N",
            complement: addrComplement,
            neighborhood: addrNeighborhood,
            city: cart.city || "",
            state: cart.state || "",
            zip: cart.cep?.replace(/\D/g, "") || "",
            zipcode: cart.cep?.replace(/\D/g, "") || "",
            country: "BR",
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
        const dialogResText = await dialogRes.text();
        console.log("✅ DiaLOG webhook sent:", dialogRes.status, dialogResText);
        console.log("📦 DiaLOG payload sent:", JSON.stringify(dialogPayload.customer));
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
