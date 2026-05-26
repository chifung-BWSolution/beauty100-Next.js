UPDATE orders
SET status = 'expired', updated_at = NOW()
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '1 hour';
