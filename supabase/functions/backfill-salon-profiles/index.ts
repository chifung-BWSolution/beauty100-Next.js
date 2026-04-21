import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ═══════════════════════════════════════════════════════════════════════════════
// METAFIELD MAPPING - Shopify metafield namespace.key -> salon_profile column
// ═══════════════════════════════════════════════════════════════════════════════

const metafieldMapping: Record<string, string> = {
  // All metafields use namespace "custom" with key = table field name
  // Chinese display names shown in comments for reference only

  // Address (地址)
  'custom.address': 'address',

  // Contact number (Contact_number - display name has capital C but key is contact_number)
  'custom.contact_number': 'contact_number',

  // Contact person
  'custom.contact_person': 'contact_person',

  // Email (email)
  'custom.email': 'email',

  // Website
  'custom.website': 'website',

  // WhatsApp
  'custom.whatsapp_number': 'whatsapp_number',

  // Description
  'custom.description': 'description',

  // Opening hours (星期一=Mon, 星期二=Tue, ... 星期日=Sun)
  'custom.office_hr_mon': 'office_hr_mon',
  'custom.office_hr_tue': 'office_hr_tue',
  'custom.office_hr_wed': 'office_hr_wed',
  'custom.office_hr_thu': 'office_hr_thu',
  'custom.office_hr_fri': 'office_hr_fri',
  'custom.office_hr_sat': 'office_hr_sat',
  'custom.office_hr_sun': 'office_hr_sun',

  // SEO
  'custom.seo_title': 'seo_title',
  'custom.seo_description': 'seo_description',
  // Also check Shopify's built-in global SEO metafields
  'global.title_tag': 'seo_title',
  'global.description_tag': 'seo_description',

  // District (district)
  'custom.district': 'district',

  // Product list (product_list)
  'custom.product_list': 'product_list',
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHOPIFY API HELPERS - call directly instead of going through another edge fn
// ═══════════════════════════════════════════════════════════════════════════════

async function getShopifyCredentials(supabase: any): Promise<{ accessToken: string; shopDomain: string }> {
  const { data: config } = await supabase
    .from('shopify_configs')
    .select('access_token, shop_domain')
    .eq('key', 'shopify_token')
    .single();

  if (config?.access_token) {
    const shopDomain = config.shop_domain || Deno.env.get('SHOPIFY_STORE_URL') || '';
    const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (cleanDomain) {
      return { accessToken: config.access_token, shopDomain: cleanDomain };
    }
  }

  const envToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
  const envDomain = Deno.env.get('SHOPIFY_STORE_URL');
  if (envToken && envDomain) {
    return {
      accessToken: envToken,
      shopDomain: envDomain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    };
  }

  throw new Error('No Shopify credentials found');
}

async function shopifyRest(shopDomain: string, accessToken: string, endpoint: string, maxRetries = 3): Promise<any> {
  const url = `https://${shopDomain}/admin/api/2024-01/${endpoint}`;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    });

    if (response.status === 429) {
      const retryAfter = parseFloat(response.headers.get('Retry-After') || '2');
      console.warn(`Rate limited (attempt ${attempt + 1}/${maxRetries + 1}), waiting ${retryAfter}s...`);
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      continue;
    }

    if (response.status === 404) {
      throw new Error(`Shopify 404: Product not found`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (attempt < maxRetries && (response.status >= 500 || response.status === 503)) {
        console.warn(`Shopify ${response.status} (attempt ${attempt + 1}), retrying in 2s...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      throw new Error(`Shopify ${response.status}: ${errorText.substring(0, 200)}`);
    }

    return response.json();
  }

  throw new Error(`Shopify: max retries (${maxRetries}) exhausted for ${endpoint}`);
}

/**
 * Extract fields from Shopify REST API product data + metafields.
 */
function extractFieldsFromShopify(product: any, metafields: any[]): Record<string, string> {
  const result: Record<string, string> = {};
  if (!product && (!metafields || metafields.length === 0)) return result;

  // ─── Extract product-level fields ─────────────────────────────────────
  if (product?.title && typeof product.title === 'string' && product.title.trim()) {
    result.salon_name = product.title.trim();
  }

  if (product?.handle && typeof product.handle === 'string' && product.handle.trim()) {
    result.handle = product.handle.trim();
  }

  if (product?.tags && typeof product.tags === 'string' && product.tags.trim()) {
    result.tags = product.tags.trim();
    // Also parse tags into selected_tags array (JSON)
    const tagArray = product.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    if (tagArray.length > 0) {
      result._selected_tags = JSON.stringify(tagArray);
      // highlight_tags: use first 3 tags as highlights (users can customize later)
      result._highlight_tags = JSON.stringify(tagArray.slice(0, 3));
    }
  }

  if (product?.body_html && typeof product.body_html === 'string' && product.body_html.trim()) {
    result.description = product.body_html;
  }

  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    result._storefront_photo = product.images[0]?.src || '';
  } else if (product?.image?.src) {
    result._storefront_photo = product.image.src;
  }

  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    result._product_media = JSON.stringify(product.images.map((img: any) => img.src).filter(Boolean));
  }

  // ─── SEO: extract from Shopify's built-in product SEO fields ──────────
  // In the REST API response, Shopify stores SEO title/description as
  // `metafields_global_title_tag` and `metafields_global_description_tag` on the product object
  // when accessed via the product endpoint directly. These are Shopify's native SEO fields
  // (shown in the Shopify admin "Search engine listing" section).
  if (product?.metafields_global_title_tag && typeof product.metafields_global_title_tag === 'string' && product.metafields_global_title_tag.trim()) {
    result.seo_title = product.metafields_global_title_tag.trim();
  }
  if (product?.metafields_global_description_tag && typeof product.metafields_global_description_tag === 'string' && product.metafields_global_description_tag.trim()) {
    result.seo_description = product.metafields_global_description_tag.trim();
  }

  // Also try the product title as SEO title fallback if nothing else
  if (!result.seo_title && product?.title && typeof product.title === 'string' && product.title.trim()) {
    result.seo_title = product.title.trim();
  }

  if (metafields && Array.isArray(metafields)) {
    for (const mf of metafields) {
      const fullKey = `${mf.namespace}.${mf.key}`;
      const profileColumn = metafieldMapping[fullKey];
      if (profileColumn && mf.value != null && String(mf.value).trim()) {
        if (profileColumn === 'description' && result.description) continue;
        // Metafield SEO values override the product-level ones (they are more specific)
        if ((profileColumn === 'seo_title' || profileColumn === 'seo_description') && result[profileColumn]) {
          // Only override if the metafield value is different/more specific
          result[profileColumn] = String(mf.value).trim();
          continue;
        }
        result[profileColumn] = String(mf.value);
      }

      // Try to parse JSON opening hours (some stores store as single JSON object)
      if (!profileColumn && mf.value && (
        mf.key === 'opening_hours' || mf.key === 'office_hours' ||
        mf.key === 'business_hours' || mf.key === 'hours'
      )) {
        try {
          const hours = typeof mf.value === 'string' ? JSON.parse(mf.value) : mf.value;
          if (typeof hours === 'object' && hours !== null) {
            const dayMap: Record<string, string> = {
              mon: 'office_hr_mon', monday: 'office_hr_mon',
              tue: 'office_hr_tue', tuesday: 'office_hr_tue',
              wed: 'office_hr_wed', wednesday: 'office_hr_wed',
              thu: 'office_hr_thu', thursday: 'office_hr_thu',
              fri: 'office_hr_fri', friday: 'office_hr_fri',
              sat: 'office_hr_sat', saturday: 'office_hr_sat',
              sun: 'office_hr_sun', sunday: 'office_hr_sun',
            };
            for (const [dayKey, col] of Object.entries(dayMap)) {
              const val = hours[dayKey] || hours[dayKey.charAt(0).toUpperCase() + dayKey.slice(1)];
              if (val && !result[col]) {
                result[col] = String(val);
              }
            }
          }
        } catch {
          // Not JSON, try as plain text and set as Monday hours for now
        }
      }
    }
  }

  return result;
}

const isFieldEmpty = (v: any) => v === null || v === undefined || v === '' ||
  (typeof v === 'string' && v.trim() === '');

function extractNumericId(shopifyProductId: string): string {
  const raw = String(shopifyProductId);
  const slashIdx = raw.lastIndexOf('/');
  return slashIdx >= 0 ? raw.substring(slashIdx + 1) : raw;
}

const BATCH_SIZE = 25;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'analyze';
    const offset = body.offset || 0;
    const forceOverwrite = body.force_overwrite === true;
    const batchSize = body.batch_size || BATCH_SIZE;

    let shopDomain = '';
    let accessToken = '';
    if (mode === 'backfill' || mode === 'backfill_batch' || mode === 'debug' || mode === 'discover' || mode === 'diagnose') {
      const creds = await getShopifyCredentials(supabase);
      shopDomain = creds.shopDomain;
      accessToken = creds.accessToken;
    }

    // ─── Fetch all salon profiles ─────────────────────────────────────────
    const PAGE_SIZE = 1000;
    let allProfiles: any[] = [];
    let fromIdx = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('salon_profiles')
        .select('*')
        .range(fromIdx, fromIdx + PAGE_SIZE - 1);

      if (error) throw new Error(`Fetch error: ${error.message}`);
      if (data && data.length > 0) {
        allProfiles = [...allProfiles, ...data];
        fromIdx += PAGE_SIZE;
        hasMore = data.length === PAGE_SIZE;
      } else {
        hasMore = false;
      }
    }

    const total = allProfiles.length;
    const shopifyProfiles = allProfiles.filter(p => p.shopify_product_id);

    // ═══════════════════════════════════════════════════════════════════════
    // RESET PROGRESS
    // ═══════════════════════════════════════════════════════════════════════
    if (mode === 'reset_progress') {
      await supabase.from('backfill_progress').upsert({
        id: 'current',
        status: 'idle',
        total_profiles: shopifyProfiles.length,
        processed: 0,
        updated: 0,
        skipped: 0,
        api_errors: 0,
        current_salon: '',
        started_at: null,
        finished_at: null,
        updated_at: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({ success: true, mode: 'reset_progress', total_profiles: shopifyProfiles.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DIAGNOSE MODE - find products where Shopify has data but backfill missed
    // ═══════════════════════════════════════════════════════════════════════
    if (mode === 'diagnose') {
      const diagnoseField = body.field || 'address'; // which field to check
      const diagnoseLimit = body.limit || 50; // how many missing ones to scan
      const diagnoseOffset = body.offset || 0;

      // Find profiles where this field is empty in our DB
      const missingProfiles = shopifyProfiles.filter(p => isFieldEmpty(p[diagnoseField]));
      const batch = missingProfiles.slice(diagnoseOffset, diagnoseOffset + diagnoseLimit);
      
      const results: any[] = [];
      let shopifyHasData = 0;
      let apiErrorCount = 0;
      let productNotFound = 0;
      let shopifyAlsoEmpty = 0;

      for (let i = 0; i < batch.length; i++) {
        const p = batch[i];
        const numericId = extractNumericId(p.shopify_product_id);
        
        let productData: any = null;
        let metafieldsData: any[] = [];
        let errorMsg = '';

        try {
          const res = await shopifyRest(shopDomain, accessToken, `products/${numericId}.json`);
          productData = res?.product || null;
        } catch (e: any) {
          errorMsg = e.message || 'product fetch error';
          if (e.message?.includes('404')) {
            productNotFound++;
          } else {
            apiErrorCount++;
          }
        }

        try {
          const res = await shopifyRest(shopDomain, accessToken, `products/${numericId}/metafields.json`);
          metafieldsData = res?.metafields || [];
        } catch (e: any) {
          if (!errorMsg) errorMsg = e.message || 'metafields fetch error';
        }

        const extracted = extractFieldsFromShopify(productData, metafieldsData);
        const hasValueInShopify = !isFieldEmpty(extracted[diagnoseField]);
        
        if (hasValueInShopify) shopifyHasData++;
        else if (!errorMsg) shopifyAlsoEmpty++;

        if (results.length < 20) {
          results.push({
            salon_name: p.salon_name,
            shopify_product_id: p.shopify_product_id,
            numeric_id: numericId,
            error: errorMsg || null,
            shopify_has_value: hasValueInShopify,
            extracted_value: extracted[diagnoseField] ? String(extracted[diagnoseField]).substring(0, 200) : null,
            all_metafield_keys: metafieldsData.map((mf: any) => `${mf.namespace}.${mf.key}`),
            product_exists: !!productData,
          });
        }

        if (i % 5 === 4) await new Promise(r => setTimeout(r, 300));
      }

      const totalWithField = shopifyProfiles.filter(p => !isFieldEmpty(p[diagnoseField])).length;

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'diagnose',
          field: diagnoseField,
          total_profiles: total,
          shopify_profiles: shopifyProfiles.length,
          currently_has_value: totalWithField,
          currently_missing: missingProfiles.length,
          scanned_missing: batch.length,
          scan_offset: diagnoseOffset,
          shopify_has_data_for_missing: shopifyHasData,
          shopify_also_empty: shopifyAlsoEmpty,
          product_not_found_404: productNotFound,
          api_errors: apiErrorCount,
          potential_fillable: shopifyHasData,
          sample_results: results,
        }, null, 2),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DISCOVER MODE - scan N salons to find all available metafield keys
    // ═══════════════════════════════════════════════════════════════════════
    if (mode === 'discover') {
      const discoverCount = body.discover_count || 10;
      const keyCounts: Record<string, number> = {};
      const sampleValues: Record<string, string> = {};
      let scanned = 0;

      for (const p of shopifyProfiles.slice(0, discoverCount)) {
        const numericId = extractNumericId(p.shopify_product_id);
        try {
          const res = await shopifyRest(shopDomain, accessToken, `products/${numericId}/metafields.json`);
          const mfs = res?.metafields || [];
          for (const mf of mfs) {
            const fullKey = `${mf.namespace}.${mf.key}`;
            keyCounts[fullKey] = (keyCounts[fullKey] || 0) + 1;
            if (!sampleValues[fullKey] && mf.value) {
              sampleValues[fullKey] = String(mf.value).substring(0, 200);
            }
          }
          scanned++;
        } catch (e: any) {
          console.warn(`Discover error for ${p.salon_name}: ${e.message}`);
        }
        // Rate limiting
        if (scanned % 5 === 0) await new Promise(r => setTimeout(r, 500));
      }

      // Which keys are mapped and which are not
      const mappedKeys = Object.keys(metafieldMapping);
      const unmappedSamples: Record<string, string> = {};
      for (const [key, val] of Object.entries(sampleValues)) {
        if (!metafieldMapping[key]) {
          unmappedSamples[key] = val;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'discover',
          scanned_count: scanned,
          total_shopify_profiles: shopifyProfiles.length,
          all_metafield_keys: keyCounts,
          mapped_keys: mappedKeys.filter(k => keyCounts[k]),
          unmapped_keys: Object.keys(unmappedSamples),
          sample_values: unmappedSamples,
        }, null, 2),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DEBUG MODE
    // ═══════════════════════════════════════════════════════════════════════
    if (mode === 'debug') {
      const debugSamples: any[] = [];
      const debugOffset = body.debug_offset || 0;
      const debugCount = body.debug_count || 3;

      for (const p of shopifyProfiles.slice(debugOffset, debugOffset + debugCount)) {
        const numericId = extractNumericId(p.shopify_product_id);
        let productData: any = null;
        let metafieldsData: any[] = [];
        let productError = '';
        let metafieldsError = '';

        try {
          const res = await shopifyRest(shopDomain, accessToken, `products/${numericId}.json`);
          productData = res?.product || null;
        } catch (e: any) {
          productError = e.message;
        }

        try {
          const res = await shopifyRest(shopDomain, accessToken, `products/${numericId}/metafields.json`);
          metafieldsData = res?.metafields || [];
        } catch (e: any) {
          metafieldsError = e.message;
        }

        const extracted = extractFieldsFromShopify(productData, metafieldsData);

        debugSamples.push({
          profile_id: p.id,
          salon_name: p.salon_name,
          shopify_product_id: p.shopify_product_id,
          numeric_id: numericId,
          product_fetched: !!productData,
          product_error: productError || null,
          metafields_count: metafieldsData.length,
          metafields_error: metafieldsError || null,
          body_html_present: !!productData?.body_html,
          body_html_sample: productData?.body_html ? productData.body_html.substring(0, 500) : null,
          metafields_list: metafieldsData.map((mf: any) => ({
            key: `${mf.namespace}.${mf.key}`,
            value: String(mf.value || '').substring(0, 200),
            maps_to: metafieldMapping[`${mf.namespace}.${mf.key}`] || '(unmapped)',
          })),
          extracted_fields: extracted,
          current_profile: {
            description: p.description ? p.description.substring(0, 200) : null,
            address: p.address || null,
            contact_number: p.contact_number || null,
            contact_person: p.contact_person || null,
            email: p.email || null,
            website: p.website || null,
            whatsapp_number: p.whatsapp_number || null,
            seo_title: p.seo_title || null,
            seo_description: p.seo_description || null,
            office_hr_mon: p.office_hr_mon || null,
          },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'debug',
          total_profiles: total,
          shopify_profiles: shopifyProfiles.length,
          debug_offset: debugOffset,
          method: 'LIVE Shopify REST API (direct)',
          samples: debugSamples,
        }, null, 2),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ANALYZE / BACKFILL / BACKFILL_BATCH MODE
    // ═══════════════════════════════════════════════════════════════════════
    const columnsToCheck = [
      'address', 'contact_number', 'contact_person', 'email', 'website',
      'whatsapp_number', 'district', 'description',
      'office_hr_mon', 'office_hr_tue', 'office_hr_wed', 'office_hr_thu',
      'office_hr_fri', 'office_hr_sat', 'office_hr_sun',
      'storefront_photo', 'namecard_photo', 'salon_name', 'handle', 'tags',
      'selected_tags', 'highlight_tags', 'seo_title', 'seo_description',
      'product_media', 'product_list',
    ];

    const emptyCounts: Record<string, number> = {};
    columnsToCheck.forEach(col => { emptyCounts[col] = 0; });

    allProfiles.forEach(p => {
      columnsToCheck.forEach(col => {
        if (isFieldEmpty(p[col])) emptyCounts[col]++;
      });
    });

    const extractableFields = [
      'salon_name', 'handle', 'tags',
      'address', 'contact_number', 'contact_person', 'email', 'website',
      'whatsapp_number', 'description', 'district', 'product_list',
      'office_hr_mon', 'office_hr_tue', 'office_hr_wed', 'office_hr_thu',
      'office_hr_fri', 'office_hr_sat', 'office_hr_sun',
      'seo_title', 'seo_description',
    ];

    const fillableFromShopify: Record<string, { available: number; canFill: number }> = {};
    extractableFields.forEach(f => { fillableFromShopify[f] = { available: 0, canFill: 0 }; });

    let backfillUpdates = 0;
    const updatedProfiles: string[] = [];
    const backfillErrors: string[] = [];
    let processedCount = 0;
    let skippedCount = 0;
    let apiErrors = 0;

    if (mode === 'backfill' || mode === 'backfill_batch') {
      const batchStart = offset;
      const batchEnd = Math.min(batchStart + batchSize, shopifyProfiles.length);
      const batch = shopifyProfiles.slice(batchStart, batchEnd);
      const isFirstBatch = batchStart === 0;
      const isLastBatch = batchEnd >= shopifyProfiles.length;

      console.log(`Processing batch: offset=${batchStart}, size=${batch.length}, total=${shopifyProfiles.length}, force=${forceOverwrite}`);

      if (isFirstBatch) {
        await supabase.from('backfill_progress').upsert({
          id: 'current',
          status: 'running',
          total_profiles: shopifyProfiles.length,
          processed: 0,
          updated: 0,
          skipped: 0,
          api_errors: 0,
          current_salon: '',
          started_at: new Date().toISOString(),
          finished_at: null,
          updated_at: new Date().toISOString(),
        });
      } else {
        const { data: currentProgress } = await supabase
          .from('backfill_progress')
          .select('*')
          .eq('id', 'current')
          .single();

        if (currentProgress) {
          processedCount = currentProgress.processed || 0;
          backfillUpdates = currentProgress.updated || 0;
          skippedCount = currentProgress.skipped || 0;
          apiErrors = currentProgress.api_errors || 0;
        }

        await supabase.from('backfill_progress').update({
          status: 'running',
          current_salon: `批次 ${batchStart}-${batchEnd}...`,
          updated_at: new Date().toISOString(),
        }).eq('id', 'current');
      }

      // ─── Process batch ─────────────────────────────────────────────────
      for (let i = 0; i < batch.length; i++) {
        const p = batch[i];
        const numericId = extractNumericId(p.shopify_product_id);

        let productData: any = null;
        let metafieldsData: any[] = [];
        let hadApiError = false;

        try {
          const res = await shopifyRest(shopDomain, accessToken, `products/${numericId}.json`);
          productData = res?.product || null;
        } catch (e: any) {
          hadApiError = true;
          if (backfillErrors.length < 20) {
            backfillErrors.push(`${p.salon_name}: product API - ${e.message?.substring(0, 100)}`);
          }
        }

        try {
          const res = await shopifyRest(shopDomain, accessToken, `products/${numericId}/metafields.json`);
          metafieldsData = res?.metafields || [];
        } catch (e: any) {
          hadApiError = true;
          if (backfillErrors.length < 20) {
            backfillErrors.push(`${p.salon_name}: metafields API - ${e.message?.substring(0, 100)}`);
          }
        }

        if (hadApiError && !productData && metafieldsData.length === 0) {
          apiErrors++;
          processedCount++;
          // Update progress after every salon for better recovery
          await supabase.from('backfill_progress').update({
            processed: batchStart + i + 1,
            updated: backfillUpdates,
            skipped: skippedCount,
            api_errors: apiErrors,
            current_salon: p.salon_name || `Profile ${p.id}`,
            updated_at: new Date().toISOString(),
          }).eq('id', 'current');
          continue;
        }

        if (!productData && metafieldsData.length === 0) {
          skippedCount++;
          processedCount++;
          continue;
        }

        const extracted = extractFieldsFromShopify(productData, metafieldsData);
        processedCount++;

        Object.entries(extracted).forEach(([field, _value]) => {
          if (field.startsWith('_')) return;
          if (fillableFromShopify[field]) {
            fillableFromShopify[field].available++;
            if (isFieldEmpty(p[field])) {
              fillableFromShopify[field].canFill++;
            }
          }
        });

        const updates: Record<string, any> = {};

        Object.entries(extracted).forEach(([field, value]) => {
          if (field.startsWith('_')) return;
          if ((forceOverwrite || isFieldEmpty(p[field])) && value) {
            updates[field] = value;
          }
        });

        if ((forceOverwrite || isFieldEmpty(p.storefront_photo)) && extracted._storefront_photo) {
          updates.storefront_photo = extracted._storefront_photo;
        }

        if ((forceOverwrite || isFieldEmpty(p.product_media)) && extracted._product_media) {
          try {
            updates.product_media = JSON.parse(extracted._product_media);
          } catch {
            // ignore
          }
        }

        if ((forceOverwrite || isFieldEmpty(p.selected_tags)) && extracted._selected_tags) {
          try {
            updates.selected_tags = JSON.parse(extracted._selected_tags);
          } catch {
            // ignore
          }
        }

        if ((forceOverwrite || isFieldEmpty(p.highlight_tags)) && extracted._highlight_tags) {
          try {
            updates.highlight_tags = JSON.parse(extracted._highlight_tags);
          } catch {
            // ignore
          }
        }

        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          const { error } = await supabase
            .from('salon_profiles')
            .update(updates)
            .eq('id', p.id);

          if (!error) {
            backfillUpdates++;
            updatedProfiles.push(p.id);
          } else {
            backfillErrors.push(`${p.salon_name}: DB error - ${error.message}`);
            console.error(`Update error for ${p.id}: ${error.message}`);
          }
        }

        if (i % 3 === 0 || i === batch.length - 1) {
          await supabase.from('backfill_progress').update({
            processed: batchStart + i + 1,
            updated: backfillUpdates,
            skipped: skippedCount,
            api_errors: apiErrors,
            current_salon: p.salon_name || `Profile ${p.id}`,
            updated_at: new Date().toISOString(),
          }).eq('id', 'current');
        }

        if (i % 5 === 4) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      const finalStatus = isLastBatch ? 'finished' : 'batch_done';
      await supabase.from('backfill_progress').update({
        status: finalStatus,
        processed: batchEnd,
        updated: backfillUpdates,
        skipped: skippedCount,
        api_errors: apiErrors,
        current_salon: isLastBatch ? '' : `等待下一批... (${batchEnd}/${shopifyProfiles.length})`,
        ...(isLastBatch ? { finished_at: new Date().toISOString() } : {}),
        updated_at: new Date().toISOString(),
      }).eq('id', 'current');

      return new Response(
        JSON.stringify({
          success: true,
          mode,
          method: 'LIVE Shopify REST API (direct, batched)',
          total_profiles: total,
          shopify_linked_profiles: shopifyProfiles.length,
          batch_start: batchStart,
          batch_end: batchEnd,
          batch_size: batch.length,
          has_more: !isLastBatch,
          next_offset: isLastBatch ? null : batchEnd,
          force_overwrite: forceOverwrite,
          empty_column_counts: emptyCounts,
          fillable_from_shopify: fillableFromShopify,
          backfill_updates: backfillUpdates,
          processed_count: processedCount,
          skipped_count: skippedCount,
          api_errors: apiErrors,
          updated_profile_ids: updatedProfiles,
          backfill_errors: backfillErrors,
        }, null, 2),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );

    } else {
      // ─── ANALYZE: Quick estimate from raw_data (no API calls) ───────────
      for (const p of allProfiles) {
        if (!p.raw_data) continue;
        const raw = p.raw_data;

        const hasDescription = !!(raw.body_html || raw.bodyHtml || raw.descriptionHtml || raw.description);
        if (hasDescription && isFieldEmpty(p.description)) {
          fillableFromShopify.description.available++;
          fillableFromShopify.description.canFill++;
        }

        const metafields = raw.metafields;
        if (metafields) {
          const mfArray = Array.isArray(metafields) ? metafields :
            metafields.edges ? metafields.edges.map((e: any) => e.node || e) :
            metafields.nodes ? metafields.nodes : [];

          for (const mf of mfArray) {
            if (!mf?.namespace || !mf?.key) continue;
            const fullKey = `${mf.namespace}.${mf.key}`;
            const col = metafieldMapping[fullKey];
            if (col && fillableFromShopify[col] && mf.value) {
              fillableFromShopify[col].available++;
              if (isFieldEmpty(p[col])) fillableFromShopify[col].canFill++;
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        method: 'Quick scan from raw_data (estimate only — backfill will call live API)',
        total_profiles: total,
        shopify_linked_profiles: shopifyProfiles.length,
        empty_column_counts: emptyCounts,
        fillable_from_shopify: fillableFromShopify,
      }, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error:', error);
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const errorSupabase = createClient(supabaseUrl, supabaseServiceKey);
      await errorSupabase.from('backfill_progress').update({
        status: 'error',
        current_salon: error.message?.substring(0, 200) || 'Unknown error',
        finished_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', 'current');
    } catch (_) { /* ignore */ }
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
