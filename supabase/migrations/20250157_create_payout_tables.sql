-- Payout settings per salon (bank info, payout day)
CREATE TABLE IF NOT EXISTS payout_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_profile_id UUID NOT NULL UNIQUE,
  payout_day INTEGER NOT NULL DEFAULT 7,
  bank_name TEXT,
  bank_account_number TEXT,
  account_holder_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_settings_salon ON payout_settings(salon_profile_id);

-- Payouts: one record per salon per payout period
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_profile_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_amount INTEGER NOT NULL DEFAULT 0,
  platform_fee INTEGER NOT NULL DEFAULT 0,
  net_amount INTEGER NOT NULL DEFAULT 0,
  item_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(salon_profile_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_payouts_salon ON payouts(salon_profile_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_period ON payouts(period_start, period_end);

-- Payout items: links payout to individual order_items
CREATE TABLE IF NOT EXISTS payout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(payout_id, order_item_id)
);

CREATE INDEX IF NOT EXISTS idx_payout_items_payout ON payout_items(payout_id);
CREATE INDEX IF NOT EXISTS idx_payout_items_order_item ON payout_items(order_item_id);

-- Add payout_id reference to order_items for quick lookup
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS payout_id UUID REFERENCES payouts(id);
CREATE INDEX IF NOT EXISTS idx_order_items_payout ON order_items(payout_id);
