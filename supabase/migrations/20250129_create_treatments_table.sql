CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  salon_profile_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  original_price NUMERIC(10, 2) NOT NULL,
  promo_price NUMERIC(10, 2),
  promo_expiry DATE,
  limited_quantity INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatments_created_by ON treatments(created_by);
CREATE INDEX IF NOT EXISTS idx_treatments_salon_profile_id ON treatments(salon_profile_id);
CREATE INDEX IF NOT EXISTS idx_treatments_status ON treatments(status);
