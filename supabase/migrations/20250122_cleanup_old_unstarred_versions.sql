-- Function to delete unstarred salon_profile_versions older than 90 days
-- Only deletes versions that are NOT starred, NOT in 'draft' status, and NOT in 'pending_approval' status
CREATE OR REPLACE FUNCTION cleanup_old_unstarred_versions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM salon_profile_versions
  WHERE is_starred = false
    AND status NOT IN ('draft', 'pending_approval')
    AND created_date < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule daily cleanup at 3:00 AM UTC
SELECT cron.schedule(
  'cleanup-old-unstarred-versions-daily',
  '0 3 * * *',
  $$SELECT cleanup_old_unstarred_versions();$$
);
