-- Remove duplicate rows in shopify_configs (keep the oldest row per key)
DELETE FROM shopify_configs
WHERE id NOT IN (
  SELECT DISTINCT ON (key) id
  FROM shopify_configs
  ORDER BY key, created_at ASC
);

-- Add unique constraint on key column so UPSERT (onConflict: 'key') works correctly
ALTER TABLE shopify_configs
  ADD CONSTRAINT shopify_configs_key_unique UNIQUE (key);
