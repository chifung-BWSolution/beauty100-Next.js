ALTER TABLE shopify_configs
  ADD COLUMN IF NOT EXISTS shop_domain TEXT;
