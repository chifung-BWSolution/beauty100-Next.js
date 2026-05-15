ALTER TABLE salon_applications
ADD COLUMN IF NOT EXISTS salon_profile_id UUID;
