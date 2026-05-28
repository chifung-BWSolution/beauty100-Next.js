UPDATE salon_profiles
SET shopify_sync_pending = false, updated_at = NOW()
WHERE shopify_sync_pending = true
  AND id NOT IN (
    SELECT DISTINCT profile_id
    FROM salon_profile_versions
    WHERE status = 'pending_approval'
      AND profile_id IS NOT NULL
  );
