import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

import PublicLayout from '@/components/public/PublicLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, ArrowRight, Star, Heart, TrendingUp, Award, Eye,
  Zap, Sparkles, Palette, Apple, Shield, ChevronRight, Flame, Tag,
  Users,
} from 'lucide-react';
import { SalonCarousel, FeaturedSalon } from '@/components/public/SalonCarousel';

/* ───────────────────────────── DATA ───────────────────────────── */

const CATEGORIES = [
  { label: '面部護理', href: '/facial-care', icon: Sparkles, color: 'from-rose-400 to-pink-500', description: '專業面部護理知識' },
  { label: '回復青春', href: '/anti-aging', icon: Zap, color: 'from-purple-400 to-violet-500', description: '逆齡抗衰老秘訣' },
  { label: '身材管理', href: '/body-shaping', icon: Heart, color: 'from-red-400 to-rose-500', description: '塑形纖體方案' },
  { label: '化妝護膚', href: '/skincare', icon: Palette, color: 'from-fuchsia-400 to-pink-500', description: '化妝護膚技巧' },
  { label: '飲食健康', href: '/healthy-diet', icon: Apple, color: 'from-green-400 to-emerald-500', description: '健康飲食指南' },
  { label: '身體保養', href: '/body-care', icon: Shield, color: 'from-blue-400 to-cyan-500', description: '全身保養貼士' },
];

/* eslint-disable @typescript-eslint/no-explicit-any */

const CATEGORY_MAP: Record<string, { title: string; href: string }> = {
  'trending-topics': { title: '焦點話題', href: '/topics' },
  'entertainment': { title: '娛樂圈', href: '/entertainment' },
  'facial-care': { title: '面部護理', href: '/facial-care' },
  'anti-aging': { title: '回復青春', href: '/anti-aging' },
  'body-shaping': { title: '身材管理', href: '/body-shaping' },
  'skincare': { title: '化妝護膚', href: '/skincare' },
  'healthy-diet': { title: '飲食健康', href: '/healthy-diet' },
  'body-care': { title: '身體保養', href: '/body-care' },
};

function getArticleDetailPath(category: string, handle: string): string {
  if (category === 'anti-aging') {
    return `/anti-aging/${encodeURIComponent(handle)}`;
  }
  if (category === 'body-care') {
    return `/body-care/${encodeURIComponent(handle)}`;
  }
  return `/topics/${encodeURIComponent(handle)}`;
}

const PLATFORM_STATS = [
  { label: '合作美容院', value: '2,000+', icon: Award },
  { label: '專業文章', value: '2,000+', icon: TrendingUp },
  { label: '月均瀏覽', value: '100K+', icon: Eye },
  { label: '用戶好評', value: '4.8', icon: Star },
];

interface ArticleSectionData {
  title: string;
  href: string;
  articles: { title: string; image: string; tag?: string; href: string; description?: string }[];
}

/* ───────────────── SMALL COMPONENTS (Server) ───────────────── */

function SectionHeader({ title, href, subtitle }: { title: string; href: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }} />
          {title}
        </h2>
        {subtitle && <p className="text-sm text-slate-400 mt-1 ml-3">{subtitle}</p>}
      </div>
      <Link href={href} className="text-sm font-medium text-rose-500 hover:text-rose-600 flex items-center gap-0.5 shrink-0">
        查看全部 <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function ArticleCardLarge({ article }: { article: ArticleSectionData['articles'][0] }) {
  return (
    <Link href={article.href} className="group block rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100/80">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-rose-100 to-pink-50">
        <Image src={article.image} alt={article.title} fill loading="lazy" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
        {article.tag && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge className="bg-rose-500 text-white border-0 text-[14px] shadow-sm">{article.tag}</Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2 group-hover:text-rose-600 transition-colors">{article.title}</h3>
        {article.description && <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed">{article.description}</p>}
      </div>
    </Link>
  );
}

function ArticleCardSmall({ article }: { article: ArticleSectionData['articles'][0] }) {
  return (
    <Link href={article.href} className="group flex gap-3 items-start py-2.5 border-b border-slate-100/70 last:border-b-0 hover:bg-rose-50/30 -mx-1 px-1 rounded-md transition-colors">
      <div className="relative w-[72px] h-[52px] rounded-lg overflow-hidden shrink-0 bg-rose-50">
        <Image src={article.image} alt={article.title} fill loading="lazy" sizes="72px" className="object-cover" />
      </div>
      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">{article.title}</h4>
    </Link>
  );
}

/* ───────────────── SERVER DATA FETCHING ───────────────── */

function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

function safeParseTags(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return val.trim() ? [val.trim()] : [];
    }
  }
  return [];
}

async function fetchPageData() {
  const supabase = createServerSupabase();
  if (!supabase) {
    return { featuredSalons: [], heroFeatured: null, heroSupporting: [], trendingArticles: [], editorPicks: [], popularTags: [], editorialSections: [] };
  }

  // Fetch salons and articles in parallel
  const [salonsResult, articlesResult] = await Promise.all([
    supabase
      .from('salon_profiles')
      .select('id, salon_name, handle, district_name, cover_photo, product_media, selected_tags, highlight_tags, tags')
      .or('is_active.eq.true,is_active.is.null')
      .limit(8),
    supabase
      .from('blog_articles')
      .select('handle, title, seo_description, cover_image_url, tags, published_at, category, blog_title')
      .eq('status', 'active')
      .order('published_at', { ascending: false })
      .limit(100),
  ]);

  // Process salons
  const featuredSalons: FeaturedSalon[] = (salonsResult.data || []).map((s: any) => {
    let image: string | null = null;
    if (s.cover_photo) {
      image = s.cover_photo;
    } else if (s.product_media && Array.isArray(s.product_media) && s.product_media.length > 0) {
      const first = s.product_media[0];
      image = typeof first === 'string' ? first : (first?.src || first?.url || null);
    }

    const highlightTags: string[] = safeParseTags(s.highlight_tags);
    const regularTags: string[] = (() => {
      const selected = safeParseTags(s.selected_tags);
      if (selected.length > 0) return selected;
      return safeParseTags(s.tags);
    })();

    const area = s.district_name || '';
    const filteredTags = (highlightTags.length > 0 ? highlightTags : regularTags)
      .filter((tag: string) => tag !== area)
      .slice(0, 2);

    return {
      id: s.id,
      name: s.salon_name || '美容院',
      handle: s.handle || undefined,
      area,
      image,
      tags: filteredTags,
    };
  });

  // Process articles
  const validData = (articlesResult.data || []).filter((item: any) => item.handle && item.handle.trim() !== '');

  let heroFeatured: { title: string; description: string; image: string; tag: string; href: string } | null = null;
  let heroSupporting: { title: string; image: string; tag: string; href: string }[] = [];
  let trendingArticles: { title: string; href: string; views: string }[] = [];
  let editorPicks: { title: string; href: string; tag: string }[] = [];
  let popularTags: string[] = [];
  let editorialSections: ArticleSectionData[] = [];

  if (validData.length > 0) {
    // Hero
    const first = validData[0];
    heroFeatured = {
      title: first.title,
      description: first.seo_description || '',
      image: first.cover_image_url || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
      tag: CATEGORY_MAP[first.category || '']?.title || first.tags?.[0] || '焦點話題',
      href: getArticleDetailPath(first.category || '', first.handle),
    };

    // Supporting
    const supporting: typeof heroSupporting = [];
    const usedCategories = new Set([first.category]);
    for (let i = 1; i < validData.length && supporting.length < 3; i++) {
      const item = validData[i];
      if (!usedCategories.has(item.category) || supporting.length < 3) {
        supporting.push({
          title: item.title,
          image: item.cover_image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
          tag: CATEGORY_MAP[item.category || '']?.title || item.tags?.[0] || '',
          href: getArticleDetailPath(item.category || '', item.handle),
        });
        usedCategories.add(item.category);
      }
    }
    heroSupporting = supporting;

    // Group by category
    const grouped: Record<string, any[]> = {};
    validData.forEach((item: any) => {
      const cat = item.category || 'trending-topics';
      if (!grouped[cat]) grouped[cat] = [];
      const isDuplicate = grouped[cat].some(
        (existing: any) => existing.handle === item.handle || existing.title === item.title
      );
      if (!isDuplicate) {
        grouped[cat].push(item);
      }
    });

    // Editorial sections
    const sectionOrder = ['trending-topics', 'entertainment', 'facial-care', 'anti-aging', 'body-shaping', 'skincare', 'healthy-diet', 'body-care'];
    sectionOrder.forEach((catKey) => {
      const catArticles = grouped[catKey];
      if (!catArticles || catArticles.length === 0) return;
      const catInfo = CATEGORY_MAP[catKey];
      if (!catInfo) return;
      editorialSections.push({
        title: catInfo.title,
        href: catInfo.href,
        articles: catArticles.slice(0, 4).map((item: any) => ({
          title: item.title,
          image: item.cover_image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
          tag: item.tags?.[0] || undefined,
          href: getArticleDetailPath(item.category || catKey, item.handle),
          description: item.seo_description || undefined,
        })),
      });
    });

    // Trending (deterministic views to avoid hydration mismatch)
    trendingArticles = validData.slice(0, 8).map((item: any, i: number) => ({
      title: item.title,
      href: getArticleDetailPath(item.category || '', item.handle),
      views: `${(i % 12) + 3}.${(i * 3) % 9}K`,
    }));

    // Editor picks
    const editorData = [...validData]
      .filter((item: any) => item.tags && item.tags.length > 1)
      .slice(0, 4);
    const editorFallback = editorData.length >= 2 ? editorData : validData.slice(0, 4);
    editorPicks = editorFallback.map((item: any) => ({
      title: item.title,
      href: getArticleDetailPath(item.category || '', item.handle),
      tag: item.blog_title?.includes('明星') ? '明星推薦' : (item.tags?.[0] || '編輯推薦'),
    }));

    // Popular tags
    const tagCounts: Record<string, number> = {};
    validData.forEach((item: any) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((t: string) => {
          const trimmed = t.trim();
          if (trimmed) tagCounts[trimmed] = (tagCounts[trimmed] || 0) + 1;
        });
      }
    });
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 14);
    popularTags = sortedTags.length > 0 ? sortedTags : ['HIFU', '水光針', '膠原蛋白', '美白', '抗衰老', '瘦面', '去斑', '暗瘡', '毛孔', '保濕', '防曬', '脫毛', '按摩', '纖體'];
  }

  return { featuredSalons, heroFeatured, heroSupporting, trendingArticles, editorPicks, popularTags, editorialSections };
}

/* ───────────────────── MAIN PAGE (Server Component) ───────────────────── */

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function HomePage() {
  const { featuredSalons, heroFeatured, heroSupporting, trendingArticles, editorPicks, popularTags, editorialSections } = await fetchPageData();

  return (
    <PublicLayout>
      <h1 className="sr-only">beauty100-magazine | 香港最全面的美容資訊平台</h1>
      {/* ═══════════ 1. FEATURED EDITORIAL ZONE ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        {heroFeatured ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main featured article */}
            <Link href={heroFeatured.href} className="lg:col-span-7 group relative rounded-2xl overflow-hidden bg-slate-900" style={{ minHeight: '420px' }}>
              <Image
                src={heroFeatured.image}
                alt={heroFeatured.title}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                <Badge className="bg-rose-500 text-white border-0 text-[12px] mb-3 shadow-md">{heroFeatured.tag}</Badge>
                <h2 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-white leading-tight mb-2 group-hover:text-rose-200 transition-colors">
                  {heroFeatured.title}
                </h2>
                <p className="text-sm text-white/70 line-clamp-2 max-w-lg">{heroFeatured.description}</p>
              </div>
            </Link>

            {/* Supporting articles stack */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {heroSupporting.map((article, i) => (
                <Link key={i} href={article.href} className="group relative rounded-xl overflow-hidden bg-slate-900" style={{ minHeight: '130px' }}>
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <Badge className="bg-white/20 text-white border-0 text-[14px] backdrop-blur-sm mb-1.5">{article.tag}</Badge>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-rose-200 transition-colors">
                      {article.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-2xl bg-slate-100 animate-pulse" style={{ minHeight: '420px' }} />
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {[1,2,3].map(i => <div key={i} className="rounded-xl bg-slate-100 animate-pulse" style={{ minHeight: '130px' }} />)}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════ 2. PLATFORM STATS STRIP ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5" style={{ minHeight: '88px' }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PLATFORM_STATS.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3.5 border border-rose-100/40 shadow-sm">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)' }}>
                <stat.icon className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 leading-none">{stat.value}</p>
                <p className="text-[14px] text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ 3. FEATURED SALONS CAROUSEL ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6" style={{ minHeight: '320px' }}>
        <SectionHeader title="人氣美容院" href="/explore-salons" subtitle="嚴選全港優質美容院商戶" />
        {featuredSalons.length > 0 && <SalonCarousel salons={featuredSalons} />}
        <div className="text-center mt-5">
          <Link href="/explore-salons">
            <Button variant="outline" className="h-9 px-5 rounded-lg text-sm font-medium border-rose-200 text-rose-600 hover:bg-rose-50">
              <Search className="w-3.5 h-3.5 mr-1.5" />
              搜尋更多美容院
            </Button>
          </Link>
        </div>
      </section>

      {/* ═══════════ 3.5 JOIN KOL CTA BANNER ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3" style={{ minHeight: '82px' }}>
        <Link
          href="/kol"
          className="group flex items-center justify-between rounded-xl px-5 sm:px-7 py-4 transition-all duration-300 hover:shadow-md border border-purple-100/60"
          style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 50%, #ede9fe 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-400 to-violet-500 shadow-sm shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                加入KOL實錄
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                成為我們的美容KOL，分享你的護膚心得同體驗
              </p>
            </div>
          </div>
          <Button
            className="h-8 sm:h-9 px-4 sm:px-5 rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-sm hover:shadow-md shrink-0"
          >
            加入我們
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </section>

      {/* ═══════════ 4. TREATMENT CATEGORIES ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SectionHeader title="美容知識專欄" href="/topics" subtitle="深入了解各類美容知識" />
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group rounded-xl p-4 text-center hover:-translate-y-0.5 transition-all duration-300 bg-white/80 backdrop-blur-sm border border-slate-100/60 hover:shadow-md hover:border-rose-200/60"
            >
              <div className={`w-10 h-10 mx-auto mb-2.5 rounded-lg flex items-center justify-center bg-gradient-to-br ${cat.color} shadow-sm`}>
                <cat.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 group-hover:text-rose-600 transition-colors">{cat.label}</h3>
              <p className="text-[12px] text-slate-400 mt-0.5 hidden sm:block">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ 5. EDITORIAL SECTIONS WITH SIDEBAR ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* MAIN CONTENT (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {editorialSections.length > 0 ? editorialSections.map((section) => (
              <div key={section.title}>
                <SectionHeader title={section.title} href={section.href} />
                {section.articles.length >= 4 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <ArticleCardLarge article={section.articles[0]} />
                    </div>
                    <div className="space-y-4">
                      <ArticleCardLarge article={section.articles[1]} />
                    </div>
                    <div className="sm:col-span-2 bg-white/80 rounded-xl px-4 py-2 border border-slate-100/60">
                      {section.articles.slice(2).map((article, j) => (
                        <ArticleCardSmall key={j} article={article} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.articles.map((article, j) => (
                      <ArticleCardLarge key={j} article={article} />
                    ))}
                  </div>
                )}
              </div>
            )) : null}
          </div>

          {/* SIDEBAR (4 cols) — sticky on desktop */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-[76px] space-y-6">

              {/* Trending Articles */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-100/60 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                  <Flame className="w-4 h-4 text-rose-500" />
                  熱門文章
                </h3>
                <div className="space-y-0">
                  {trendingArticles.map((article, i) => (
                    <Link key={i} href={article.href} className="group flex items-start gap-2.5 py-2.5 border-b border-slate-100/70 last:border-b-0 hover:bg-rose-50/30 -mx-1 px-1 rounded transition-colors">
                      <span className="text-[12px] font-bold text-rose-400 w-5 shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14px] font-medium text-slate-700 line-clamp-1 group-hover:text-rose-600 transition-colors">{article.title}</h4>
                        <span className="text-[14px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                          <Eye className="w-3 h-3" /> {article.views} 瀏覽
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Editor Picks */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-100/60 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                  <Award className="w-4 h-4 text-rose-500" />
                  編輯推薦
                </h3>
                <div className="space-y-0">
                  {editorPicks.map((article, i) => (
                    <Link key={i} href={article.href} className="group flex items-center gap-2.5 py-2.5 border-b border-slate-100/70 last:border-b-0 hover:bg-rose-50/30 -mx-1 px-1 rounded transition-colors">
                      <Badge className="bg-rose-50 text-rose-500 border-0 text-[12px] shrink-0 font-medium">{article.tag}</Badge>
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-1 group-hover:text-rose-600 transition-colors">{article.title}</h4>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-100/60 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                  <Tag className="w-4 h-4 text-rose-500" />
                  熱門標籤
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {popularTags.map((tag) => (
                    <Link key={tag} href={`/topics/tag/${encodeURIComponent(tag)}`} className="text-[12px] px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors border border-slate-100">
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Search CTA mini */}
              <div className="rounded-xl p-5 text-center" style={{ background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)' }}>
                <Search className="w-6 h-6 text-rose-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 mb-1">搵你附近美容院</h4>
                <p className="text-[14px] text-slate-400 mb-3">搜索全港2000+優質美容院</p>
                <Link href="/explore-salons">
                  <Button
                    className="h-8 px-4 rounded-lg text-sm font-medium shadow-sm w-full"
                    style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
                  >
                    立即搜尋
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </section>

      {/* ═══════════ 6. MERCHANT CTA ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="rounded-2xl p-8 sm:p-10 text-center overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">你係美容院老闆？</h2>
            <p className="text-white/80 mb-5 max-w-lg mx-auto text-sm">
              免費註冊成為商戶，喺平台展示你嘅美容院，吸引更多客人！
            </p>
            <Link href="/merchant-signup">
              <Button className="h-10 px-6 rounded-xl text-sm font-medium bg-white text-rose-600 hover:bg-white/90 shadow-lg">
                免費註冊商戶
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

