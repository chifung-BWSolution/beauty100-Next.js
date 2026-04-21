CREATE TABLE IF NOT EXISTS backfill_progress (
  id TEXT PRIMARY KEY DEFAULT 'current',
  status TEXT NOT NULL DEFAULT 'idle',
  total_profiles INTEGER DEFAULT 0,
  processed INTEGER DEFAULT 0,
  updated INTEGER DEFAULT 0,
  skipped INTEGER DEFAULT 0,
  api_errors INTEGER DEFAULT 0,
  current_salon TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO backfill_progress (id, status)
VALUES ('current', 'idle')
ON CONFLICT (id) DO NOTHING;
