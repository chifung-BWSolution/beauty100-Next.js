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

    const { items, customer_email, customer_name, return_url } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided");
    }

    // Build line_items for Checkout Session
    const line_items = items.map((item: any) => {
      const price = item.promo_price || item.original_price;
      const unitAmount = Math.round(Number(price) * 100);
      return {
        price_data: {
          currency: "hkd",
          product_data: {
            name: item.name || "療程",
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    // Calculate total for order record
    const totalAmount = items.reduce((sum: number, item: any) => {
      const price = item.promo_price || item.original_price;
      return sum + Math.round(Number(price) * 100) * item.quantity;
    }, 0);

    if (totalAmount <= 0) {
      throw new Error("Invalid total amount");
    }

    // Check for existing pending order for this user with the same items/amount (prevent duplicates)
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("member_id", user.id)
      .eq("status", "pending")
      .eq("total_amount", totalAmount)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // If there's a recent pending order (created within last 30 minutes) with a valid client secret, reuse it
    if (existingOrder) {
      const createdAt = new Date(existingOrder.created_at).getTime();
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      
      // If order was created very recently (within 2 min), always reuse to prevent race conditions
      // even if stripe session hasn't been verified yet
      if (createdAt > twoMinutesAgo && existingOrder.stripe_client_secret && existingOrder.stripe_payment_intent_id) {
        return new Response(
          JSON.stringify({
            clientSecret: existingOrder.stripe_client_secret,
            orderId: existingOrder.id,
            sessionId: existingOrder.stripe_payment_intent_id,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      if (existingOrder.stripe_client_secret && existingOrder.stripe_payment_intent_id && createdAt > thirtyMinutesAgo) {
        // Verify the Stripe session is still open (not completed or expired)
        try {
          const stripeSession = await stripe.checkout.sessions.retrieve(existingOrder.stripe_payment_intent_id);
          if (stripeSession.status === "open") {
            // Session is still valid, reuse it
            return new Response(
              JSON.stringify({
                clientSecret: existingOrder.stripe_client_secret,
                orderId: existingOrder.id,
                sessionId: existingOrder.stripe_payment_intent_id,
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              }
            );
          } else {
            // Session is complete or expired, mark order accordingly
            const newStatus = stripeSession.status === "complete" ? "completed" : "expired";
            await supabase
              .from("orders")
              .update({ status: newStatus })
              .eq("id", existingOrder.id);
          }
        } catch (e) {
          // If we can't retrieve the session, mark the order as expired and create a new one
          await supabase
            .from("orders")
            .update({ status: "expired" })
            .eq("id", existingOrder.id);
        }
      }
    }

    // Create Stripe Checkout Session with ui_mode: embedded
    // Do NOT specify payment_method_types - let Stripe automatically show all enabled methods
    // (card, Apple Pay, Google Pay, Alipay, WeChat Pay, etc.) based on Dashboard settings
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items,
      customer_email: customer_email || user.email || undefined,
      return_url: return_url || `${req.headers.get("origin") || ""}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        member_id: user.id,
        customer_email: customer_email || user.email || "",
        customer_name: customer_name || "",
      },
    });

    // Create order record in Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        member_id: user.id,
        stripe_payment_intent_id: session.id,
        stripe_client_secret: session.client_secret,
        status: "pending",
        total_amount: totalAmount,
        currency: "hkd",
        items: items,
        customer_email: customer_email || user.email || null,
        customer_name: customer_name || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order record");
    }

    return new Response(
      JSON.stringify({
        clientSecret: session.client_secret,
        orderId: order.id,
        sessionId: session.id,
      }),
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
