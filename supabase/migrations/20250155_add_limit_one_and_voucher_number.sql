-- Add limit_one_per_customer to treatments table
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS limit_one_per_customer BOOLEAN NOT NULL DEFAULT false;

-- Add voucher_number to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS voucher_number TEXT UNIQUE;

-- Create a sequence for voucher numbers (5-digit)
CREATE SEQUENCE IF NOT EXISTS voucher_number_seq START WITH 10001 INCREMENT BY 1 MAXVALUE 99999 CYCLE;

-- Function to generate unique 5-digit voucher number
CREATE OR REPLACE FUNCTION generate_voucher_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_num INTEGER;
  v_voucher TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_num := nextval('voucher_number_seq');
    v_voucher := LPAD(v_num::TEXT, 5, '0');
    SELECT EXISTS(SELECT 1 FROM order_items WHERE voucher_number = v_voucher) INTO v_exists;
    IF NOT v_exists THEN
      RETURN v_voucher;
    END IF;
  END LOOP;
END;
$$;

-- Trigger to auto-assign voucher_number on order_items insert
CREATE OR REPLACE FUNCTION assign_voucher_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.voucher_number IS NULL THEN
    NEW.voucher_number := generate_voucher_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_voucher_number ON order_items;
CREATE TRIGGER trigger_assign_voucher_number
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION assign_voucher_number();

-- Backfill existing order_items with voucher numbers
UPDATE order_items SET voucher_number = generate_voucher_number() WHERE voucher_number IS NULL;
