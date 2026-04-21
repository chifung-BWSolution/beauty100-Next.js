ALTER TABLE salon_profiles
  ADD COLUMN IF NOT EXISTS vendor TEXT,
  ADD COLUMN IF NOT EXISTS product_type TEXT,
  ADD COLUMN IF NOT EXISTS image_src TEXT,
  ADD COLUMN IF NOT EXISTS district_id TEXT,
  ADD COLUMN IF NOT EXISTS district_name TEXT,
  ADD COLUMN IF NOT EXISTS shopify_created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS raw_data JSONB,
  ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_salon_profiles_handle ON salon_profiles(handle);
CREATE INDEX IF NOT EXISTS idx_salon_profiles_district_id ON salon_profiles(district_id);
CREATE INDEX IF NOT EXISTS idx_salon_profiles_shopify_product_id ON salon_profiles(shopify_product_id);

UPDATE salon_profiles sp
SET
  vendor       = spc.vendor,
  product_type = spc.product_type,
  image_src    = spc.image_src,
  district_id  = spc.district_id,
  district_name = spc.district_name,
  shopify_created_at = spc.shopify_created_at,
  raw_data     = spc.raw_data,
  synced_at    = spc.synced_at,
  handle       = COALESCE(sp.handle, spc.handle),
  tags         = COALESCE(sp.tags, spc.tags),
  district     = COALESCE(sp.district, spc.district_name),
  salon_name   = COALESCE(sp.salon_name, spc.title),
  storefront_photo = COALESCE(sp.storefront_photo, spc.image_src),
  shopify_synced = true,
  updated_at   = NOW()
FROM shopify_products_cache spc
WHERE sp.shopify_product_id = spc.id;

INSERT INTO salon_profiles (
  shopify_product_id,
  salon_name,
  vendor,
  handle,
  product_type,
  tags,
  image_src,
  storefront_photo,
  district_id,
  district_name,
  district,
  shopify_created_at,
  raw_data,
  synced_at,
  shopify_synced,
  is_active,
  created_date,
  updated_at
)
SELECT
  spc.id,
  spc.title,
  spc.vendor,
  spc.handle,
  spc.product_type,
  spc.tags,
  spc.image_src,
  spc.image_src,
  spc.district_id,
  spc.district_name,
  spc.district_name,
  spc.shopify_created_at,
  spc.raw_data,
  spc.synced_at,
  true,
  true,
  COALESCE(spc.shopify_created_at, NOW()),
  NOW()
FROM shopify_products_cache spc
WHERE NOT EXISTS (
  SELECT 1 FROM salon_profiles sp WHERE sp.shopify_product_id = spc.id
);
