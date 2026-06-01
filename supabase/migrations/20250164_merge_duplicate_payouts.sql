-- Merge duplicate payouts for the same salon_profile_id + period_start + period_end
-- Keep the earliest-created payout, move all payout_items to it, then delete the duplicates

DO $$
DECLARE
  grp RECORD;
  v_keep_id UUID;
  v_dup_id UUID;
BEGIN
  -- Find groups that have more than one payout for the same salon + period
  FOR grp IN
    SELECT salon_profile_id, period_start, period_end, COUNT(*) AS cnt,
           MIN(created_at) AS earliest_created
    FROM payouts
    GROUP BY salon_profile_id, period_start, period_end
    HAVING COUNT(*) > 1
  LOOP
    -- Pick the earliest payout to keep
    SELECT id INTO v_keep_id
    FROM payouts
    WHERE salon_profile_id = grp.salon_profile_id
      AND period_start = grp.period_start
      AND period_end = grp.period_end
    ORDER BY created_at ASC
    LIMIT 1;

    -- Move all payout_items from duplicates to the keeper
    UPDATE payout_items
    SET payout_id = v_keep_id
    WHERE payout_id IN (
      SELECT id FROM payouts
      WHERE salon_profile_id = grp.salon_profile_id
        AND period_start = grp.period_start
        AND period_end = grp.period_end
        AND id != v_keep_id
    );

    -- Update order_items references
    UPDATE order_items
    SET payout_id = v_keep_id
    WHERE payout_id IN (
      SELECT id FROM payouts
      WHERE salon_profile_id = grp.salon_profile_id
        AND period_start = grp.period_start
        AND period_end = grp.period_end
        AND id != v_keep_id
    );

    -- Delete duplicate payouts
    DELETE FROM payouts
    WHERE salon_profile_id = grp.salon_profile_id
      AND period_start = grp.period_start
      AND period_end = grp.period_end
      AND id != v_keep_id;

    -- Recalculate totals for the kept payout
    UPDATE payouts SET
      total_amount = (SELECT COALESCE(SUM(amount), 0) FROM payout_items WHERE payout_id = v_keep_id),
      item_count = (SELECT COUNT(*) FROM payout_items WHERE payout_id = v_keep_id),
      updated_at = NOW()
    WHERE id = v_keep_id;
  END LOOP;
END $$;

-- Add a unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_payouts_salon_period_unique
  ON payouts(salon_profile_id, period_start, period_end);
