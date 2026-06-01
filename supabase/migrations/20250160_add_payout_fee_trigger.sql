-- Create a trigger function to auto-calculate platform_fee and net_amount
-- whenever total_amount is updated on payouts table
CREATE OR REPLACE FUNCTION calculate_payout_fees()
RETURNS TRIGGER AS $$
DECLARE
  v_fee_pct INTEGER;
BEGIN
  SELECT COALESCE(value::INTEGER, 30) INTO v_fee_pct
  FROM system_settings
  WHERE key = 'platform_fee_percentage';

  IF v_fee_pct IS NULL THEN
    v_fee_pct := 30;
  END IF;

  NEW.platform_fee := ROUND(NEW.total_amount * v_fee_pct / 100.0);
  NEW.net_amount := NEW.total_amount - NEW.platform_fee;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_payout_fees ON payouts;
CREATE TRIGGER trg_calculate_payout_fees
  BEFORE INSERT OR UPDATE OF total_amount ON payouts
  FOR EACH ROW
  EXECUTE FUNCTION calculate_payout_fees();

-- Re-trigger existing payouts to recalculate
UPDATE payouts SET total_amount = total_amount WHERE total_amount > 0;
