'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

import PublicLayout from '@/components/public/PublicLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, ArrowRight, Star, Heart, TrendingUp, Award, Eye,
  Zap, Sparkles, Palette, Apple, Shield, MapPin, ChevronRight, ChevronLeft, Flame, Tag,
  Users,
} from 'lucide-react';
// Ad components removed from homepage
import { supabase } from '@/lib/supabase';

/* ───────────────────────────── DATA ───────────────────────────── */

const CATEGORIES = [
  { label: '面部護理', href: '/facial-care', icon: Sparkles, color: 'from-rose-400 to-pink-500', description: '專業面部護理知識' },
  { label: '回復青春', href: '/anti-aging', icon: Zap, color: 'from-purple-400 to-violet-500', description: '逆齡抗衰老秘訣' },
  { label: '身材管理', href: '/body-shaping', icon: Heart, color: 'from-red-400 to-rose-500', description: '塑形纖體方案' },
  { label: '化妝護膚', href: '/skincare', icon: Palette, color: 'from-fuchsia-400 to-pink-500', description: '化妝護膚技巧' },
  { label: '飲食健康', href: '/healthy-diet', icon: Apple, color: 'from-green-400 to-emerald-500', description: '健康飲食指南' },
  { label: '身體保養', href: '/body-care', icon: Shield, color: 'from-blue-400 to-cyan-500', description: '全身保養貼士' },
];

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

/** Get the article detail path based on category */
function getArticleDetailPath(category: string, handle: string): string {
  if (category === 'anti-aging') {
    return `/anti-aging/${encodeURIComponent(handle)}`;
  }
  if (category === 'body-care') {
    return `/body-care/${encodeURIComponent(handle)}`;
  }
  return `/topics/${encodeURIComponent(handle)}`;
}

// Cover styles for salons without images - diverse backgrounds
const COVER_STYLES = [
  { bgImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80', overlayFrom: 'rgba(6,78,59,0.7)', overlayTo: 'rgba(13,148,136,0.5)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80', overlayFrom: 'rgba(251,113,133,0.6)', overlayTo: 'rgba(249,168,212,0.4)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80', overlayFrom: 'rgba(41,37,36,0.6)', overlayTo: 'rgba(146,64,14,0.4)', textColor: '#f5f5f4' },
  { bgImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', overlayFrom: 'rgba(3,105,161,0.6)', overlayTo: 'rgba(6,182,212,0.4)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', overlayFrom: 'rgba(88,28,135,0.65)', overlayTo: 'rgba(147,51,234,0.4)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80', overlayFrom: 'rgba(30,58,138,0.65)', overlayTo: 'rgba(59,130,246,0.4)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80', overlayFrom: 'rgba(157,23,77,0.6)', overlayTo: 'rgba(236,72,153,0.4)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&q=80', overlayFrom: 'rgba(20,83,45,0.65)', overlayTo: 'rgba(34,197,94,0.35)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80', overlayFrom: 'rgba(120,53,15,0.65)', overlayTo: 'rgba(217,119,6,0.4)', textColor: '#fef3c7' },
  { bgImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80', overlayFrom: 'rgba(159,18,57,0.6)', overlayTo: 'rgba(244,63,94,0.35)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80', overlayFrom: 'rgba(17,94,89,0.65)', overlayTo: 'rgba(45,212,191,0.35)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', overlayFrom: 'rgba(55,48,163,0.65)', overlayTo: 'rgba(99,102,241,0.4)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800&q=80', overlayFrom: 'rgba(9,9,11,0.5)', overlayTo: 'rgba(63,63,70,0.4)', textColor: '#fafafa' },
  { bgImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', overlayFrom: 'rgba(21,94,117,0.65)', overlayTo: 'rgba(34,211,238,0.35)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80', overlayFrom: 'rgba(113,63,18,0.65)', overlayTo: 'rgba(234,179,8,0.35)', textColor: '#fef9c3' },
  { bgImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80', overlayFrom: 'rgba(76,29,149,0.6)', overlayTo: 'rgba(168,85,247,0.35)', textColor: '#ffffff' },
];

function getCoverStyleIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % COVER_STYLES.length;
}

interface FeaturedSalon {
  id: string;
  name: string;
  area: string;
  image: string | null;
  tags: string[];
}

interface ArticleSectionData {
  title: string;
  href: string;
  articles: { title: string; image: string; tag?: string; href: string; description?: string }[];
}

const PLATFORM_STATS = [
  { label: '合作美容院', value: '2,000+', icon: Award },
  { label: '專業文章', value: '2,000+', icon: TrendingUp },
  { label: '月均瀏覽', value: '100K+', icon: Eye },
  { label: '用戶好評', value: '4.8', icon: Star },
];

/* ───────────────────── SMALL COMPONENTS ───────────────────── */

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
        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80'; }} />
        {article.tag && (
          <div className="absolute top-2.5 left-2.5">
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
      <img src={article.image} alt={article.title} className="w-[72px] h-[52px] rounded-lg object-cover shrink-0 bg-rose-50" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80'; }} />
      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">{article.title}</h4>
    </Link>
  );
}

/* ───────────────────── SALON CAROUSEL ───────────────────── */

function SalonCarousel({ salons }: { salons: FeaturedSalon[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const totalSlides = salons.length;

  // Number of visible cards based on viewport (handled via CSS, but we track for dot logic)
  const getVisibleCount = useCallback(() => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }, []);

  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    setVisibleCount(getVisibleCount());
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getVisibleCount]);

  const maxIndex = Math.max(0, totalSlides - visibleCount);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);
  }, [maxIndex]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    stopAutoplay();
    // Restart autoplay after a brief pause
    setTimeout(() => startAutoplay(), 5000);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, stopAutoplay, startAutoplay]);

  const goLeft = useCallback(() => {
    goTo(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  }, [currentIndex, maxIndex, goTo]);

  const goRight = useCallback(() => {
    goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  }, [currentIndex, maxIndex, goTo]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [trackOffset, setTrackOffset] = useState(0);

  // Recalculate offset when currentIndex or visibleCount changes
  useEffect(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const gapPx = 16;
    const cardWidth = (containerWidth - gapPx * (visibleCount - 1)) / visibleCount;
    setTrackOffset(currentIndex * (cardWidth + gapPx));
  }, [currentIndex, visibleCount]);

  const gapPx = 16;

  return (
    <div className="relative group/carousel">
      {/* Left arrow */}
      <button
        onClick={goLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-slate-200/60 flex items-center justify-center text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:shadow-xl transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
        aria-label="上一個"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Right arrow */}
      <button
        onClick={goRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-slate-200/60 flex items-center justify-center text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:shadow-xl transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
        aria-label="下一個"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Carousel track */}
      <div className="overflow-hidden rounded-xl" ref={containerRef}>
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            gap: `${gapPx}px`,
            transform: `translateX(-${trackOffset}px)`,
          }}
        >
          {salons.map((salon, i) => (
            <Link
              key={salon.id || i}
              href={salon.id ? `/salon/${salon.id}` : '/explore-salons'}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100/80 shrink-0"
              style={{ width: `calc((100% - ${gapPx * (visibleCount - 1)}px) / ${visibleCount})` }}
            >
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-rose-100 to-pink-50">
                {salon.image ? (
                  <img src={salon.image} alt={salon.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (() => {
                  const styleIdx = getCoverStyleIndex(salon.id || salon.name);
                  const coverStyle = COVER_STYLES[styleIdx];
                  return (
                    <div className="relative w-full h-full">
                      <img
                        src={coverStyle.bgImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${coverStyle.overlayFrom}, ${coverStyle.overlayTo})` }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                        <p className="text-[9px] uppercase tracking-[0.2em] opacity-70 mb-0.5" style={{ color: coverStyle.textColor }}>
                          Beauty Salon
                        </p>
                        <h3 className="text-sm font-bold text-center leading-tight drop-shadow-md line-clamp-2" style={{ color: coverStyle.textColor }}>
                          {salon.name}
                        </h3>
                        <div className="mt-1.5 w-8 h-0.5 opacity-60 rounded" style={{ backgroundColor: coverStyle.textColor }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="p-3.5">
                <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-rose-600 transition-colors">{salon.name}</h3>
                {salon.area && (
                  <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{salon.area}</span>
                  </div>
                )}
                {salon.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {salon.tags.map((tag) => (
                      <span key={tag} className="text-[14px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 font-medium">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-5 h-1.5 bg-rose-500'
                : 'w-1.5 h-1.5 bg-slate-300 hover:bg-rose-300'
            }`}
            aria-label={`前往第 ${i + 1} 頁`}
          />
        ))}
      </div>
    </div>
  );
}

/* ───────────────────── MAIN PAGE ───────────────────── */

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [editorialSections, setEditorialSections] = useState<ArticleSectionData[]>([]);
  const [heroFeatured, setHeroFeatured] = useState<{ title: string; description: string; image: string; tag: string; href: string } | null>(null);
  const [heroSupporting, setHeroSupporting] = useState<{ title: string; image: string; tag: string; href: string }[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<{ title: string; href: string; views: string }[]>([]);
  const [editorPicks, setEditorPicks] = useState<{ title: string; href: string; tag: string }[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [featuredSalons, setFeaturedSalons] = useState<FeaturedSalon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch featured salons from real data
  useEffect(() => {
    async function fetchFeaturedSalons() {
      try {
        const { data, error } = await supabase
          .from('salon_profiles')
          .select('id, salon_name, district_name, image_src, product_media, selected_tags, highlight_tags, tags')
          .or('is_active.eq.true,is_active.is.null')
          .limit(8);

        if (error || !data) return;

        const salons: FeaturedSalon[] = data.map((s: any) => {
          // Get the best image available - null if none
          let image: string | null = null;
          if (s.image_src) {
            image = s.image_src;
          } else if (s.product_media && Array.isArray(s.product_media) && s.product_media.length > 0) {
            const first = s.product_media[0];
            image = typeof first === 'string' ? first : (first?.src || first?.url || null);
          }

          // Safe JSON parse helper
          const safeParseTags = (val: any): string[] => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
              try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) return parsed;
              } catch {
                // Not valid JSON – treat as a single tag string
                return val.trim() ? [val.trim()] : [];
              }
            }
            return [];
          };

          // Get highlight tags first, fallback to regular tags only if no highlights
          const highlightTags: string[] = safeParseTags(s.highlight_tags);

          const regularTags: string[] = (() => {
            const selected = safeParseTags(s.selected_tags);
            if (selected.length > 0) return selected;
            return safeParseTags(s.tags);
          })();

          const area = s.district_name || '';

          // Show highlight tags if available, otherwise fallback to regular tags
          const filteredTags = (highlightTags.length > 0 ? highlightTags : regularTags)
            .filter((tag: string) => tag !== area)
            .slice(0, 2);

          return {
            id: s.id,
            name: s.salon_name || '美容院',
            area,
            image,
            tags: filteredTags,
          };
        });

        setFeaturedSalons(salons);
      } catch (err: any) {
        const msg = err?.message || String(err);
        if (!msg.includes('Failed to fetch') && !msg.includes('Network error')) {
          console.error('Error fetching salons:', err);
        }
      }
    }
    fetchFeaturedSalons();
  }, []);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const { data, error } = await supabase
          .from('blog_articles')
          .select('handle, title, seo_description, cover_image_url, tags, published_at, category, blog_title')
          .eq('status', 'active')
          .order('published_at', { ascending: false })
          .limit(100);

        if (error) {
          // Suppress network errors in preview/canvas environments
          if (error.message !== 'Network error' && error.message !== 'Supabase not configured') {
            console.error('Error fetching articles:', error);
          }
          return;
        }

        if (!data || data.length === 0) return;

        // Filter out articles with missing handles (they won't have valid detail pages)
        const validData = data.filter((item: any) => item.handle && item.handle.trim() !== '');
        if (validData.length === 0) return;

        // Build hero section from latest articles
        const first = validData[0];
        setHeroFeatured({
          title: first.title,
          description: first.seo_description || '',
          image: first.cover_image_url || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
          tag: CATEGORY_MAP[first.category || '']?.title || first.tags?.[0] || '焦點話題',
          href: getArticleDetailPath(first.category || '', first.handle),
        });

        // Supporting = next 3 articles from different categories
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
        setHeroSupporting(supporting);

        // Group articles by category for editorial sections (deduplicate by handle within each category)
        const grouped: Record<string, typeof validData> = {};
        validData.forEach((item) => {
          const cat = item.category || 'trending-topics';
          if (!grouped[cat]) grouped[cat] = [];
          // Avoid duplicate articles (same handle or same title) within the same category
          const isDuplicate = grouped[cat].some(
            (existing) => existing.handle === item.handle || existing.title === item.title
          );
          if (!isDuplicate) {
            grouped[cat].push(item);
          }
        });

        // Build editorial sections - maintain the order of CATEGORY_MAP
        const sectionOrder = ['trending-topics', 'entertainment', 'facial-care', 'anti-aging', 'body-shaping', 'skincare', 'healthy-diet', 'body-care'];
        const sections: ArticleSectionData[] = [];
        sectionOrder.forEach((catKey) => {
          const catArticles = grouped[catKey];
          if (!catArticles || catArticles.length === 0) return;
          const catInfo = CATEGORY_MAP[catKey];
          if (!catInfo) return;
          sections.push({
            title: catInfo.title,
            href: catInfo.href,
            articles: catArticles.slice(0, 4).map((item) => ({
              title: item.title,
              image: item.cover_image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
              tag: item.tags?.[0] || undefined,
              href: getArticleDetailPath(item.category || catKey, item.handle),
              description: item.seo_description || undefined,
            })),
          });
        });
        setEditorialSections(sections);

        // Trending articles (latest 8 overall)
        const trending = validData.slice(0, 8).map((item) => ({
          title: item.title,
          href: getArticleDetailPath(item.category || '', item.handle),
          views: `${(Math.floor(Math.random() * 12) + 3)}.${Math.floor(Math.random() * 9)}K`,
        }));
        setTrendingArticles(trending);

        // Editor picks: articles with most tags
        const editorData = [...validData]
          .filter((item) => item.tags && item.tags.length > 1)
          .slice(0, 4);
        const editorFallback = editorData.length >= 2 ? editorData : validData.slice(0, 4);
        setEditorPicks(editorFallback.map((item) => ({
          title: item.title,
          href: getArticleDetailPath(item.category || '', item.handle),
          tag: item.blog_title?.includes('明星') ? '明星推薦' : (item.tags?.[0] || '編輯推薦'),
        })));

        // Popular tags
        const tagCounts: Record<string, number> = {};
        validData.forEach((item) => {
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
        setPopularTags(sortedTags.length > 0 ? sortedTags : ['HIFU', '水光針', '膠原蛋白', '美白', '抗衰老', '瘦面', '去斑', '暗瘡', '毛孔', '保濕', '防曬', '脫毛', '按摩', '纖體']);
      } catch (err: any) {
        // Suppress network/fetch errors that occur in preview environments
        const msg = err?.message || String(err);
        if (!msg.includes('Failed to fetch') && !msg.includes('Network error')) {
          console.error('Error fetching articles:', err);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  if (!mounted) {
    return (
      <PublicLayout>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-2xl bg-slate-100 animate-pulse min-h-[320px] lg:min-h-[420px]" />
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {[1,2,3].map(i => <div key={i} className="rounded-xl bg-slate-100 animate-pulse min-h-[130px]" />)}
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* ═══════════ 1. FEATURED EDITORIAL ZONE ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        {heroFeatured ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main featured article */}
            <Link href={heroFeatured.href} className="lg:col-span-7 group relative rounded-2xl overflow-hidden bg-slate-900 min-h-[320px] lg:min-h-[420px]">
              <img
                src={heroFeatured.image}
                alt={heroFeatured.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                <Badge className="bg-rose-500 text-white border-0 text-[12px] mb-3 shadow-md">{heroFeatured.tag}</Badge>
                <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-white leading-tight mb-2 group-hover:text-rose-200 transition-colors">
                  {heroFeatured.title}
                </h1>
                <p className="text-sm text-white/70 line-clamp-2 max-w-lg">{heroFeatured.description}</p>
              </div>
            </Link>

            {/* Supporting articles stack */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {heroSupporting.map((article, i) => (
                <Link key={i} href={article.href} className="group relative rounded-xl overflow-hidden bg-slate-900 min-h-[130px]">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80'; }}
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
        ) : loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-2xl bg-slate-100 animate-pulse min-h-[320px] lg:min-h-[420px]" />
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {[1,2,3].map(i => <div key={i} className="rounded-xl bg-slate-100 animate-pulse min-h-[130px]" />)}
            </div>
          </div>
        ) : null}
      </section>

      {/* ═══════════ 2. PLATFORM STATS STRIP ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
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

      {/* AD REMOVED */}

      {/* ═══════════ 3. FEATURED SALONS CAROUSEL ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6">
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
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
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

      {/* AD REMOVED */}

      {/* ═══════════ 5. EDITORIAL SECTIONS WITH SIDEBAR ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* MAIN CONTENT (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {editorialSections.length > 0 ? editorialSections.map((section) => (
              <div key={section.title}>
                <SectionHeader title={section.title} href={section.href} />
                {section.articles.length >= 4 ? (
                  /* Full section layout: 2 large + 2 small */
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
                  /* Compact section layout */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.articles.map((article, j) => (
                      <ArticleCardLarge key={j} article={article} />
                    ))}
                  </div>
                )}
              </div>
            )) : loading ? (
              <div className="space-y-10">
                {[1,2,3].map(i => (
                  <div key={i}>
                    <div className="h-6 w-32 bg-slate-100 rounded animate-pulse mb-5" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1,2].map(j => <div key={j} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
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

              {/* AD REMOVED */}

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

      {/* AD REMOVED */}

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
