-- Add order_number column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Add salon_profile_id to orders for linking order to salon
ALTER TABLE orders ADD COLUMN IF NOT EXISTS salon_profile_id UUID;

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_salon_profile_id ON orders(salon_profile_id);
