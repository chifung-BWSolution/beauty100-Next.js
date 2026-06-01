-- Re-backfill payouts for any redeemed order_items that are missing from payouts
-- This handles items redeemed after the initial backfill migration

DO $$
DECLARE
  rec RECORD;
  v_payout_id UUID;
  v_period_start DATE;
  v_period_end DATE;
  v_fee_pct INTEGER;
BEGIN
  -- Get current fee percentage
  SELECT COALESCE((SELECT value::INTEGER FROM system_settings WHERE key = 'platform_fee_percentage'), 30) INTO v_fee_pct;

  FOR rec IN
    SELECT 
      oi.id AS order_item_id,
      oi.salon_profile_id,
      oi.unit_price * oi.quantity AS amount,
      oi.redeemed_at,
      oi.settled_at,
      CASE 
        WHEN EXTRACT(DAY FROM oi.redeemed_at) < 7 THEN
          date_trunc('month', oi.redeemed_at)::DATE
        ELSE
          (date_trunc('month', oi.redeemed_at) + INTERVAL '1 month')::DATE
      END AS payout_month_start
    FROM order_items oi
    WHERE oi.status IN ('redeemed', 'settled')
      AND oi.redeemed_at IS NOT NULL
      AND oi.salon_profile_id IS NOT NULL
      AND oi.payout_id IS NULL
    ORDER BY oi.redeemed_at ASC
  LOOP
    v_period_start := rec.payout_month_start;
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

    UPDATE payouts SET
      total_amount = (SELECT COALESCE(SUM(amount), 0) FROM payout_items WHERE payout_id = v_payout_id),
      item_count = (SELECT COUNT(*) FROM payout_items WHERE payout_id = v_payout_id),
      updated_at = NOW()
    WHERE id = v_payout_id;
  END LOOP;
END $$;
