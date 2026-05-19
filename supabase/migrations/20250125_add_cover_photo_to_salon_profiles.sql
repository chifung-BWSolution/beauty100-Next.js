ALTER TABLE salon_profiles ADD COLUMN IF NOT EXISTS cover_photo TEXT;
ALTER TABLE salon_profile_versions ADD COLUMN IF NOT EXISTS cover_photo TEXT;
