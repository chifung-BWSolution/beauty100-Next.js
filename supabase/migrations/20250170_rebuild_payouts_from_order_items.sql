-- Rebuild payouts and payout_items from order_items (redeemed/settled)
-- Assumption: payouts and payout_items tables are already empty

-- Step 1: Clear any stale payout_id references on order_items
UPDATE order_items SET payout_id = NULL WHERE payout_id IS NOT NULL;

-- Step 2: Rebuild payouts from order_items
DO $$
DECLARE
  rec RECORD;
  v_payout_id UUID;
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  FOR rec IN
    SELECT id as order_item_id, salon_profile_id, unit_price as amount, redeemed_at, settled_at
    FROM order_items
    WHERE status IN ('redeemed', 'settled')
      AND redeemed_at IS NOT NULL
      AND salon_profile_id IS NOT NULL
    ORDER BY redeemed_at ASC
  LOOP
    v_period_start := date_trunc('month', rec.redeemed_at)::DATE;
    v_period_end := (v_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    SELECT id INTO v_payout_id
    FROM payouts
    WHERE salon_profile_id = rec.salon_profile_id
      AND period_start = v_period_start
      AND period_end = v_period_end
    LIMIT 1;

    IF v_payout_id IS NULL THEN
      INSERT INTO payouts (salon_profile_id, period_start, period_end, total_amount, platform_fee, net_amount, item_count, status)
      VALUES (
        rec.salon_profile_id, v_period_start, v_period_end, 0, 0, 0, 0,
        CASE WHEN rec.settled_at IS NOT NULL THEN 'paid' ELSE 'pending' END
      )
      RETURNING id INTO v_payout_id;
    END IF;

    INSERT INTO payout_items (payout_id, order_item_id, amount)
    VALUES (v_payout_id, rec.order_item_id, rec.amount)
    ON CONFLICT (payout_id, order_item_id) DO NOTHING;

    UPDATE order_items SET payout_id = v_payout_id WHERE id = rec.order_item_id;

    UPDATE payouts SET
      total_amount = (SELECT COALESCE(SUM(amount), 0) FROM payout_items WHERE payout_id = v_payout_id),
      item_count = (SELECT COUNT(*) FROM payout_items WHERE payout_id = v_payout_id),
      net_amount = (SELECT COALESCE(SUM(amount), 0) FROM payout_items WHERE payout_id = v_payout_id),
      updated_at = NOW()
    WHERE id = v_payout_id;
  END LOOP;
END $$;

-- Step 3: Ensure unique index to prevent future duplicates
DROP INDEX IF EXISTS idx_payouts_salon_period_unique;
CREATE UNIQUE INDEX idx_payouts_salon_period_unique
  ON payouts(salon_profile_id, period_start, period_end);
