'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PublicLayout from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import {
  Clock, ArrowRight, Tag, ArrowLeft, TrendingUp, Flame, Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface Article {
  title: string;
  description: string;
  image: string;
  tag: string;
  date: string;
  slug: string;
  category: string;
}

interface SidebarArticle {
  title: string;
  slug: string;
  image: string;
  date: string;
  tag: string;
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/topics/${encodeURIComponent(article.slug)}`}
      className="group rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-slate-100/80 block"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5">
          <Badge className="bg-rose-500 text-white border-0 text-[14px] shadow-sm">{article.tag}</Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">
          {article.title}
        </h3>
        <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {article.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[14px] text-slate-400">
            <Clock className="w-3 h-3" />
            {article.date}
          </span>
          <span className="flex items-center gap-1 text-sm text-rose-500 font-medium group-hover:gap-2 transition-all">
            閱讀更多 <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function SidebarSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3.5">
        <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }} />
        <Icon className="w-3.5 h-3.5 text-rose-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

// Normalize a string by removing all whitespace variants (including full-width, zero-width, etc.)
function normalizeTag(s: string): string {
  return s.replace(/[\s\u00A0\u200B\u200C\u200D\uFEFF\u3000]/g, '').toLowerCase();
}

export default function TagPage() {
  const params = useParams();
  const tag = decodeURIComponent(params.tag as string).trim();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedTags, setRelatedTags] = useState<string[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<SidebarArticle[]>([]);

  useEffect(() => {
    async function fetchArticles() {
      if (!tag) {
        setLoading(false);
        return;
      }
      try {
        // Fetch all active articles with tags and filter client-side
        // This avoids issues with Postgres array contains and whitespace mismatches
        const { data: allData, error } = await supabase
          .from('blog_articles')
          .select('handle, title, seo_description, cover_image_url, tags, published_at, category')
          .eq('status', 'active')
          .not('tags', 'is', null)
          .order('published_at', { ascending: false });

        if (error) {
          console.error('Error fetching articles:', error);
          return;
        }

        // Filter client-side with aggressive normalization to handle any whitespace/unicode issues
        const normalizedTag = normalizeTag(tag);
        let data = (allData || []).filter((item: any) =>
          item.tags && Array.isArray(item.tags) &&
          item.tags.some((t: string) => t && normalizeTag(t) === normalizedTag)
        );

        // If still no results, also try partial match (tag might be substring)
        if (data.length === 0) {
          data = (allData || []).filter((item: any) =>
            item.tags && Array.isArray(item.tags) &&
            item.tags.some((t: string) => t && (
              normalizeTag(t).includes(normalizedTag) ||
              normalizedTag.includes(normalizeTag(t))
            ))
          );
        }

        // Final fallback: search by category match
        if (data.length === 0) {
          data = (allData || []).filter((item: any) =>
            item.category && normalizeTag(item.category).includes(normalizedTag)
          );
        }

        if (data) {
          const mapped: Article[] = data.map((item: any) => ({
            title: item.title,
            description: item.seo_description || '',
            image: item.cover_image_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
            tag: item.tags?.find((t: string) => t && t.trim() === tag) || item.tags?.[0] || tag,
            date: item.published_at ? new Date(item.published_at).toLocaleDateString('zh-TW') : '',
            slug: item.handle,
            category: item.category || '',
          }));
          setArticles(mapped);

          // Extract related tags from these articles
          const tagCounts: Record<string, number> = {};
          data.forEach((item: any) => {
            (item.tags || []).forEach((t: string) => {
              const trimmed = t && t.trim();
              if (trimmed && trimmed !== tag) {
                tagCounts[trimmed] = (tagCounts[trimmed] || 0) + 1;
              }
            });
          });
          const sorted = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([t]) => t)
            .slice(0, 12);
          setRelatedTags(sorted);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchTrending() {
      try {
        const { data } = await supabase
          .from('blog_articles')
          .select('handle, title, cover_image_url, tags, published_at')
          .eq('status', 'active')
          .order('published_at', { ascending: false })
          .limit(6);

        if (data) {
          setTrendingArticles(data.map((item) => ({
            title: item.title,
            slug: item.handle,
            image: item.cover_image_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
            date: item.published_at ? new Date(item.published_at).toLocaleDateString('zh-TW') : '',
            tag: item.tags?.[0] || '',
          })));
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    fetchArticles();
    fetchTrending();
  }, [tag]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Link
              href="/topics"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-500 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              返回焦點話題
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Tag className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">#{tag}</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  共 {articles.length} 篇相關文章
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content */}
            <main className="flex-1 min-w-0">
              {articles.length === 0 ? (
                <div className="text-center py-16">
                  <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">暫無相關文章</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {articles.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              )}
            </main>

            {/* Sidebar */}
            <aside className="w-full lg:w-[300px] shrink-0 space-y-4">
              {/* Related Tags */}
              {relatedTags.length > 0 && (
                <SidebarSection title="相關標籤" icon={Tag}>
                  <div className="flex flex-wrap gap-1.5">
                    {relatedTags.map((t) => (
                      <Link
                        key={t}
                        href={`/topics/tag/${encodeURIComponent(t)}`}
                        className="text-[14px] px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 font-medium hover:bg-rose-100 transition-colors"
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                </SidebarSection>
              )}

              {/* Trending Articles */}
              {trendingArticles.length > 0 && (
                <SidebarSection title="熱門文章" icon={Flame}>
                  <div className="space-y-3">
                    {trendingArticles.map((item, idx) => (
                      <Link
                        key={item.slug}
                        href={`/topics/${encodeURIComponent(item.slug)}`}
                        className="group flex items-start gap-3"
                      >
                        <span className="text-lg font-bold text-rose-300 group-hover:text-rose-500 transition-colors shrink-0 w-5">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-medium text-slate-700 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">{item.date}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </SidebarSection>
              )}
            </aside>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
