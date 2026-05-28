import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-03-31.basil",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Verify user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("Missing session_id");
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Verify that this session belongs to the requesting user
    // Check via metadata or by matching the order in our DB
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_payment_intent_id", session_id)
      .eq("member_id", user.id)
      .single();

    if (!order) {
      // Also try matching by payment_intent
      const { data: orderByPi } = await supabase
        .from("orders")
        .select("*")
        .eq("stripe_payment_intent_id", session.payment_intent)
        .eq("member_id", user.id)
        .single();

      if (!orderByPi) {
        throw new Error("Order not found");
      }
    }

    // Return the actual payment status from Stripe
    const result: any = {
      status: session.status, // "open", "complete", "expired"
      payment_status: session.payment_status, // "paid", "unpaid", "no_payment_required"
      customer_email: session.customer_details?.email || session.customer_email,
    };

    // Fetch order_number from our DB to return to the client
    const orderForNumber = order || (await (async () => {
      if (session.payment_intent) {
        const { data } = await supabase
          .from("orders")
          .select("order_number")
          .eq("stripe_payment_intent_id", session.payment_intent as string)
          .eq("member_id", user.id)
          .single();
        return data;
      }
      return null;
    })());
    if (orderForNumber?.order_number) {
      result.order_number = orderForNumber.order_number;
    }

    // If the session is complete AND paid, update the order status in our DB
    // (in case webhook hasn't fired yet)
    if (session.status === "complete" && session.payment_status === "paid") {
      // Try matching by session_id first (what we store), then by payment_intent
      let updatedOrder = null;

      const { data: updatedBySession } = await supabase
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_payment_intent_id", session_id)
        .eq("status", "pending")
        .select()
        .single();

      updatedOrder = updatedBySession;

      if (!updatedOrder && session.payment_intent) {
        const { data: updatedByPi } = await supabase
          .from("orders")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", session.payment_intent)
          .eq("status", "pending")
          .select()
          .single();

        updatedOrder = updatedByPi;
      }

      // Decrement stock for each treatment in the order (in case webhook hasn't done it)
      if (updatedOrder && updatedOrder.items && Array.isArray(updatedOrder.items)) {
        for (const item of updatedOrder.items as any[]) {
          if (item.treatment_id) {
            const { error: stockError } = await supabase.rpc(
              "decrement_treatment_stock",
              { p_treatment_id: item.treatment_id, p_quantity: item.quantity || 1 }
            );
            if (stockError) {
              console.error("Failed to decrement stock:", item.treatment_id, stockError);
            }
          }
        }
      }
    }

    // If declined / unpaid, mark as failed
    if (session.status === "complete" && session.payment_status === "unpaid") {
      // Try session_id first, then payment_intent
      const { data: failedBySession } = await supabase
        .from("orders")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_payment_intent_id", session_id)
        .eq("status", "pending")
        .select()
        .single();

      if (!failedBySession && session.payment_intent) {
        await supabase
          .from("orders")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", session.payment_intent)
          .eq("status", "pending");
      }
    }

    // Re-fetch order_number AFTER status updates (trigger generates it on paid)
    if (session.payment_status === "paid" && !result.order_number) {
      const { data: freshOrder } = await supabase
        .from("orders")
        .select("order_number")
        .or(`stripe_payment_intent_id.eq.${session_id}${session.payment_intent ? `,stripe_payment_intent_id.eq.${session.payment_intent}` : ''}`)
        .eq("member_id", user.id)
        .not("order_number", "is", null)
        .limit(1)
        .single();
      if (freshOrder?.order_number) {
        result.order_number = freshOrder.order_number;
      }
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
