-- Rebuild payouts: group by user (created_by on salon_profiles) instead of salon
-- Also include expired items (using redeem_end_date as transaction date)

-- Step 1: Clear all payout references
UPDATE order_items SET payout_id = NULL;
DELETE FROM payout_items;
DELETE FROM payouts;

-- Step 2: Add user_id column to payouts and change unique constraint
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS user_id UUID;

-- Drop old unique constraint
ALTER TABLE payouts DROP CONSTRAINT IF EXISTS payouts_salon_profile_id_period_start_period_end_key;
DROP INDEX IF EXISTS idx_payouts_salon_period_unique;

-- Make salon_profile_id nullable (since payout now spans multiple salons)
ALTER TABLE payouts ALTER COLUMN salon_profile_id DROP NOT NULL;

-- Add unique constraint on user_id + period
CREATE UNIQUE INDEX IF NOT EXISTS idx_payouts_user_period_unique
  ON payouts(user_id, period_start, period_end);

-- Step 3: Rebuild payouts grouped by user + period
DO $$
DECLARE
  rec RECORD;
  v_payout_id UUID;
  v_period_start DATE;
  v_period_end DATE;
  v_fee_pct NUMERIC;
  v_user_id UUID;
BEGIN
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
      sp.created_by AS owner_id,
      (COALESCE(oi.unit_price, 0) * COALESCE(oi.quantity, 1)) AS amount,
      oi.redeemed_at AS transaction_date,
      oi.settled_at
    FROM order_items oi
    JOIN salon_profiles sp ON sp.id = oi.salon_profile_id
    WHERE oi.status IN ('redeemed', 'settled')
      AND oi.redeemed_at IS NOT NULL
      AND oi.salon_profile_id IS NOT NULL
    ORDER BY oi.redeemed_at ASC
  LOOP
    v_user_id := rec.owner_id;
    v_period_start := (date_trunc('month', rec.transaction_date) + INTERVAL '1 month')::DATE;
    v_period_end := (v_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    SELECT id INTO v_payout_id
    FROM payouts
    WHERE user_id = v_user_id
      AND period_start = v_period_start
      AND period_end = v_period_end;

    IF v_payout_id IS NULL THEN
      INSERT INTO payouts (user_id, salon_profile_id, period_start, period_end, total_amount, platform_fee, net_amount, item_count, status)
      VALUES (
        v_user_id,
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
      sp.created_by AS owner_id,
      (COALESCE(oi.unit_price, 0) * COALESCE(oi.quantity, 1)) AS amount,
      oi.redeem_end_date AS transaction_date
    FROM order_items oi
    JOIN salon_profiles sp ON sp.id = oi.salon_profile_id
    WHERE oi.status = 'expired'
      AND oi.redeem_end_date IS NOT NULL
      AND oi.salon_profile_id IS NOT NULL
    ORDER BY oi.redeem_end_date ASC
  LOOP
    v_user_id := rec.owner_id;
    v_period_start := (date_trunc('month', rec.transaction_date::TIMESTAMPTZ) + INTERVAL '1 month')::DATE;
    v_period_end := (v_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    SELECT id INTO v_payout_id
    FROM payouts
    WHERE user_id = v_user_id
      AND period_start = v_period_start
      AND period_end = v_period_end;

    IF v_payout_id IS NULL THEN
      INSERT INTO payouts (user_id, salon_profile_id, period_start, period_end, total_amount, platform_fee, net_amount, item_count, status)
      VALUES (
        v_user_id,
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
    platform_fee = ROUND(sub.total * v_fee_pct / 100),
    net_amount = ROUND(sub.total * (100 - v_fee_pct) / 100),
    updated_at = NOW()
  FROM (
    SELECT payout_id, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS cnt
    FROM payout_items
    GROUP BY payout_id
  ) sub
  WHERE p.id = sub.payout_id;

END $$;
