import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to identify the user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "未授權" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Verify the user's token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "無效的登入憑證" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { order_item_id, qr_secret } = await req.json();

    if (!order_item_id || !qr_secret) {
      return new Response(
        JSON.stringify({ error: "缺少必要參數" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 1. Find the QR code and get the salon_profile_id
    const { data: qrCode, error: qrError } = await supabase
      .from("salon_qr_codes")
      .select("salon_profile_id, is_active")
      .eq("qr_secret", qr_secret)
      .single();

    if (qrError || !qrCode) {
      return new Response(
        JSON.stringify({ error: "無效的QR Code" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!qrCode.is_active) {
      return new Response(
        JSON.stringify({ error: "此QR Code已停用" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 2. Find the order item
    const { data: orderItem, error: itemError } = await supabase
      .from("order_items")
      .select("*")
      .eq("id", order_item_id)
      .eq("member_id", user.id)
      .single();

    if (itemError || !orderItem) {
      return new Response(
        JSON.stringify({ error: "找不到此訂單項目" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // 3. Check status - must be 'pending_use'
    if (orderItem.status !== "pending_use") {
      const statusMessages: Record<string, string> = {
        redeemed: "此療程已經兌換過了",
        expired: "此療程已過期",
        settled: "此療程已結算",
        refunded: "此療程已退款",
      };
      return new Response(
        JSON.stringify({ error: statusMessages[orderItem.status] || "此療程無法兌換" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 4. Check if within redeem period
    const now = new Date();
    if (orderItem.redeem_start_date && new Date(orderItem.redeem_start_date) > now) {
      return new Response(
        JSON.stringify({ error: "兌換期尚未開始" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    if (orderItem.redeem_end_date && new Date(orderItem.redeem_end_date) < now) {
      // Auto-expire
      await supabase
        .from("order_items")
        .update({ status: "expired", updated_at: now.toISOString() })
        .eq("id", order_item_id);

      return new Response(
        JSON.stringify({ error: "此療程已過期" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 5. Verify the QR code belongs to a salon that is valid for this treatment
    // The salon_profile_id in order_item should match the QR code's salon
    // OR check the treatment's salon_profile_ids array
    const qrSalonId = qrCode.salon_profile_id;
    
    let validSalon = false;
    
    // Check if the order item's salon_profile_id matches
    if (orderItem.salon_profile_id && orderItem.salon_profile_id === qrSalonId) {
      validSalon = true;
    }
    
    // Also check the treatment's salon_profile_ids array
    if (!validSalon && orderItem.treatment_id) {
      const { data: treatment } = await supabase
        .from("treatments")
        .select("salon_profile_id, salon_profile_ids")
        .eq("id", orderItem.treatment_id)
        .single();

      if (treatment) {
        if (treatment.salon_profile_id === qrSalonId) {
          validSalon = true;
        }
        if (treatment.salon_profile_ids && Array.isArray(treatment.salon_profile_ids)) {
          if (treatment.salon_profile_ids.includes(qrSalonId)) {
            validSalon = true;
          }
        }
      }
    }

    if (!validSalon) {
      return new Response(
        JSON.stringify({ error: "此QR Code不屬於該療程的適用美容院" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 6. All checks passed - redeem the treatment
    const { error: updateError } = await supabase
      .from("order_items")
      .update({
        status: "redeemed",
        redeemed_at: now.toISOString(),
        salon_profile_id: qrSalonId,
        updated_at: now.toISOString(),
      })
      .eq("id", order_item_id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "兌換失敗，請稍後再試" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // 7. Auto-create/update payout record
    try {
      const amount = (orderItem.unit_price || 0) * (orderItem.quantity || 1);
      const day = now.getDate();
      let periodStart: Date;
      if (day < 7) {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        periodStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }
      const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);

      const periodStartStr = periodStart.toISOString().split("T")[0];
      const periodEndStr = periodEnd.toISOString().split("T")[0];

      // Find existing payout for this salon + period
      const { data: existingPayout } = await supabase
        .from("payouts")
        .select("id")
        .eq("salon_profile_id", qrSalonId)
        .eq("period_start", periodStartStr)
        .eq("period_end", periodEndStr)
        .maybeSingle();

      let payoutId: string;

      if (existingPayout) {
        payoutId = existingPayout.id;
      } else {
        const { data: newPayout, error: payoutInsertErr } = await supabase
          .from("payouts")
          .insert({
            salon_profile_id: qrSalonId,
            period_start: periodStartStr,
            period_end: periodEndStr,
            total_amount: 0,
            platform_fee: 0,
            net_amount: 0,
            item_count: 0,
            status: "pending",
          })
          .select("id")
          .single();

        if (payoutInsertErr || !newPayout) {
          console.error("Failed to create payout:", payoutInsertErr);
          // Don't fail the redeem - payout can be backfilled later
        }
        payoutId = newPayout?.id || "";
      }

      if (payoutId) {
        // Insert payout item
        await supabase
          .from("payout_items")
          .insert({
            payout_id: payoutId,
            order_item_id: order_item_id,
            amount: amount,
          })
          .select()
          .maybeSingle();

        // Update order_item with payout_id
        await supabase
          .from("order_items")
          .update({ payout_id: payoutId })
          .eq("id", order_item_id);

        // Recalculate payout totals
        const { data: itemsSum } = await supabase
          .from("payout_items")
          .select("amount")
          .eq("payout_id", payoutId);

        const totalAmount = (itemsSum || []).reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
        const itemCount = (itemsSum || []).length;

        await supabase
          .from("payouts")
          .update({
            total_amount: totalAmount,
            item_count: itemCount,
            updated_at: now.toISOString(),
          })
          .eq("id", payoutId);
      }
    } catch (payoutErr) {
      console.error("Payout creation error (non-fatal):", payoutErr);
    }

    // Get salon name for the response
    const { data: salonData } = await supabase
      .from("salon_profiles")
      .select("salon_name")
      .eq("id", qrSalonId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        message: "兌換成功！",
        salon_name: salonData?.salon_name || "",
        redeemed_at: now.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Redeem error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "伺服器錯誤" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
