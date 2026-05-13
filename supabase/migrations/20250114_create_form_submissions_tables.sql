CREATE TABLE IF NOT EXISTS kol_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  platform_link TEXT NOT NULL,
  followers TEXT NOT NULL,
  content_direction TEXT NOT NULL,
  region TEXT NOT NULL,
  experience TEXT,
  introduction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
