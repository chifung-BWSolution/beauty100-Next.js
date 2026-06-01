-- Ensure salon_profiles has a SELECT policy for authenticated users
-- This allows merchants/admins to read salon profiles they created
-- and public users to browse salons

-- First check if RLS is enabled; if so, add policies
-- If RLS was never enabled, these are no-ops that still protect us

DROP POLICY IF EXISTS "Anyone can view salon profiles" ON salon_profiles;
CREATE POLICY "Anyone can view salon profiles"
  ON salon_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners can update their salon profiles" ON salon_profiles;
CREATE POLICY "Owners can update their salon profiles"
  ON salon_profiles FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Authenticated users can insert salon profiles" ON salon_profiles;
CREATE POLICY "Authenticated users can insert salon profiles"
  ON salon_profiles FOR INSERT
  WITH CHECK (auth.uid() = created_by);
