'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import {
  Clock, ArrowRight, Eye, Flame, TrendingUp, Star,
  Bookmark, Tag, Sparkles,
} from 'lucide-react';
import { HorizontalBannerAd, NativePromoCard, SidebarAdUnit } from '@/components/ads/AdComponents';
import { supabase } from '@/lib/supabase';
import { useSidebarData } from '@/lib/useSidebarData';

/* ═══════════════════════════════════════════════════════════════
   DATA & TYPES
   ═══════════════════════════════════════════════════════════════ */

interface Article {
  title: string;
  description: string;
  image: string;
  tag: string;
  date: string;
  views: string;
  featured?: boolean;
  slug?: string;
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FeaturedMainCard({ article }: { article: Article }) {
  return (
    <Link href={`/facial-care/${article.slug || ''}`} className="group relative block rounded-2xl overflow-hidden bg-slate-900 h-[320px] sm:h-[360px] lg:h-full">
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
        <Badge className="bg-teal-500 text-white border-0 text-[12px] mb-3 shadow-md">{article.tag}</Badge>
        <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-white leading-tight mb-2 group-hover:text-teal-200 transition-colors">
          {article.title}
        </h2>
        <p className="text-sm text-white/70 line-clamp-2 max-w-lg">{article.description}</p>
        <div className="flex items-center gap-3 mt-3 text-[12px] text-white/50">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.date}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views} 瀏覽</span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedSupportCard({ article }: { article: Article }) {
  return (
    <Link href={`/facial-care/${article.slug || ''}`} className="group relative block rounded-xl overflow-hidden bg-slate-900 h-[140px] sm:h-[130px] lg:h-full">
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Badge className="bg-white/20 text-white border-0 text-[14px] backdrop-blur-sm mb-1.5">{article.tag}</Badge>
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-teal-200 transition-colors">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/facial-care/${article.slug || ''}`}
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
          <Badge className="bg-teal-500 text-white border-0 text-[14px] shadow-sm">{article.tag}</Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2 group-hover:text-teal-600 transition-colors leading-snug">
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
          <span className="flex items-center gap-1 text-sm text-teal-500 font-medium group-hover:gap-2 transition-all">
            閱讀更多 <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleCardWide({ article }: { article: Article }) {
  return (
    <Link
      href={`/facial-care/${article.slug || ''}`}
      className="group flex gap-4 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100/80 p-3"
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-28 h-20 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="flex flex-col justify-center min-w-0">
        <Badge className="bg-teal-50 text-teal-500 border-0 text-[12px] w-fit mb-1">{article.tag}</Badge>
        <h4 className="text-[14px] font-semibold text-slate-700 line-clamp-2 group-hover:text-teal-600 transition-colors leading-snug">
          {article.title}
        </h4>
        <span className="flex items-center gap-1 text-[14px] text-slate-400 mt-1">
          <Clock className="w-2.5 h-2.5" />{article.date}
        </span>
      </div>
    </Link>
  );
}

/* ── Sidebar Block ── */

function SidebarSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3.5">
        <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #5eead4, #0d9488)' }} />
        <Icon className="w-3.5 h-3.5 text-teal-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function FacialCarePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const { trendingArticles, editorPicks, latestUpdates } = useSidebarData('facial-care');

  useEffect(() => {
    async function fetchArticles() {
      try {
        const { data, error } = await supabase
          .from('blog_articles')
          .select('*')
          .eq('category', 'facial-care')
          .eq('status', 'active')
          .order('published_at', { ascending: false });

        if (error) {
          console.error('Error fetching articles:', error);
          return;
        }

        if (data) {
          const mapped: Article[] = data.map((item: any, idx: number) => ({
            title: item.title || '',
            description: item.seo_description || '',
            image: item.cover_image_url || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
            tag: item.tags?.[0] || '面部護理',
            date: item.published_at
              ? new Date(item.published_at).toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' })
              : '',
            views: `${Math.floor(Math.random() * 15 + 5)}K`,
            featured: idx < 4,
            slug: item.handle,
          }));
          setArticles(mapped);

          // Extract popular tags from all articles
          const tagCounts: Record<string, number> = {};
          data.forEach((item: any) => {
            if (item.tags && Array.isArray(item.tags)) {
              item.tags.forEach((t: string) => {
                tagCounts[t] = (tagCounts[t] || 0) + 1;
              });
            }
          });
          const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([tag]) => tag)
            .slice(0, 16);
          setPopularTags(sortedTags.length > 0 ? sortedTags : ['面部護理', '深層清潔', '保濕', '美白', '抗老', '敏感肌']);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  // Get featured articles (first 4)
  const featuredArticles = useMemo(() => {
    return articles.filter((a) => a.featured).slice(0, 4);
  }, [articles]);

  // Main feed = everything except the top featured
  const feedArticles = useMemo(() => {
    const featuredIds = new Set(featuredArticles.map((a) => a.title));
    return articles.filter((a) => !featuredIds.has(a.title));
  }, [articles, featuredArticles]);

  const mainFeatured = featuredArticles[0];
  const supportFeatured = featuredArticles.slice(1, 4);

  return (
    <PublicLayout>
      {/* ═══════════ 1. PAGE HEADER ═══════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 30%, #f0f9ff 70%, #f0fdfa 100%)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-teal-500" />
            <span className="text-[12px] font-semibold tracking-[0.15em] text-teal-400 uppercase">Facial Care</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            面部護理
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
            專業面部護理資訊，從日常護膚到專業療程，幫你揀啱最適合嘅面部護理方案，養出健康靚麗肌膚。
          </p>
        </div>
      </section>

      {/* ═══════════ 2. DIVIDER ═══════════ */}
      <div className="border-b border-slate-100" />

      {/* ═══════════ AD: Slim Banner Below Tabs ═══════════ */}
      <HorizontalBannerAd variant="slim" />

      {/* ═══════════ 3. CONTENT AREA ═══════════ */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Main Column ── */}
          <div className="flex-1 min-w-0">
            {/* Featured Zone */}
            {!loading && mainFeatured && (
              <section className="mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[460px]">
                  <div className="lg:col-span-7 h-[320px] sm:h-[360px] lg:h-full">
                    <FeaturedMainCard article={mainFeatured} />
                  </div>
                  <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:h-full">
                    {supportFeatured.map((article, i) => (
                      <FeaturedSupportCard key={i} article={article} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Main Article Feed */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #5eead4, #0d9488)' }} />
                  最新文章
                </h2>
                <span className="text-[12px] text-slate-400">
                  共 {articles.length} 篇文章
                </span>
              </div>

              {loading ? (
                <div className="text-center py-16 bg-white/60 rounded-xl border border-slate-100/60">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-teal-50">
                    <Clock className="w-7 h-7 text-teal-300 animate-pulse" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 mb-1">載入中...</h3>
                </div>
              ) : feedArticles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {feedArticles.map((article, i) => (
                    <React.Fragment key={i}>
                      <ArticleCard article={article} />
                      {(i + 1) % 6 === 0 && i < feedArticles.length - 1 && (
                        <NativePromoCard variant={i % 12 === 5 ? 'treatment' : 'salon'} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/60 rounded-xl border border-slate-100/60">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-teal-50">
                    <Clock className="w-7 h-7 text-teal-300" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 mb-1">更多精彩內容即將推出</h3>
                  <p className="text-sm text-slate-400">敬請期待更多面部護理相關文章！</p>
                </div>
              )}
            </section>

            {/* ── Latest Updates (mobile only) ── */}
            <section className="mt-10 lg:hidden">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #5eead4, #0d9488)' }} />
                <TrendingUp className="w-4 h-4 text-teal-500" />
                最新更新
              </h2>
              <div className="space-y-3">
                {latestUpdates.slice(0, 5).map((article, i) => (
                  <ArticleCardWide key={i} article={{ ...article, description: '', views: article.views || '' }} />
                ))}
              </div>
            </section>
          </div>

          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-[300px] shrink-0 space-y-5">
            {/* 熱門文章 */}
            <SidebarSection title="熱門文章" icon={Flame}>
              <div className="space-y-3">
                {trendingArticles.map((article, i) => (
                  <Link
                    key={i}
                    href={`/facial-care/${article.slug}`}
                    className="group flex items-start gap-3 hover:bg-teal-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <span className="text-lg font-bold text-teal-200 shrink-0 w-6 text-right leading-tight">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-2 group-hover:text-teal-600 transition-colors leading-snug">
                        {article.title}
                      </h4>
                      <span className="text-[14px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Eye className="w-2.5 h-2.5" />{article.views} 瀏覽
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </SidebarSection>

            {/* 編輯推薦 */}
            <SidebarSection title="編輯推薦" icon={Star}>
              <div className="space-y-2.5">
                {editorPicks.map((pick, i) => (
                  <Link
                    key={i}
                    href={`/facial-care/${pick.slug}`}
                    className="group flex items-center gap-2.5 hover:bg-teal-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-1 group-hover:text-teal-600 transition-colors">
                        {pick.title}
                      </h4>
                      <span className="text-[12px] text-teal-400 font-medium">{pick.tag}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </SidebarSection>

            {/* 最新更新 */}
            <SidebarSection title="最新更新" icon={TrendingUp}>
              <div className="space-y-2.5">
                {latestUpdates.slice(0, 10).map((article, i) => (
                  <Link
                    key={i}
                    href={`/facial-care/${article.slug}`}
                    className="group flex gap-3 items-start hover:bg-teal-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-14 h-10 rounded-md object-cover shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h4 className="text-[12px] font-medium text-slate-700 line-clamp-2 group-hover:text-teal-600 transition-colors leading-snug">
                        {article.title}
                      </h4>
                      <span className="text-[12px] text-slate-400">{article.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </SidebarSection>

            {/* 熱門標籤 */}
            <SidebarSection title="熱門標籤" icon={Tag}>
              <div className="flex flex-wrap gap-1.5">
                {popularTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/topics/tag/${encodeURIComponent(tag)}`}
                    className="text-[14px] px-2.5 py-1 rounded-full bg-teal-50 text-teal-500 font-medium hover:bg-teal-100 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </SidebarSection>

            {/* Sidebar Ad Unit */}
            <SidebarAdUnit variant="salon" />
          </aside>
        </div>
      </div>

      {/* ═══════════ MOBILE SIDEBAR MODULES ═══════════ */}
      <div className="lg:hidden max-w-[1280px] mx-auto px-4 sm:px-6 pb-10 space-y-6">
        {/* 熱門標籤 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #5eead4, #0d9488)' }} />
            <Tag className="w-3.5 h-3.5 text-teal-500" />
            熱門標籤
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={`/topics/tag/${encodeURIComponent(tag)}`}
                className="text-[14px] px-2.5 py-1 rounded-full bg-teal-50 text-teal-500 font-medium hover:bg-teal-100 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* 編輯推薦 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #5eead4, #0d9488)' }} />
            <Star className="w-3.5 h-3.5 text-teal-500" />
            編輯推薦
          </h3>
          <div className="space-y-2">
            {editorPicks.map((pick, i) => (
              <Link
                key={i}
                href={`/facial-care/${pick.slug}`}
                className="group flex items-center gap-2.5 py-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                <div>
                  <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-teal-600 transition-colors">
                    {pick.title}
                  </h4>
                  <span className="text-[12px] text-teal-400 font-medium">{pick.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 熱門文章 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #5eead4, #0d9488)' }} />
            <Flame className="w-3.5 h-3.5 text-teal-500" />
            熱門文章
          </h3>
          <div className="space-y-2.5">
            {trendingArticles.slice(0, 10).map((article, i) => (
              <Link
                key={i}
                href={`/facial-care/${article.slug}`}
                className="group flex items-start gap-3 py-1"
              >
                <span className="text-base font-bold text-teal-200 shrink-0 w-5 text-right leading-tight">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-teal-600 transition-colors leading-snug">
                    {article.title}
                  </h4>
                  <span className="text-[14px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Eye className="w-2.5 h-2.5" />{article.views} 瀏覽
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
