-- Order number sequence table: tracks per-salon per-month sequence
CREATE TABLE IF NOT EXISTS order_number_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_profile_id UUID NOT NULL,
  year_month TEXT NOT NULL,
  last_seq INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(salon_profile_id, year_month)
);

-- Function to generate order number atomically
-- Format: {salon_code}-{YYMM}{seq3}
-- salon_code = first 4 chars of salon_profile_id (zero-padded hex)
-- YYMM = 2-digit year + 2-digit month
-- seq3 = 3-digit sequence number (resets monthly)
CREATE OR REPLACE FUNCTION generate_order_number(p_salon_profile_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_year_month TEXT;
  v_seq INTEGER;
  v_salon_code TEXT;
  v_order_number TEXT;
BEGIN
  -- Get current YYMM
  v_year_month := TO_CHAR(NOW(), 'YYMM');
  
  -- Get salon code (first 4 hex chars of UUID)
  v_salon_code := UPPER(LEFT(REPLACE(p_salon_profile_id::TEXT, '-', ''), 4));

  -- Upsert and increment sequence atomically
  INSERT INTO order_number_sequences (salon_profile_id, year_month, last_seq, updated_at)
  VALUES (p_salon_profile_id, v_year_month, 1, NOW())
  ON CONFLICT (salon_profile_id, year_month)
  DO UPDATE SET 
    last_seq = order_number_sequences.last_seq + 1,
    updated_at = NOW()
  RETURNING last_seq INTO v_seq;

  -- Build order number: XXXX-YYMM001
  v_order_number := v_salon_code || '-' || v_year_month || LPAD(v_seq::TEXT, 3, '0');

  RETURN v_order_number;
END;
$$;
