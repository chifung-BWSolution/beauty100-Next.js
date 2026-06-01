-- Rebuild payouts with simple monthly logic:
-- All items redeemed in month X → go into payout for month X+1 (settled on 7th)
-- period_start = 1st of payout month (X+1), period_end = last day of payout month (X+1)
-- Frontend displays transaction dates as previous month (= the redemption month)

-- Step 1: Clear existing data (rebuild from scratch)
-- Must NULL out FK references first before deleting payouts
UPDATE order_items SET payout_id = NULL WHERE payout_id IS NOT NULL;
DELETE FROM payout_items;
DELETE FROM payouts;

-- Step 2: Drop the unique index temporarily so we can rebuild
DROP INDEX IF EXISTS idx_payouts_salon_period_unique;

-- Step 3: Re-backfill with simple monthly logic
DO $$
DECLARE
  rec RECORD;
  v_payout_id UUID;
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  FOR rec IN
    SELECT 
      oi.id AS order_item_id,
      oi.salon_profile_id,
      oi.unit_price * oi.quantity AS amount,
      oi.redeemed_at,
      oi.settled_at,
      -- Simple monthly: payout month = next month after redemption
      (date_trunc('month', oi.redeemed_at) + INTERVAL '1 month')::DATE AS payout_month_start
    FROM order_items oi
    WHERE oi.status IN ('redeemed', 'settled')
      AND oi.redeemed_at IS NOT NULL
      AND oi.salon_profile_id IS NOT NULL
    ORDER BY oi.redeemed_at ASC
  LOOP
    v_period_start := rec.payout_month_start;
    v_period_end := (v_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    -- Find or create payout for this salon + period
    SELECT id INTO v_payout_id
    FROM payouts
    WHERE salon_profile_id = rec.salon_profile_id
      AND period_start = v_period_start
      AND period_end = v_period_end;

    IF v_payout_id IS NULL THEN
      INSERT INTO payouts (salon_profile_id, period_start, period_end, total_amount, platform_fee, net_amount, item_count, status)
      VALUES (
        rec.salon_profile_id,
        v_period_start,
        v_period_end,
        0, 0, 0, 0,
        CASE WHEN rec.settled_at IS NOT NULL THEN 'paid' ELSE 'pending' END
      )
      RETURNING id INTO v_payout_id;
    END IF;

    -- Insert payout item
    INSERT INTO payout_items (payout_id, order_item_id, amount)
    VALUES (v_payout_id, rec.order_item_id, rec.amount)
    ON CONFLICT (payout_id, order_item_id) DO NOTHING;

    -- Update order_item with payout_id
    UPDATE order_items SET payout_id = v_payout_id WHERE id = rec.order_item_id;

    -- Update payout totals
    UPDATE payouts SET
      total_amount = (SELECT COALESCE(SUM(amount), 0) FROM payout_items WHERE payout_id = v_payout_id),
      item_count = (SELECT COUNT(*) FROM payout_items WHERE payout_id = v_payout_id),
      net_amount = (SELECT COALESCE(SUM(amount), 0) FROM payout_items WHERE payout_id = v_payout_id),
      updated_at = NOW()
    WHERE id = v_payout_id;
  END LOOP;
END $$;

-- Step 4: Re-create the unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_payouts_salon_period_unique
  ON payouts(salon_profile_id, period_start, period_end);
