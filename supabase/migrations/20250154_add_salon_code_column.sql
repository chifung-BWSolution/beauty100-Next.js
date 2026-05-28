-- Add salon_code column to salon_profiles
-- This is a unique 4-character alphanumeric code auto-generated for each salon
ALTER TABLE salon_profiles ADD COLUMN IF NOT EXISTS salon_code VARCHAR(4) UNIQUE;

-- Function to generate a random 4-char alphanumeric code that doesn't already exist
CREATE OR REPLACE FUNCTION generate_unique_salon_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
  v_attempts INTEGER := 0;
  v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
BEGIN
  LOOP
    v_attempts := v_attempts + 1;
    IF v_attempts > 100 THEN
      RAISE EXCEPTION 'Could not generate unique salon_code after 100 attempts';
    END IF;

    v_code := '';
    FOR i IN 1..4 LOOP
      v_code := v_code || SUBSTR(v_chars, FLOOR(RANDOM() * LENGTH(v_chars) + 1)::INTEGER, 1);
    END LOOP;

    SELECT EXISTS(SELECT 1 FROM salon_profiles WHERE salon_code = v_code) INTO v_exists;
    
    IF NOT v_exists THEN
      RETURN v_code;
    END IF;
  END LOOP;
END;
$$;

-- Trigger function: auto-assign salon_code on INSERT if not provided
CREATE OR REPLACE FUNCTION assign_salon_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.salon_code IS NULL OR NEW.salon_code = '' THEN
    NEW.salon_code := generate_unique_salon_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_salon_code ON salon_profiles;
CREATE TRIGGER trg_assign_salon_code
  BEFORE INSERT ON salon_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_salon_code();

-- Backfill all existing salons that don't have a salon_code
DO $$
DECLARE
  r RECORD;
  v_code TEXT;
BEGIN
  FOR r IN SELECT id FROM salon_profiles WHERE salon_code IS NULL
  LOOP
    v_code := generate_unique_salon_code();
    UPDATE salon_profiles SET salon_code = v_code WHERE id = r.id;
  END LOOP;
END;
$$;

-- Now make the column NOT NULL since all rows are backfilled and trigger handles new rows
ALTER TABLE salon_profiles ALTER COLUMN salon_code SET NOT NULL;

-- Update generate_order_number to use salon_code instead of UUID prefix
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
  v_year_month := TO_CHAR(NOW(), 'YYMM');
  
  -- Get salon_code from salon_profiles
  SELECT salon_code INTO v_salon_code
  FROM salon_profiles
  WHERE id = p_salon_profile_id;

  -- Fallback: if salon not found, use first 4 hex chars of UUID
  IF v_salon_code IS NULL THEN
    v_salon_code := UPPER(LEFT(REPLACE(p_salon_profile_id::TEXT, '-', ''), 4));
  END IF;

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
