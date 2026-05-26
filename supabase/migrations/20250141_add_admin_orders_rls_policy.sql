-- Allow admin users to view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Allow admin users to view all order_items
DROP POLICY IF EXISTS "Admins can view all order_items" ON order_items;
CREATE POLICY "Admins can view all order_items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Also add a policy for authenticated users to see their own orders
-- (in case the member_id doesn't match auth.uid but matches some other ID)
-- Keep existing policy as-is, but let's also allow viewing by auth.uid() match on member_id
