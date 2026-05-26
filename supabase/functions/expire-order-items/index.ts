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

    const now = new Date().toISOString().split("T")[0];

    // Find all order_items that are pending_use and past redeem_end_date
    const { data: expiredItems, error: fetchError } = await supabase
      .from("order_items")
      .select("id")
      .eq("status", "pending_use")
      .not("redeem_end_date", "is", null)
      .lt("redeem_end_date", now);

    if (fetchError) {
      throw new Error(`Failed to fetch expired items: ${fetchError.message}`);
    }

    if (!expiredItems || expiredItems.length === 0) {
      return new Response(
        JSON.stringify({ message: "No items to expire", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const ids = expiredItems.map((item) => item.id);

    const { error: updateError } = await supabase
      .from("order_items")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .in("id", ids);

    if (updateError) {
      throw new Error(`Failed to update expired items: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ message: `Expired ${ids.length} items`, count: ids.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Expire check error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
