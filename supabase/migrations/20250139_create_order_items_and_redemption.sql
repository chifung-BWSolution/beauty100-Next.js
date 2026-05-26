-- Create order_items table for individual treatment redemption tracking
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  treatment_id UUID NOT NULL,
  salon_profile_id UUID,
  member_id UUID NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  image_url TEXT,
  salon_name TEXT,
  redeem_start_date DATE,
  redeem_end_date DATE,
  status TEXT NOT NULL DEFAULT 'pending_use',
  redeemed_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_member_id ON order_items(member_id);
CREATE INDEX IF NOT EXISTS idx_order_items_salon_profile_id ON order_items(salon_profile_id);
CREATE INDEX IF NOT EXISTS idx_order_items_treatment_id ON order_items(treatment_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);

-- Create salon_qr_codes table
CREATE TABLE IF NOT EXISTS salon_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_profile_id UUID NOT NULL,
  qr_secret TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salon_qr_codes_salon_profile_id ON salon_qr_codes(salon_profile_id);
CREATE INDEX IF NOT EXISTS idx_salon_qr_codes_qr_secret ON salon_qr_codes(qr_secret);

-- Function to auto-generate QR secret for salons that don't have one
CREATE OR REPLACE FUNCTION generate_salon_qr_secret(p_salon_profile_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_secret TEXT;
BEGIN
  SELECT qr_secret INTO v_secret FROM salon_qr_codes 
  WHERE salon_profile_id = p_salon_profile_id AND is_active = true
  LIMIT 1;
  
  IF v_secret IS NULL THEN
    v_secret := encode(gen_random_bytes(16), 'hex');
    INSERT INTO salon_qr_codes (salon_profile_id, qr_secret)
    VALUES (p_salon_profile_id, v_secret);
  END IF;
  
  RETURN v_secret;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to populate order_items from orders.items JSONB when order is paid
CREATE OR REPLACE FUNCTION populate_order_items_on_paid()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      INSERT INTO order_items (
        order_id, treatment_id, salon_profile_id, member_id, name, 
        quantity, unit_price, image_url, salon_name, 
        redeem_start_date, redeem_end_date, status
      ) VALUES (
        NEW.id,
        (item->>'treatment_id')::UUID,
        CASE WHEN item->>'salon_profile_id' IS NOT NULL AND item->>'salon_profile_id' != '' 
          THEN (item->>'salon_profile_id')::UUID ELSE NULL END,
        NEW.member_id,
        item->>'name',
        COALESCE((item->>'quantity')::INTEGER, 1),
        COALESCE((item->>'promo_price')::INTEGER, (item->>'original_price')::INTEGER),
        item->>'image_url',
        item->>'salon_name',
        CASE WHEN item->>'redeem_start_date' IS NOT NULL AND item->>'redeem_start_date' != '' 
          THEN (item->>'redeem_start_date')::DATE ELSE NULL END,
        CASE WHEN item->>'redeem_end_date' IS NOT NULL AND item->>'redeem_end_date' != '' 
          THEN (item->>'redeem_end_date')::DATE ELSE NULL END,
        'pending_use'
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_populate_order_items ON orders;
CREATE TRIGGER trigger_populate_order_items
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION populate_order_items_on_paid();

-- Backfill existing paid orders into order_items
INSERT INTO order_items (order_id, treatment_id, salon_profile_id, member_id, name, quantity, unit_price, image_url, salon_name, redeem_start_date, redeem_end_date, status)
SELECT 
  o.id,
  (item->>'treatment_id')::UUID,
  CASE WHEN item->>'salon_profile_id' IS NOT NULL AND item->>'salon_profile_id' != '' 
    THEN (item->>'salon_profile_id')::UUID ELSE NULL END,
  o.member_id,
  item->>'name',
  COALESCE((item->>'quantity')::INTEGER, 1),
  COALESCE((item->>'promo_price')::INTEGER, (item->>'original_price')::INTEGER),
  item->>'image_url',
  item->>'salon_name',
  CASE WHEN item->>'redeem_start_date' IS NOT NULL AND item->>'redeem_start_date' != '' 
    THEN (item->>'redeem_start_date')::DATE ELSE NULL END,
  CASE WHEN item->>'redeem_end_date' IS NOT NULL AND item->>'redeem_end_date' != '' 
    THEN (item->>'redeem_end_date')::DATE ELSE NULL END,
  'pending_use'
FROM orders o, jsonb_array_elements(o.items) AS item
WHERE o.status = 'paid'
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id);
