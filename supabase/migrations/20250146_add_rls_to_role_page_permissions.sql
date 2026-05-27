ALTER TABLE role_page_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read role_page_permissions" ON role_page_permissions;
CREATE POLICY "Authenticated users can read role_page_permissions"
  ON role_page_permissions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin can manage role_page_permissions" ON role_page_permissions;
CREATE POLICY "Admin can manage role_page_permissions"
  ON role_page_permissions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
