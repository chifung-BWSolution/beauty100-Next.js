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
            name: item.name || "Treatment",
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    // Calculate total for order record
    const totalAmount = line_items.reduce(
      (sum: number, li: any) => sum + li.price_data.unit_amount * li.quantity,
      0
    );

    if (totalAmount <= 0) {
      throw new Error("Invalid total amount");
    }

    // Create Stripe Checkout Session with ui_mode: "custom"
    const session = await stripe.checkout.sessions.create({
      ui_mode: "custom",
      mode: "payment",
      line_items,
      currency: "hkd",
      payment_method_types: ["card"],
      return_url: return_url || undefined,
      metadata: {
        member_id: user.id,
        customer_email: customer_email || user.email || "",
      },
      ...(customer_email ? { customer_email } : {}),
    });

    // Create order record in Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        member_id: user.id,
        stripe_payment_intent_id: session.payment_intent || session.id,
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
        sessionId: session.id,
        orderId: order.id,
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
