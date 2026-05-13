import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://www.beauty100.com.hk';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/explore-salons`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/topics`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/entertainment`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/facial-care`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/anti-aging`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/body-care`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/skincare`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/healthy-diet`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/kol`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic pages from blog articles
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: articles } = await supabase
        .from('blog_articles')
        .select('handle, category, updated_at, published_at')
        .eq('status', 'active')
        .order('published_at', { ascending: false })
        .limit(500);

      if (articles) {
        articlePages = articles.map((article) => {
          let path = `/topics/${article.handle}`;
          if (article.category === 'facial-care') path = `/facial-care/${article.handle}`;
          else if (article.category === 'anti-aging') path = `/anti-aging/${article.handle}`;
          else if (article.category === 'body-care') path = `/body-care/${article.handle}`;
          else if (article.category === 'skincare') path = `/skincare/${article.handle}`;
          else if (article.category === 'healthy-diet') path = `/healthy-diet/${article.handle}`;
          else if (article.category === 'entertainment') path = `/entertainment/${article.handle}`;

          return {
            url: `${siteUrl}${path}`,
            lastModified: new Date(article.updated_at || article.published_at),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          };
        });
      }
    }
  } catch (e) {
    // Silently fail - sitemap will still have static pages
    console.error('Sitemap: failed to fetch articles', e);
  }

  // Dynamic salon pages
  let salonPages: MetadataRoute.Sitemap = [];
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: salons } = await supabase
        .from('salon_profiles')
        .select('id, updated_at')
        .limit(500);

      if (salons) {
        salonPages = salons.map((salon) => ({
          url: `${siteUrl}/salon/${salon.id}`,
          lastModified: new Date(salon.updated_at || new Date()),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
      }
    }
  } catch (e) {
    console.error('Sitemap: failed to fetch salons', e);
  }

  return [...staticPages, ...articlePages, ...salonPages];
}
