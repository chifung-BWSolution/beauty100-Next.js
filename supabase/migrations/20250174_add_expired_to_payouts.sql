-- Add expired order_items to payouts
-- For expired items: use redeem_end_date as the transaction date
-- payout month = month of redeem_end_date + 1
-- Also clear and rebuild to ensure consistency

-- First, let's log what we have (will show in migration output)
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM payouts;
  RAISE NOTICE 'Current payouts count: %', v_count;
  
  -- Show existing payouts with salon info
  FOR v_count IN 
    SELECT 1
  LOOP
    -- just a placeholder
  END LOOP;
END $$;

-- Clear existing data and rebuild with expired included
-- Must clear FK references first
UPDATE order_items SET payout_id = NULL;
DELETE FROM payout_items;
DELETE FROM payouts;

DROP INDEX IF EXISTS idx_payouts_salon_period_unique;

DO $$
DECLARE
  rec RECORD;
  v_payout_id UUID;
  v_period_start DATE;
  v_period_end DATE;
  v_fee_pct NUMERIC;
  v_transaction_date TIMESTAMPTZ;
BEGIN
  -- Get platform fee percentage from system_settings
  SELECT COALESCE(value::numeric, 30) INTO v_fee_pct
  FROM system_settings WHERE key = 'platform_fee_percentage';
  
  IF v_fee_pct IS NULL THEN
    v_fee_pct := 30;
  END IF;

  -- Process redeemed/settled items (use redeemed_at as transaction date)
  FOR rec IN
    SELECT 
      oi.id AS order_item_id,
      oi.salon_profile_id,
      (COALESCE(oi.unit_price, 0) * COALESCE(oi.quantity, 1)) AS amount,
      oi.redeemed_at AS transaction_date,
      oi.settled_at,
      oi.status AS item_status
    FROM order_items oi
    WHERE oi.status IN ('redeemed', 'settled')
      AND oi.redeemed_at IS NOT NULL
      AND oi.salon_profile_id IS NOT NULL
    ORDER BY oi.redeemed_at ASC
  LOOP
    v_period_start := (date_trunc('month', rec.transaction_date) + INTERVAL '1 month')::DATE;
    v_period_end := (v_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

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

    INSERT INTO payout_items (payout_id, order_item_id, amount)
    VALUES (v_payout_id, rec.order_item_id, rec.amount)
    ON CONFLICT (payout_id, order_item_id) DO NOTHING;

    UPDATE order_items SET payout_id = v_payout_id WHERE id = rec.order_item_id;
  END LOOP;

  -- Process expired items (use redeem_end_date as transaction date)
  FOR rec IN
    SELECT 
      oi.id AS order_item_id,
      oi.salon_profile_id,
      (COALESCE(oi.unit_price, 0) * COALESCE(oi.quantity, 1)) AS amount,
      oi.redeem_end_date AS transaction_date,
      oi.updated_at,
      oi.status AS item_status
    FROM order_items oi
    WHERE oi.status = 'expired'
      AND oi.redeem_end_date IS NOT NULL
      AND oi.salon_profile_id IS NOT NULL
    ORDER BY oi.redeem_end_date ASC
  LOOP
    v_period_start := (date_trunc('month', rec.transaction_date::TIMESTAMPTZ) + INTERVAL '1 month')::DATE;
    v_period_end := (v_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

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
        'pending'
      )
      RETURNING id INTO v_payout_id;
    END IF;

    INSERT INTO payout_items (payout_id, order_item_id, amount)
    VALUES (v_payout_id, rec.order_item_id, rec.amount)
    ON CONFLICT (payout_id, order_item_id) DO NOTHING;

    UPDATE order_items SET payout_id = v_payout_id WHERE id = rec.order_item_id;
  END LOOP;

  -- Update all payout totals
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

-- Re-create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_payouts_salon_period_unique
  ON payouts(salon_profile_id, period_start, period_end);
