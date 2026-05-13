ALTER TABLE blog_articles
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('draft', 'active'));

ALTER TABLE blog_articles
ADD COLUMN IF NOT EXISTS category TEXT;
