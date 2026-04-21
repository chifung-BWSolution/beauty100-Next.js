import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization') || '';

    // ─── Fetch all beauty products from Shopify ─────────────────────────────
    let allProducts: any[] = [];
    let after: string | null = null;
    let hasNextPage = true;
    let pageCount = 0;

    while (hasNextPage && pageCount < 50) {
      const shopifyRes = await fetch(`${supabaseUrl}/functions/v1/supabase-functions-shopify-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
        },
        body: JSON.stringify({ type: 'beauty_products_all', after }),
      });

      if (!shopifyRes.ok) {
        throw new Error(`Shopify fetch failed: ${shopifyRes.status} ${await shopifyRes.text()}`);
      }

      const resData = await shopifyRes.json();
      const batch = resData?.products || resData?.data?.products || [];
      allProducts = [...allProducts, ...batch];
      const pageInfo = resData?.pageInfo || resData?.data?.pageInfo;
      hasNextPage = pageInfo?.hasNextPage || false;
      after = pageInfo?.endCursor || null;
      pageCount++;

      if (!hasNextPage) break;
    }

    if (allProducts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, synced: 0, message: 'No products found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const now = new Date().toISOString();
    const batchSize = 500;

    // ─── 1. Upsert into shopify_products_cache (keep existing behaviour) ────
    const cacheRows = allProducts.map((p: any) => ({
      id: String(p.id),
      title: p.title || null,
      vendor: p.vendor || null,
      handle: p.handle || null,
      status: p.status || null,
      product_type: p.product_type || null,
      tags: p.tags || null,
      image_src: p.image?.src || p.images?.[0]?.src || null,
      district_id: p.district_id || null,
      district_name: p.district_name || null,
      shopify_created_at: p.created_at || null,
      raw_data: p,
      synced_at: now,
      updated_at: now,
    }));

    for (let i = 0; i < cacheRows.length; i += batchSize) {
      const batch = cacheRows.slice(i, i + batchSize);
      const { error } = await supabase
        .from('shopify_products_cache')
        .upsert(batch, { onConflict: 'id' });
      if (error) throw new Error(`DB cache upsert error: ${error.message}`);
    }

    // ─── 2. Sync into salon_profiles ────────────────────────────────────────
    // Fetch existing salon_profiles keyed by shopify_product_id
    const { data: existingProfiles, error: profileFetchErr } = await supabase
      .from('salon_profiles')
      .select('id, shopify_product_id, salon_name, handle, tags, storefront_photo, district');

    if (profileFetchErr) throw new Error(`Profile fetch error: ${profileFetchErr.message}`);

    const existingMap = new Map<string, any>();
    (existingProfiles || []).forEach((p: any) => {
      if (p.shopify_product_id) {
        existingMap.set(p.shopify_product_id, p);
      }
    });

    let profilesUpdated = 0;
    let profilesInserted = 0;

    for (const p of allProducts) {
      const shopifyId = String(p.id);
      const imageSrc = p.image?.src || p.images?.[0]?.src || null;

      // Shopify-owned fields (always overwrite with latest from Shopify)
      const shopifyFields: Record<string, any> = {
        vendor: p.vendor || null,
        product_type: p.product_type || null,
        image_src: imageSrc,
        district_id: p.district_id || null,
        district_name: p.district_name || null,
        shopify_created_at: p.created_at || null,
        raw_data: p,
        synced_at: now,
        shopify_synced: true,
        shopify_sync_pending: false,
        updated_at: now,
      };

      if (existingMap.has(shopifyId)) {
        const existing = existingMap.get(shopifyId);

        // User-editable fields: only fill if currently empty/null
        const coalesceFields: Record<string, any> = {};
        if (!existing.salon_name) coalesceFields.salon_name = p.title || null;
        if (!existing.handle) coalesceFields.handle = p.handle || null;
        if (!existing.tags) coalesceFields.tags = p.tags || null;
        if (!existing.storefront_photo) coalesceFields.storefront_photo = imageSrc;
        if (!existing.district) coalesceFields.district = p.district_name || null;

        const { error } = await supabase
          .from('salon_profiles')
          .update({ ...shopifyFields, ...coalesceFields })
          .eq('id', existing.id);

        if (error) {
          console.error(`Profile update error for ${existing.id}: ${error.message}`);
        } else {
          profilesUpdated++;
        }
      } else {
        // Insert new salon profile from Shopify product
        const { error } = await supabase
          .from('salon_profiles')
          .insert({
            shopify_product_id: shopifyId,
            salon_name: p.title || null,
            vendor: p.vendor || null,
            handle: p.handle || null,
            product_type: p.product_type || null,
            tags: p.tags || null,
            image_src: imageSrc,
            storefront_photo: imageSrc,
            district_id: p.district_id || null,
            district_name: p.district_name || null,
            district: p.district_name || null,
            shopify_created_at: p.created_at || null,
            raw_data: p,
            synced_at: now,
            shopify_synced: true,
            shopify_sync_pending: false,
            is_active: true,
            created_date: p.created_at || now,
            updated_at: now,
          });

        if (error) {
          console.error(`Profile insert error for ${shopifyId}: ${error.message}`);
        } else {
          profilesInserted++;
        }
      }
    }

    // ─── 3. Log the sync ────────────────────────────────────────────────────
    await supabase.from('shopify_sync_log').insert({
      product_count: allProducts.length,
      status: 'success',
    });

    return new Response(
      JSON.stringify({
        success: true,
        synced: allProducts.length,
        profiles_updated: profilesUpdated,
        profiles_inserted: profilesInserted,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Sync error:', error);

    // Try to log the error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase.from('shopify_sync_log').insert({
        product_count: 0,
        status: 'error',
        error: error.message,
      });
    } catch (_) { /* ignore logging errors */ }

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
