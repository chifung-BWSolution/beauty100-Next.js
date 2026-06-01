-- Add platform fee percentage to system_settings (30% = salon gets 70%)
INSERT INTO system_settings (key, value) VALUES ('platform_fee_percentage', '30')
ON CONFLICT (key) DO NOTHING;

-- Add payout_day system setting (default 7th of each month)
INSERT INTO system_settings (key, value) VALUES ('payout_day', '7')
ON CONFLICT (key) DO NOTHING;

-- Update existing payouts to recalculate platform_fee and net_amount based on 30% fee
UPDATE payouts SET
  platform_fee = ROUND(total_amount * 0.30),
  net_amount = total_amount - ROUND(total_amount * 0.30),
  updated_at = NOW()
WHERE platform_fee = 0 AND total_amount > 0;

-- Also update the backfill function for future use
-- When creating new payout_items, the amount stored is the original order amount
-- net_amount in payouts = total_amount * 0.70 (salon gets 70%)
-- platform_fee in payouts = total_amount * 0.30 (platform keeps 30%)
