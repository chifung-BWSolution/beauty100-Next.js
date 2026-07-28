-- Expand kol_applications to support EmailMeForm-style KOL join form
ALTER TABLE public.kol_applications
  ALTER COLUMN platform_name DROP NOT NULL,
  ALTER COLUMN platform_link DROP NOT NULL,
  ALTER COLUMN followers DROP NOT NULL,
  ALTER COLUMN content_direction DROP NOT NULL,
  ALTER COLUMN region DROP NOT NULL,
  ALTER COLUMN introduction DROP NOT NULL;

ALTER TABLE public.kol_applications
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS age_range text,
  ADD COLUMN IF NOT EXISTS birth_month text,
  ADD COLUMN IF NOT EXISTS residence_district text,
  ADD COLUMN IF NOT EXISTS work_district text,
  ADD COLUMN IF NOT EXISTS form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}'::text[];

DROP POLICY IF EXISTS "Anon can upload kol application photos" ON storage.objects;
CREATE POLICY "Anon can upload kol application photos"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'public'
    AND (storage.foldername(name))[1] = 'kol-applications'
  );
