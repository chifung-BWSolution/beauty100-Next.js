-- Fix: merge duplicate payouts for the same salon + period
-- The previous migration created duplicates because the unique index was dropped
-- and the SELECT INTO didn't find existing records due to transaction isolation

-- Step 1: Identify duplicates and merge them
DO $$
DECLARE
  dup RECORD;
  keep_id UUID;
  remove_ids UUID[];
  rid UUID;
BEGIN
  -- Find all salon+period combinations that have more than 1 payout
  FOR dup IN
    SELECT salon_profile_id, period_start, period_end, 
           array_agg(id ORDER BY created_at ASC) AS payout_ids,
           COUNT(*) AS cnt
    FROM payouts
    GROUP BY salon_profile_id, period_start, period_end
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the first one (oldest), merge the rest into it
    keep_id := dup.payout_ids[1];
    remove_ids := dup.payout_ids[2:array_length(dup.payout_ids, 1)];

    -- Move all payout_items from duplicates to the keeper
    UPDATE payout_items SET payout_id = keep_id
    WHERE payout_id = ANY(remove_ids);

    -- Move all order_items references from duplicates to the keeper
    UPDATE order_items SET payout_id = keep_id
    WHERE payout_id = ANY(remove_ids);

    -- Delete the duplicate payouts
    DELETE FROM payouts WHERE id = ANY(remove_ids);

    -- Recalculate the keeper's totals
    UPDATE payouts SET
      total_amount = (SELECT COALESCE(SUM(amount), 0) FROM payout_items WHERE payout_id = keep_id),
      item_count = (SELECT COUNT(*) FROM payout_items WHERE payout_id = keep_id),
      net_amount = (SELECT COALESCE(SUM(amount), 0) FROM payout_items WHERE payout_id = keep_id),
      updated_at = NOW()
    WHERE id = keep_id;
  END LOOP;
END $$;

-- Step 2: Ensure the unique index exists (should already exist but just in case)
DROP INDEX IF EXISTS idx_payouts_salon_period_unique;
CREATE UNIQUE INDEX idx_payouts_salon_period_unique
  ON payouts(salon_profile_id, period_start, period_end);
