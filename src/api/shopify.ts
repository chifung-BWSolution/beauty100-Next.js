import { supabase } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Load ALL beauty products from local DB cache using pagination to bypass the 1000-row default limit.
// If cache is empty, triggers a sync first.
export const loadBeautyProductsFromCache = async (): Promise<any[]> => {
  const PAGE_SIZE = 1000;
  let allRows: any[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const { data, error } = await supabase
        .from('shopify_products_cache')
        .select('id, title, vendor, handle, status, product_type, tags, image_src, district_id, district_name, shopify_created_at, synced_at')
        .order('shopify_created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.warn('Cache load error:', error.message);
        break;
      }

      if (data && data.length > 0) {
        allRows = [...allRows, ...data];
        from += PAGE_SIZE;
        hasMore = data.length === PAGE_SIZE;
      } else {
        hasMore = false;
      }
    } catch (fetchErr) {
      console.warn('Cache load fetch failed (network issue, retrying is safe):', fetchErr instanceof Error ? fetchErr.message : fetchErr);
      break;
    }
  }

  // If cache is empty, do an initial sync (non-blocking — return empty, let caller handle)
  if (allRows.length === 0) {
    try {
      await syncShopifyProductsToCache();
      return await loadBeautyProductsFromCache();
    } catch (syncErr) {
      console.error('Cache auto-sync error:', syncErr);
      return [];
    }
  }

  return allRows.map(normalizeProduct);
};

// Trigger a fresh sync of Shopify products into the DB cache
export const syncShopifyProductsToCache = async (): Promise<{ synced: number }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token || supabaseAnonKey;

    const response = await fetch(`${supabaseUrl}/functions/v1/supabase-functions-sync-shopify-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sync error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    if (result?.error) throw new Error(result.error);
    return result;
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      console.warn('Sync failed due to network issue');
      return { synced: 0 };
    }
    throw err;
  }
};

// Normalise a cache row to look like the existing Shopify product shape
const normalizeProduct = (row: any) => ({
  id: row.id,
  title: row.title,
  vendor: row.vendor,
  handle: row.handle,
  status: row.status,
  product_type: row.product_type,
  tags: row.tags,
  image: { src: row.image_src },
  images: row.image_src ? [{ src: row.image_src }] : [],
  district_id: row.district_id,
  district_name: row.district_name,
  created_at: row.shopify_created_at,
  synced_at: row.synced_at,
});

const invoke = async (functionName: string, body: Record<string, unknown>) => {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token || supabaseAnonKey;

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Edge function error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  if (data?.error) throw new Error(data.error);
  return data;
};

export const ShopifyAPI = {
  getProducts: (limit = 50, pageInfo: string | null = null) =>
    invoke('supabase-functions-shopify-data', { type: 'products', limit, page_info: pageInfo }),

  getProduct: (productId: string | number) =>
    invoke('supabase-functions-shopify-data', { type: 'product_by_id', product_id: productId }),

  getProductMetafields: (productId: string | number) =>
    invoke('supabase-functions-shopify-data', { type: 'product_metafields', product_id: productId }),

  createProduct: (product: Record<string, unknown>) =>
    invoke('supabase-functions-shopify-data', { type: 'create_product', product }),

  updateProduct: (product: Record<string, unknown>) =>
    invoke('supabase-functions-shopify-data', { type: 'update_product', product }),

  getOrders: (limit = 50, pageInfo: string | null = null) =>
    invoke('supabase-functions-shopify-data', { type: 'orders', limit, page_info: pageInfo }),

  getCustomers: (limit = 50, pageInfo: string | null = null) =>
    invoke('supabase-functions-shopify-data', { type: 'customers', limit, page_info: pageInfo }),

  getDistricts: () =>
    invoke('supabase-functions-shopify-data', { type: 'districts' }),

  checkHandle: (handle: string, excludeProductId: string | null = null) =>
    invoke('supabase-functions-shopify-check-handle', { handle, excludeProductId }),

  getProductPreviewUrl: (productId: string | number) =>
    invoke('supabase-functions-shopify-data', { type: 'product_preview_url', product_id: productId }),

  refreshToken: () =>
    invoke('supabase-functions-shopify-refresh-token', {}),
};

export default ShopifyAPI;
