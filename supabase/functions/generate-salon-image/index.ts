import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { salonName, style } = await req.json();

    if (!salonName) {
      throw new Error("Salon name is required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY environment variable");
    }

    // Default prompt style based on the user's request
    const promptStyle =
      style ||
      "Elegant beauty salon cover image in soft pastel colors with floral botanical illustrations, line art of a woman's face, minimalist aesthetic, sage green and terracotta tones";

    const prompt = `A cover image for a beauty salon named "${salonName}". Style: ${promptStyle}. Minimal text, just the salon name elegantly integrated if possible, or no text at all. High quality, professional.`;

    // Call OpenAI DALL-E API
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      throw new Error(
        `OpenAI API error: ${data.error?.message || "Unknown error"}`
      );
    }

    const imageUrl = data.data[0].url;

    // Optional: Download the image and upload to Supabase Storage
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileName = `salon-covers/${Date.now()}-${salonName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(fileName, imageBlob, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Fallback to returning the OpenAI URL if upload fails
      return new Response(JSON.stringify({ imageUrl: imageUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("public-assets").getPublicUrl(fileName);

    return new Response(JSON.stringify({ imageUrl: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
