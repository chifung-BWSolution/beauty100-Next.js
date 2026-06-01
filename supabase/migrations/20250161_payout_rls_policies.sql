-- RLS policies for payout tables
-- Allow merchants to read their own payout data

-- payouts: merchants can read their own salon's payouts
DROP POLICY IF EXISTS "Merchants can view own payouts" ON payouts;
CREATE POLICY "Merchants can view own payouts"
  ON payouts FOR SELECT
  USING (
    salon_profile_id IN (
      SELECT id FROM salon_profiles WHERE created_by = auth.uid()
    )
    OR
    salon_profile_id IN (
      SELECT salon_profile_id FROM salon_applications WHERE created_by = auth.uid() AND status = 'approved'
    )
  );

-- Admin can do everything on payouts
DROP POLICY IF EXISTS "Admin full access on payouts" ON payouts;
CREATE POLICY "Admin full access on payouts"
  ON payouts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- payout_items: merchants can read items belonging to their payouts
DROP POLICY IF EXISTS "Merchants can view own payout items" ON payout_items;
CREATE POLICY "Merchants can view own payout items"
  ON payout_items FOR SELECT
  USING (
    payout_id IN (
      SELECT id FROM payouts WHERE salon_profile_id IN (
        SELECT id FROM salon_profiles WHERE created_by = auth.uid()
      )
    )
  );

-- Admin can do everything on payout_items
DROP POLICY IF EXISTS "Admin full access on payout items" ON payout_items;
CREATE POLICY "Admin full access on payout items"
  ON payout_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- payout_settings: merchants can read/write their own salon's settings
DROP POLICY IF EXISTS "Merchants can manage own payout settings" ON payout_settings;
CREATE POLICY "Merchants can manage own payout settings"
  ON payout_settings FOR ALL
  USING (
    salon_profile_id IN (
      SELECT id FROM salon_profiles WHERE created_by = auth.uid()
    )
  );

-- Admin can do everything on payout_settings
DROP POLICY IF EXISTS "Admin full access on payout settings" ON payout_settings;
CREATE POLICY "Admin full access on payout settings"
  ON payout_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- system_settings: allow all authenticated users to read
DROP POLICY IF EXISTS "Authenticated users can read system settings" ON system_settings;
CREATE POLICY "Authenticated users can read system settings"
  ON system_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- system_settings: only admin can update
DROP POLICY IF EXISTS "Admin can update system settings" ON system_settings;
CREATE POLICY "Admin can update system settings"
  ON system_settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
