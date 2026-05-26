import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (stripeWebhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        stripeWebhookSecret,
        undefined,
        cryptoProvider
      );
    } else {
      // For development without webhook secret, parse body directly
      event = JSON.parse(body);
    }

    console.log("Webhook event type:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);

        // Our orders table stores the checkout session ID as stripe_payment_intent_id
        // Try matching by session.id first, then by payment_intent
        let orderData = null;
        let fetchError = null;
        
        // First try matching by session ID (what we store in create-payment-intent)
        const { data: orderBySession, error: err1 } = await supabase
          .from("orders")
          .select("*")
          .eq("stripe_payment_intent_id", session.id)
          .eq("status", "pending")
          .single();

        if (orderBySession) {
          orderData = orderBySession;
        } else if (session.payment_intent) {
          // Fallback: try matching by payment_intent ID
          const { data: orderByPi, error: err2 } = await supabase
            .from("orders")
            .select("*")
            .eq("stripe_payment_intent_id", session.payment_intent)
            .eq("status", "pending")
            .single();
          orderData = orderByPi;
          fetchError = err2;
        } else {
          fetchError = err1;
        }

        if (!orderData) {
          console.error("Failed to fetch order or already processed:", fetchError);
          break;
        }

        // Update order status to paid
        const { error } = await supabase
          .from("orders")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderData.id);

        if (error) {
          console.error("Failed to update order:", error);
          break;
        }

        // Decrement limited_quantity for each treatment in the order
        const orderItems = orderData.items as any[];
        if (orderItems && Array.isArray(orderItems)) {
          for (const item of orderItems) {
            if (item.treatment_id) {
              // Decrement limited_quantity (only if it's set / > 0)
              const { error: stockError } = await supabase.rpc(
                "decrement_treatment_stock",
                { p_treatment_id: item.treatment_id, p_quantity: item.quantity || 1 }
              );
              if (stockError) {
                console.error("Failed to decrement stock for treatment:", item.treatment_id, stockError);
              }
            }
          }
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session expired:", session.id);

        // Try both session.id and payment_intent
        const { error: err1 } = await supabase
          .from("orders")
          .update({
            status: "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", session.id);

        if (session.payment_intent) {
          await supabase
            .from("orders")
            .update({
              status: "expired",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", session.payment_intent);
        }

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);

        const { error } = await supabase
          .from("orders")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (error) {
          console.error("Failed to update order:", error);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", paymentIntent.id);

        const { error } = await supabase
          .from("orders")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (error) {
          console.error("Failed to update order:", error);
        }
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment canceled:", paymentIntent.id);

        const { error } = await supabase
          .from("orders")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (error) {
          console.error("Failed to update order:", error);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
