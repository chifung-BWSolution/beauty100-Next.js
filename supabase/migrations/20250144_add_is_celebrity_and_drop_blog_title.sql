ALTER TABLE blog_articles ADD COLUMN IF NOT EXISTS is_celebrity BOOLEAN DEFAULT FALSE;

UPDATE blog_articles SET is_celebrity = TRUE WHERE blog_title LIKE '%明星%';

ALTER TABLE blog_articles DROP COLUMN IF EXISTS blog_title;
