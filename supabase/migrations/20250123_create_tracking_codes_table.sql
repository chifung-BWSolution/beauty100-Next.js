CREATE TABLE IF NOT EXISTS tracking_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_type TEXT NOT NULL,
  code_value TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tracking_codes (code_type, code_value, enabled) VALUES
  ('google_analytics', '', false),
  ('google_ads', '', false),
  ('google_tag_manager', '', false)
ON CONFLICT DO NOTHING;
