ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view own orders" ON orders;
CREATE POLICY "Members can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Service role full access orders" ON orders;
CREATE POLICY "Service role full access orders"
  ON orders FOR ALL
  USING (auth.role() = 'service_role');

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view own order items" ON order_items;
CREATE POLICY "Members can view own order items"
  ON order_items FOR SELECT
  USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Service role full access order_items" ON order_items;
CREATE POLICY "Service role full access order_items"
  ON order_items FOR ALL
  USING (auth.role() = 'service_role');
