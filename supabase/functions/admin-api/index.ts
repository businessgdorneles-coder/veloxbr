import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    const body = await req.json();
    const { action } = body;

    // ── Init admin (one-time setup) ──
    if (action === "init-admin") {
      const { email, password } = body;
      // Create user via admin API
      const { data: userData, error: signupErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (signupErr) {
        // If user already exists, just ensure role
        if (signupErr.message?.includes("already been registered")) {
          const { data: users } = await adminClient.auth.admin.listUsers();
          const existing = users?.users?.find((u: any) => u.email === email);
          if (existing) {
            await adminClient.from("user_roles").upsert({ user_id: existing.id, role: "admin" }, { onConflict: "user_id,role" });
            return json({ success: true, message: "Admin role ensured" });
          }
        }
        throw signupErr;
      }
      // Assign admin role
      await adminClient.from("user_roles").insert({ user_id: userData.user.id, role: "admin" });
      return json({ success: true, user_id: userData.user.id });
    }

    // ── Auth check for all other actions ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);

    const userId = claimsData.claims.sub as string;

    // Check admin role
    const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    // ── Dashboard stats ──
    if (action === "dashboard-stats") {
      const { data: stats } = await adminClient.from("abandoned_carts")
        .select("payment_status, amount_cents", { count: "exact" });
      
      const total = stats?.length || 0;
      const paid = stats?.filter((r: any) => r.payment_status === "paid") || [];
      const revenue = paid.reduce((sum: number, r: any) => sum + (r.amount_cents || 0), 0);
      
      const statusCounts: Record<string, number> = {};
      stats?.forEach((r: any) => {
        statusCounts[r.payment_status] = (statusCounts[r.payment_status] || 0) + 1;
      });

      return json({
        total,
        paid: paid.length,
        revenue,
        conversionRate: total > 0 ? ((paid.length / total) * 100).toFixed(2) : "0",
        statusCounts,
      });
    }

    // ── Records list (enhanced) ──
    if (action === "list-records") {
      const { statusFilter, dateFrom, dateTo, search, page = 1, pageSize = 25 } = body;
      let query = adminClient
        .from("abandoned_carts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") query = query.eq("payment_status", statusFilter);
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59.999Z");
      if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return json({ data, count });
    }

    // ── Export all records (no pagination) ──
    if (action === "export-records") {
      const { statusFilter, dateFrom, dateTo, search } = body;
      let query = adminClient
        .from("abandoned_carts")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") query = query.eq("payment_status", statusFilter);
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59.999Z");
      if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);

      // Fetch all records in batches
      const allData: any[] = [];
      let offset = 0;
      const batchSize = 1000;
      while (true) {
        const { data: batch } = await adminClient
          .from("abandoned_carts")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + batchSize - 1);
        if (!batch || batch.length === 0) break;
        allData.push(...batch);
        if (batch.length < batchSize) break;
        offset += batchSize;
      }
      return json({ data: allData });
    }

    // ── Site Content CRUD ──
    if (action === "get-content") {
      const { key } = body;
      if (key) {
        const { data } = await adminClient.from("site_content").select("*").eq("key", key).maybeSingle();
        return json({ data });
      }
      const { data } = await adminClient.from("site_content").select("*").order("key");
      return json({ data });
    }

    if (action === "upsert-content") {
      const { key, value } = body;
      const { data, error } = await adminClient.from("site_content")
        .upsert({ key, value }, { onConflict: "key" })
        .select().single();
      if (error) throw error;
      return json({ data });
    }

    // ── Site Reviews CRUD ──
    if (action === "list-reviews") {
      const { data } = await adminClient.from("site_reviews").select("*").order("sort_order");
      return json({ data });
    }

    if (action === "upsert-review") {
      const { review } = body;
      const { data, error } = review.id
        ? await adminClient.from("site_reviews").update(review).eq("id", review.id).select().single()
        : await adminClient.from("site_reviews").insert(review).select().single();
      if (error) throw error;
      return json({ data });
    }

    if (action === "delete-review") {
      const { id } = body;
      await adminClient.from("site_reviews").delete().eq("id", id);
      return json({ success: true });
    }

    // ── Delete records ──
    if (action === "delete-records") {
      const { ids } = body;
      if (ids?.length) {
        await adminClient.from("abandoned_carts").delete().in("id", ids);
      }
      return json({ success: true });
    }

    if (action === "bulk-delete-old") {
      const { status, olderThanDays } = body;
      const cutoff = new Date(Date.now() - olderThanDays * 86400000).toISOString();
      await adminClient.from("abandoned_carts").delete().eq("payment_status", status).lt("created_at", cutoff);
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
});
