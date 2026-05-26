CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  salon_profile_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_member_id ON cart_items(member_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_treatment_id ON cart_items(treatment_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_unique ON cart_items(member_id, treatment_id);

ALTER TABLE cart_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;
