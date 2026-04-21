CREATE TABLE IF NOT EXISTS shopify_products_cache (
  id TEXT PRIMARY KEY,
  title TEXT,
  vendor TEXT,
  handle TEXT,
  status TEXT,
  product_type TEXT,
  tags TEXT,
  image_src TEXT,
  district_id TEXT,
  district_name TEXT,
  shopify_created_at TIMESTAMPTZ,
  raw_data JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopify_products_cache_handle ON shopify_products_cache(handle);
CREATE INDEX IF NOT EXISTS idx_shopify_products_cache_district ON shopify_products_cache(district_id);
CREATE INDEX IF NOT EXISTS idx_shopify_products_cache_synced ON shopify_products_cache(synced_at);

CREATE TABLE IF NOT EXISTS shopify_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  product_count INT,
  status TEXT,
  error TEXT
);
