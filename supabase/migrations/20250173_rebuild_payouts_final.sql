-- Rebuild payouts from order_items (redeemed/settled)
-- Logic: items redeemed in month X → payout for month X+1
-- Same salon + same payout month = single payout record
-- Data was cleared in migration 20250172

-- Drop unique index first to avoid conflicts during rebuild
DROP INDEX IF EXISTS idx_payouts_salon_period_unique;

DO $$
DECLARE
  rec RECORD;
  v_payout_id UUID;
  v_period_start DATE;
  v_period_end DATE;
  v_fee_pct NUMERIC;
BEGIN
  -- Get platform fee percentage from system_settings
  SELECT COALESCE(value::numeric, 30) INTO v_fee_pct
  FROM system_settings WHERE key = 'platform_fee_percentage';
  
  IF v_fee_pct IS NULL THEN
    v_fee_pct := 30;
  END IF;

  FOR rec IN
    SELECT 
      oi.id AS order_item_id,
      oi.salon_profile_id,
      (COALESCE(oi.unit_price, 0) * COALESCE(oi.quantity, 1)) AS amount,
      oi.redeemed_at,
      oi.settled_at,
      (date_trunc('month', oi.redeemed_at) + INTERVAL '1 month')::DATE AS payout_month_start
    FROM order_items oi
    WHERE oi.status IN ('redeemed', 'settled')
      AND oi.redeemed_at IS NOT NULL
      AND oi.salon_profile_id IS NOT NULL
    ORDER BY oi.redeemed_at ASC
  LOOP
    v_period_start := rec.payout_month_start;
    v_period_end := (v_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    -- Find existing payout for this salon + period
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
  END LOOP;

  -- Now update all payout totals in one pass
  UPDATE payouts p SET
    total_amount = sub.total,
    item_count = sub.cnt,
    platform_fee = ROUND(sub.total * v_fee_pct / 100, 2),
    net_amount = ROUND(sub.total * (100 - v_fee_pct) / 100, 2),
    updated_at = NOW()
  FROM (
    SELECT payout_id, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS cnt
    FROM payout_items
    GROUP BY payout_id
  ) sub
  WHERE p.id = sub.payout_id;

END $$;

-- Re-create unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_payouts_salon_period_unique
  ON payouts(salon_profile_id, period_start, period_end);
