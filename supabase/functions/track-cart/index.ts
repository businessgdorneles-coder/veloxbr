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

    const body = await req.json();

    // GET admin data
    if (body.action === "list") {
      const { statusFilter, dateFrom, dateTo, page = 1, pageSize = 50 } = body;
      let query = supabase
        .from("abandoned_carts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("payment_status", statusFilter);
      }
      if (dateFrom) {
        query = query.gte("created_at", dateFrom);
      }
      if (dateTo) {
        query = query.lte("created_at", dateTo + "T23:59:59.999Z");
      }

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ data, count }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // UPSERT cart data
    const {
      session_id, name, email, phone, cpf,
      brand, model, year, vehicle_type,
      selected_color, selected_kit, selected_texture,
      product_title, amount_cents, payment_method,
      payment_status, cep, city, state, address, user_agent,
    } = body;

    // Get IP from headers
    const ip_address =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Try to update existing session first
    const { data: existing } = await supabase
      .from("abandoned_carts")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();

    const record: Record<string, unknown> = {
      session_id,
      payment_status: payment_status || "cart_started",
      ip_address,
    };

    // Only set fields that are provided (not undefined)
    if (name !== undefined) record.name = name;
    if (email !== undefined) record.email = email;
    if (phone !== undefined) record.phone = phone;
    if (cpf !== undefined) record.cpf = cpf;
    if (brand !== undefined) record.brand = brand;
    if (model !== undefined) record.model = model;
    if (year !== undefined) record.year = year;
    if (vehicle_type !== undefined) record.vehicle_type = vehicle_type;
    if (selected_color !== undefined) record.selected_color = selected_color;
    if (selected_kit !== undefined) record.selected_kit = selected_kit;
    if (selected_texture !== undefined) record.selected_texture = selected_texture;
    if (product_title !== undefined) record.product_title = product_title;
    if (amount_cents !== undefined) record.amount_cents = amount_cents;
    if (payment_method !== undefined) record.payment_method = payment_method;
    if (cep !== undefined) record.cep = cep;
    if (city !== undefined) record.city = city;
    if (state !== undefined) record.state = state;
    if (address !== undefined) record.address = address;
    if (user_agent !== undefined) record.user_agent = user_agent;

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from("abandoned_carts")
        .update(record)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from("abandoned_carts")
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
