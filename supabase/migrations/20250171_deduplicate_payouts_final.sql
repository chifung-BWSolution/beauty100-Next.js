-- Final deduplication: merge duplicate payouts into one per salon+period
-- Then re-enforce unique constraint

DO $$
DECLARE
  dup RECORD;
  v_keep_id UUID;
BEGIN
  -- Find groups with duplicates
  FOR dup IN
    SELECT salon_profile_id, period_start, period_end
    FROM payouts
    GROUP BY salon_profile_id, period_start, period_end
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the one with most items (or earliest created)
    SELECT id INTO v_keep_id
    FROM payouts
    WHERE salon_profile_id = dup.salon_profile_id
      AND period_start = dup.period_start
      AND period_end = dup.period_end
    ORDER BY item_count DESC, created_at ASC
    LIMIT 1;

    -- Move payout_items from duplicates to the keeper
    UPDATE payout_items
    SET payout_id = v_keep_id
    WHERE payout_id IN (
      SELECT id FROM payouts
      WHERE salon_profile_id = dup.salon_profile_id
        AND period_start = dup.period_start
        AND period_end = dup.period_end
        AND id != v_keep_id
    );

    -- Update order_items references
    UPDATE order_items
    SET payout_id = v_keep_id
    WHERE payout_id IN (
      SELECT id FROM payouts
      WHERE salon_profile_id = dup.salon_profile_id
        AND period_start = dup.period_start
        AND period_end = dup.period_end
        AND id != v_keep_id
    );

    -- Delete the duplicate payouts
    DELETE FROM payouts
    WHERE salon_profile_id = dup.salon_profile_id
      AND period_start = dup.period_start
      AND period_end = dup.period_end
      AND id != v_keep_id;

    -- Recalculate the kept payout
    UPDATE payouts SET
      total_amount = (SELECT COALESCE(SUM(amount), 0) FROM payout_items WHERE payout_id = v_keep_id),
      item_count = (SELECT COUNT(*) FROM payout_items WHERE payout_id = v_keep_id),
      net_amount = (SELECT COALESCE(SUM(amount), 0) FROM payout_items WHERE payout_id = v_keep_id),
      status = CASE
        WHEN (SELECT COUNT(*) FROM order_items WHERE payout_id = v_keep_id AND status = 'settled') =
             (SELECT COUNT(*) FROM order_items WHERE payout_id = v_keep_id)
        THEN 'paid'
        ELSE 'pending'
      END,
      updated_at = NOW()
    WHERE id = v_keep_id;
  END LOOP;
END $$;

-- Re-enforce unique index
DROP INDEX IF EXISTS idx_payouts_salon_period_unique;
CREATE UNIQUE INDEX idx_payouts_salon_period_unique
  ON payouts(salon_profile_id, period_start, period_end);
