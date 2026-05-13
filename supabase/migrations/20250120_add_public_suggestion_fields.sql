ALTER TABLE salon_profile_versions
  ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'owner_edit',
  ADD COLUMN IF NOT EXISTS submitter_name TEXT,
  ADD COLUMN IF NOT EXISTS submitter_email TEXT,
  ADD COLUMN IF NOT EXISTS submitter_phone TEXT,
  ADD COLUMN IF NOT EXISTS change_reason TEXT,
  ADD COLUMN IF NOT EXISTS submitter_note TEXT,
  ADD COLUMN IF NOT EXISTS is_shop_owner BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS closed_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS renovation_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reopened_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS new_opening_date TIMESTAMPTZ;

ALTER TABLE salon_profiles
  ADD COLUMN IF NOT EXISTS salon_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS closed_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS renovation_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reopened_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS new_opening_date TIMESTAMPTZ;

DROP POLICY IF EXISTS "Allow anonymous public suggestions" ON salon_profile_versions;
CREATE POLICY "Allow anonymous public suggestions" ON salon_profile_versions
  FOR INSERT
  WITH CHECK (submission_type = 'public_suggestion');
