import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

/**
 * Generate dynamic metadata for a blog article page.
 * Used in [slug]/layout.tsx files for SEO.
 */
export async function generateArticleMetadata(
  slug: string,
  category: string,
  fallbackTitle: string,
  fallbackDescription: string
): Promise<Metadata> {
  const siteUrl = 'https://www.beauty100.com.hk';

  if (!supabaseUrl || !supabaseKey) {
    return { title: fallbackTitle, description: fallbackDescription };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: article } = await supabase
      .from('blog_articles')
      .select('title, seo_description, cover_image_url, published_at, updated_at, tags')
      .eq('handle', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (!article) {
      return { title: fallbackTitle, description: fallbackDescription };
    }

    const description = article.seo_description || fallbackDescription;
    const articleUrl = `${siteUrl}/${category}/${encodeURIComponent(slug)}`;
    const imageUrl = article.cover_image_url || undefined;

    return {
      title: article.title,
      description,
      openGraph: {
        type: 'article',
        title: `${article.title} | Beauty100`,
        description,
        url: articleUrl,
        siteName: 'Beauty100',
        locale: 'zh_HK',
        images: imageUrl ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ] : undefined,
        publishedTime: article.published_at || undefined,
        modifiedTime: article.updated_at || undefined,
        tags: article.tags || undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${article.title} | Beauty100`,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
      alternates: {
        canonical: articleUrl,
      },
    };
  } catch (e) {
    return { title: fallbackTitle, description: fallbackDescription };
  }
}
