ALTER TABLE payout_settings ADD COLUMN IF NOT EXISTS bank_code TEXT;
ALTER TABLE payout_settings ADD COLUMN IF NOT EXISTS branch_code TEXT;
ALTER TABLE payout_settings ADD COLUMN IF NOT EXISTS payout_currency TEXT DEFAULT 'HKD';
