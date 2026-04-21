import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

async function getShopifyCredentials(supabase: any): Promise<{ accessToken: string; shopDomain: string }> {
  // Try shopify_configs table first
  const { data: config, error } = await supabase
    .from('shopify_configs')
    .select('access_token, shop_domain')
    .eq('key', 'shopify_token')
    .single();

  if (error || !config?.access_token) {
    // Fallback to environment variable
    const envToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    const envDomain = Deno.env.get('SHOPIFY_STORE_URL');
    if (envToken && envDomain) {
      return {
        accessToken: envToken,
        shopDomain: envDomain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      };
    }
    throw new Error('No Shopify access token found. Please run the token refresh function first.');
  }

  // Check if token is expired
  if (config.expires_at) {
    const expiresAt = new Date(config.expires_at);
    if (expiresAt < new Date()) {
      console.warn('Shopify token expired at', config.expires_at, '— proceeding anyway, may fail');
    }
  }

  const shopDomain = config.shop_domain || Deno.env.get('SHOPIFY_STORE_URL') || '';
  const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (!cleanDomain) {
    throw new Error('No shop_domain in shopify_configs and no SHOPIFY_STORE_URL env variable');
  }

  return { accessToken: config.access_token, shopDomain: cleanDomain };
}

async function shopifyFetch(shopDomain: string, accessToken: string, endpoint: string, method = 'GET', body?: unknown) {
  const url = `https://${shopDomain}/admin/api/2024-01/${endpoint}`;
  console.log(`Shopify API: ${method} ${url}`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': accessToken,
  };

  const options: RequestInit = { method, headers };
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Shopify API error ${response.status}:`, errorText);
    throw new Error(`Shopify API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function shopifyGraphQL(shopDomain: string, accessToken: string, query: string, variables?: Record<string, unknown>) {
  const url = `https://${shopDomain}/admin/api/2024-01/graphql.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify GraphQL error ${response.status}: ${errorText}`);
  }

  return response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { type } = body;

    if (!type) {
      return jsonResponse({ error: 'Missing "type" parameter' }, 400);
    }

    const { accessToken, shopDomain } = await getShopifyCredentials(supabase);

    switch (type) {
      // ─── Get products (paginated REST) ─────────────────────────
      case 'products': {
        const limit = body.limit || 50;
        let endpoint = `products.json?limit=${limit}&status=active`;
        if (body.page_info) {
          endpoint = `products.json?page_info=${body.page_info}&limit=${limit}`;
        }
        const result = await shopifyFetch(shopDomain, accessToken, endpoint);
        return jsonResponse(result);
      }

      // ─── Get single product by ID ─────────────────────────────
      case 'product_by_id': {
        const productId = String(body.product_id).replace(/.*\//, '');
        const result = await shopifyFetch(shopDomain, accessToken, `products/${productId}.json`);
        return jsonResponse(result);
      }

      // ─── Get product metafields ────────────────────────────────
      case 'product_metafields': {
        const productId = String(body.product_id).replace(/.*\//, '');
        const result = await shopifyFetch(shopDomain, accessToken, `products/${productId}/metafields.json`);
        return jsonResponse(result);
      }

      // ─── Get all beauty products via GraphQL (paginated) ──────
      case 'beauty_products_all': {
        const after = body.after || null;
        const first = body.limit || 50;

        const query = `
          query GetProducts($first: Int!, $after: String) {
            products(first: $first, after: $after, query: "product_type:美容院 OR product_type:Beauty") {
              edges {
                node {
                  id
                  title
                  handle
                  vendor
                  status
                  productType
                  tags
                  createdAt
                  images(first: 10) {
                    edges {
                      node {
                        src
                        altText
                      }
                    }
                  }
                  metafields(first: 20) {
                    edges {
                      node {
                        namespace
                        key
                        value
                        type
                      }
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `;

        const gqlResult = await shopifyGraphQL(shopDomain, accessToken, query, { first, after });
        const edges = gqlResult?.data?.products?.edges || [];
        const pageInfo = gqlResult?.data?.products?.pageInfo || { hasNextPage: false, endCursor: null };

        // Transform GraphQL response to REST-like format
        const products = edges.map((edge: any) => {
          const node = edge.node;
          const numericId = node.id.replace('gid://shopify/Product/', '');
          const images = (node.images?.edges || []).map((ie: any) => ie.node);
          const metafields = (node.metafields?.edges || []).map((me: any) => me.node);

          // Extract district from metafields
          const districtMf = metafields.find((m: any) => m.key === 'district_id' || m.key === 'district');
          const districtNameMf = metafields.find((m: any) => m.key === 'district_name');

          return {
            id: numericId,
            title: node.title,
            handle: node.handle,
            vendor: node.vendor,
            status: node.status?.toLowerCase(),
            product_type: node.productType,
            tags: node.tags?.join(', ') || '',
            created_at: node.createdAt,
            image: images[0] ? { src: images[0].src } : null,
            images,
            district_id: districtMf?.value || null,
            district_name: districtNameMf?.value || null,
          };
        });

        return jsonResponse({ products, pageInfo });
      }

      // ─── Get districts (from metafield definitions or collection) ──
      case 'districts': {
        // Try to get from a known metafield or hardcoded list
        // First attempt: check if there's a "districts" collection or metafield
        try {
          const query = `
            query {
              metafieldDefinitions(first: 50, ownerType: PRODUCT) {
                edges {
                  node {
                    name
                    key
                    namespace
                    type {
                      name
                    }
                    validations {
                      name
                      value
                    }
                  }
                }
              }
            }
          `;
          const gqlResult = await shopifyGraphQL(shopDomain, accessToken, query);
          const definitions = gqlResult?.data?.metafieldDefinitions?.edges || [];
          
          // Look for district-related metafield
          const districtDef = definitions.find((e: any) => 
            e.node.key === 'district_id' || e.node.key === 'district' || e.node.name.toLowerCase().includes('district')
          );
          
          if (districtDef?.node?.validations?.length > 0) {
            const choicesValidation = districtDef.node.validations.find((v: any) => v.name === 'choices');
            if (choicesValidation?.value) {
              const choices = JSON.parse(choicesValidation.value);
              return jsonResponse({ districts: choices });
            }
          }
        } catch (e) {
          console.warn('Failed to fetch district metafield definitions:', e);
        }

        // Fallback: query all unique district values from products
        try {
          const { data: districts } = await supabase
            .from('shopify_products_cache')
            .select('district_id, district_name')
            .not('district_id', 'is', null)
            .order('district_name');
          
          const uniqueDistricts = new Map();
          (districts || []).forEach((d: any) => {
            if (d.district_id && !uniqueDistricts.has(d.district_id)) {
              uniqueDistricts.set(d.district_id, { id: d.district_id, name: d.district_name || d.district_id });
            }
          });

          return jsonResponse({ districts: Array.from(uniqueDistricts.values()) });
        } catch (dbErr) {
          console.warn('Failed to fetch districts from cache:', dbErr);
          return jsonResponse({ districts: [] });
        }
      }

      // ─── Create product ────────────────────────────────────────
      case 'create_product': {
        const product = body.product;
        if (!product) return jsonResponse({ error: 'Missing product data' }, 400);
        const result = await shopifyFetch(shopDomain, accessToken, 'products.json', 'POST', { product });
        return jsonResponse(result);
      }

      // ─── Update product ────────────────────────────────────────
      case 'update_product': {
        const product = body.product;
        if (!product || !product.id) return jsonResponse({ error: 'Missing product data or product.id' }, 400);
        const productId = String(product.id).replace(/.*\//, '');
        const result = await shopifyFetch(shopDomain, accessToken, `products/${productId}.json`, 'PUT', { product });
        return jsonResponse(result);
      }

      // ─── Get orders ────────────────────────────────────────────
      case 'orders': {
        const limit = body.limit || 50;
        let endpoint = `orders.json?limit=${limit}&status=any`;
        if (body.page_info) {
          endpoint = `orders.json?page_info=${body.page_info}&limit=${limit}`;
        }
        const result = await shopifyFetch(shopDomain, accessToken, endpoint);
        return jsonResponse(result);
      }

      // ─── Get customers ─────────────────────────────────────────
      case 'customers': {
        const limit = body.limit || 50;
        let endpoint = `customers.json?limit=${limit}`;
        if (body.page_info) {
          endpoint = `customers.json?page_info=${body.page_info}&limit=${limit}`;
        }
        const result = await shopifyFetch(shopDomain, accessToken, endpoint);
        return jsonResponse(result);
      }

      // ─── Get product preview URL ──────────────────────────────
      case 'product_preview_url': {
        const rawId = String(body.product_id);
        // Ensure we have a full GID for GraphQL
        const gid = rawId.startsWith('gid://') ? rawId : `gid://shopify/Product/${rawId.replace(/.*\//, '')}`;

        const previewQuery = `
          query GetProductPreviewUrl($id: ID!) {
            product(id: $id) {
              id
              title
              handle
              status
              onlineStorePreviewUrl
              onlineStoreUrl
            }
          }
        `;

        const gqlResult = await shopifyGraphQL(shopDomain, accessToken, previewQuery, { id: gid });
        console.log('GraphQL preview result:', JSON.stringify(gqlResult));
        const product = gqlResult?.data?.product;
        if (!product) {
          return jsonResponse({ error: 'Product not found' }, 404);
        }

        const status = product.status?.toLowerCase() || null;
        const handle = product.handle;
        
        // onlineStorePreviewUrl: Shopify's built-in preview (works for draft, requires store session)
        // onlineStoreUrl: only available when product is active on Online Store channel
        // Fallback: build URL from handle for active products
        let previewUrl = product.onlineStorePreviewUrl || null;
        let liveUrl = product.onlineStoreUrl || null;

        // For active products, if onlineStoreUrl is null (not published to Online Store channel),
        // fall back to constructing URL from handle
        if (status === 'active' && !liveUrl && handle) {
          liveUrl = `https://${shopDomain}/products/${handle}`;
        }

        // For draft products, if onlineStorePreviewUrl is null,
        // construct a /products/ URL (will 404 for non-logged-in users but that's expected for drafts)
        if (!previewUrl && handle) {
          previewUrl = `https://${shopDomain}/products/${handle}`;
        }

        // Admin URL - always accessible to store owners
        const numericId = rawId.replace(/.*\//, '');
        const adminUrl = `https://${shopDomain}/admin/products/${numericId}`;

        return jsonResponse({
          previewUrl,
          liveUrl,
          adminUrl,
          status,
          handle,
          shopDomain,
        });
      }

      default:
        return jsonResponse({ error: `Unknown type: ${type}` }, 400);
    }
  } catch (error: any) {
    console.error('shopify-data error:', error);
    return jsonResponse({ error: error.message || 'Internal error' }, 500);
  }
});
