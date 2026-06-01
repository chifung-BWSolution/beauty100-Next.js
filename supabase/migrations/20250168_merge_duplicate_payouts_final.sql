-- Final fix: directly merge duplicate payouts by keeping only one per (salon_profile_id, period_start, period_end)

-- Step 1: For each group of duplicates, pick the one with the lowest id as the "keeper"
-- and reassign all payout_items + order_items to the keeper, then delete the rest.

DO $$
DECLARE
  dup RECORD;
  keeper_id UUID;
BEGIN
  -- Find all duplicate groups
  FOR dup IN
    SELECT salon_profile_id, period_start, period_end
    FROM payouts
    GROUP BY salon_profile_id, period_start, period_end
    HAVING COUNT(*) > 1
  LOOP
    -- Pick the keeper (first created)
    SELECT id INTO keeper_id
    FROM payouts
    WHERE salon_profile_id = dup.salon_profile_id
      AND period_start = dup.period_start
      AND period_end = dup.period_end
    ORDER BY created_at ASC
    LIMIT 1;

    -- Move all payout_items from duplicates to keeper
    UPDATE payout_items
    SET payout_id = keeper_id
    WHERE payout_id IN (
      SELECT id FROM payouts
      WHERE salon_profile_id = dup.salon_profile_id
        AND period_start = dup.period_start
        AND period_end = dup.period_end
        AND id != keeper_id
    );

    -- Move all order_items references from duplicates to keeper
    UPDATE order_items
    SET payout_id = keeper_id
    WHERE payout_id IN (
      SELECT id FROM payouts
      WHERE salon_profile_id = dup.salon_profile_id
        AND period_start = dup.period_start
        AND period_end = dup.period_end
        AND id != keeper_id
    );

    -- Delete the duplicate payouts
    DELETE FROM payouts
    WHERE salon_profile_id = dup.salon_profile_id
      AND period_start = dup.period_start
      AND period_end = dup.period_end
      AND id != keeper_id;

    -- Recalculate totals for the keeper
    UPDATE payouts SET
      total_amount = (SELECT COALESCE(SUM(amount), 0) FROM payout_items WHERE payout_id = keeper_id),
      item_count = (SELECT COUNT(*) FROM payout_items WHERE payout_id = keeper_id),
      net_amount = (SELECT COALESCE(SUM(amount), 0) FROM payout_items WHERE payout_id = keeper_id),
      updated_at = NOW()
    WHERE id = keeper_id;
  END LOOP;
END $$;

-- Ensure unique index exists (may already exist from previous migration)
DROP INDEX IF EXISTS idx_payouts_salon_period_unique;
CREATE UNIQUE INDEX idx_payouts_salon_period_unique
  ON payouts(salon_profile_id, period_start, period_end);
