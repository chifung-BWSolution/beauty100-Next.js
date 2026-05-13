CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  seo_title TEXT,
  seo_description TEXT,
  blog_handle TEXT,
  blog_title TEXT,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  cover_image_url TEXT,
  cover_image_alt TEXT,
  intro JSONB,
  section_1_title TEXT,
  section_1_content JSONB,
  section_1_images TEXT[],
  section_2_title TEXT,
  section_2_content JSONB,
  section_2_images TEXT[],
  section_3_title TEXT,
  section_3_content JSONB,
  section_3_images TEXT[],
  section_4_title TEXT,
  section_4_content JSONB,
  section_4_images TEXT[],
  section_5_title TEXT,
  section_5_content JSONB,
  section_5_images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;
