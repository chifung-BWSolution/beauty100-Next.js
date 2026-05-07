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
import { HorizontalBannerAd, PromotionalBlock, SidebarAdUnit, BottomDualAd } from '@/components/ads/AdComponents';

/* ───────────────────────────── DATA ───────────────────────────── */

const CATEGORIES = [
  { label: '面部護理', href: '/facial-care', icon: Sparkles, color: 'from-rose-400 to-pink-500', description: '專業面部護理知識' },
  { label: '回復青春', href: '/anti-aging', icon: Zap, color: 'from-purple-400 to-violet-500', description: '逆齡抗衰老秘訣' },
  { label: '身材管理', href: '/body-shaping', icon: Heart, color: 'from-red-400 to-rose-500', description: '塑形纖體方案' },
  { label: '化妝護膚', href: '/skincare', icon: Palette, color: 'from-fuchsia-400 to-pink-500', description: '化妝護膚技巧' },
  { label: '飲食健康', href: '/healthy-diet', icon: Apple, color: 'from-green-400 to-emerald-500', description: '健康飲食指南' },
  { label: '身體保養', href: '/body-care', icon: Shield, color: 'from-blue-400 to-cyan-500', description: '全身保養貼士' },
];

const HERO_FEATURED = {
  title: '2025年最受歡迎的面部護理療程',
  description: '盤點今年最受香港女士歡迎的面部護理療程，從水光針到HIFU，一文睇晒各大人氣療程。',
  image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  tag: '焦點話題',
  href: '/topics',
};

const HERO_SUPPORTING = [
  {
    title: '女星逆齡保養術：40歲皮膚如少女',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&q=80',
    tag: '娛樂圈',
    href: '/entertainment',
  },
  {
    title: '排毒飲食計劃：7日肌膚煥然一新',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
    tag: '飲食健康',
    href: '/healthy-diet',
  },
  {
    title: '韓式水光肌養成法 一週護膚指南',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80',
    tag: '化妝護膚',
    href: '/skincare',
  },
];

const FEATURED_SALONS = [
  { name: 'Glow Beauty Studio', area: '銅鑼灣', rating: 4.9, reviews: 128, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80', tags: ['面部護理', 'HIFU'] },
  { name: 'Radiance Spa', area: '尖沙咀', rating: 4.8, reviews: 95, image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6a?w=400&q=80', tags: ['身材管理', '按摩'] },
  { name: 'Aura Beauty', area: '中環', rating: 4.9, reviews: 203, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80', tags: ['回復青春', '水光針'] },
  { name: 'Pure Skin Lab', area: '旺角', rating: 4.7, reviews: 67, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80', tags: ['面部護理', '暗瘡'] },
  { name: 'Luxe Skin Clinic', area: '灣仔', rating: 4.8, reviews: 156, image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&q=80', tags: ['美白', '去斑'] },
  { name: 'Serenity Beauty', area: '太古', rating: 4.6, reviews: 89, image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400&q=80', tags: ['脫毛', '按摩'] },
  { name: 'Diamond Glow', area: '觀塘', rating: 4.7, reviews: 112, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80', tags: ['Thermage', '膠原蛋白'] },
  { name: 'Belle Visage', area: '沙田', rating: 4.9, reviews: 178, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80', tags: ['瘦面', '纖體'] },
];

interface ArticleSectionData {
  title: string;
  href: string;
  articles: { title: string; image: string; tag?: string; href: string; description?: string }[];
}

const EDITORIAL_SECTIONS: ArticleSectionData[] = [
  {
    title: '焦點話題',
    href: '/topics',
    articles: [
      { title: '香港十大人氣美容院 2025年度排行榜', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80', tag: '排行榜', href: '/topics', description: '綜合用戶評分、環境及服務質素，揀選出今年最值得去的十間美容院。' },
      { title: '醫美新趨勢：微整形定係傳統護膚好？', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80', tag: '專題', href: '/topics', description: '深入比較醫美微整形與傳統護膚的效果、成本及安全性。' },
      { title: '新手必讀：第一次做Facial要注意咩？', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80', href: '/topics' },
      { title: '夏日防曬攻略：SPF係咪越高越好？', image: 'https://images.unsplash.com/photo-1526758097130-bab247274f58?w=400&q=80', href: '/topics' },
    ],
  },
  {
    title: '娛樂圈',
    href: '/entertainment',
    articles: [
      { title: '女星逆齡保養術：40歲皮膚如少女', image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&q=80', tag: '明星', href: '/entertainment', description: '揭開多位凍齡女星的護膚秘訣，從日常習慣到專業療程全面解析。' },
      { title: '韓國明星最愛的護膚品牌大公開', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80', tag: '韓流', href: '/entertainment', description: 'K-beauty品牌深度分析，看看韓國明星真正在用甚麼。' },
      { title: '紅毯妝容解構：點樣畫出高級感？', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80', href: '/entertainment' },
      { title: '星級髮型師推薦：今季最流行髮色', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80', href: '/entertainment' },
    ],
  },
  {
    title: '面部護理',
    href: '/facial-care',
    articles: [
      { title: 'HIFU vs Thermage：點揀最適合自己？', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80', tag: '比較', href: '/facial-care', description: '兩大拉提療程全面比較，從原理到效果逐一分析。' },
      { title: '毛孔收細全攻略：從清潔到醫美', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80', tag: '指南', href: '/facial-care', description: '針對不同毛孔問題的解決方案，從家居護理到專業療程。' },
      { title: '敏感肌護理：溫和有效嘅保養方法', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80', href: '/facial-care' },
      { title: '黑眼圈急救法：眼部護理全指南', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80', href: '/facial-care' },
    ],
  },
  {
    title: '回復青春',
    href: '/anti-aging',
    articles: [
      { title: '抗衰老從25歲開始：年齡護膚指南', image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&q=80', tag: '指南', href: '/anti-aging', description: '根據不同年齡階段制定抗衰老護膚計劃。' },
      { title: '膠原蛋白流失怎麼辦？全面補充方法', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80', href: '/anti-aging' },
    ],
  },
  {
    title: '身材管理',
    href: '/body-shaping',
    articles: [
      { title: '冷凍溶脂 vs 熱光溶脂：最新體雕技術比較', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80', tag: '比較', href: '/body-shaping', description: '全面比較兩大非入侵性體雕技術的效果及適合人群。' },
      { title: '產後修身攻略：安全有效的方法', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80', href: '/body-shaping' },
    ],
  },
  {
    title: '化妝護膚',
    href: '/skincare',
    articles: [
      { title: '韓式水光肌養成法：七日護膚計劃', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80', tag: '教學', href: '/skincare', description: '跟住做就可以擁有韓星般的水潤光澤肌膚。' },
      { title: '成分黨必讀：透明質酸 vs 神經醯胺', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80', href: '/skincare' },
    ],
  },
  {
    title: '飲食健康',
    href: '/healthy-diet',
    articles: [
      { title: '食出好皮膚：美容飲食完全指南', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', tag: '飲食', href: '/healthy-diet', description: '營養師推薦的美容飲食方案，由內至外改善膚質。' },
      { title: '抗氧化超級食物Top 10', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', href: '/healthy-diet' },
    ],
  },
  {
    title: '身體保養',
    href: '/body-care',
    articles: [
      { title: '全身保養攻略：從頭到腳嘅護理秘訣', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6a?w=400&q=80', tag: '指南', href: '/body-care', description: '全面身體護理指南，包括手足、頸部及身體肌膚保養。' },
      { title: 'SPA按摩全攻略：香港最受歡迎的療程', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6a?w=400&q=80', href: '/body-care' },
    ],
  },
];

const TRENDING_ARTICLES = [
  { title: '毛孔收細全攻略：從清潔到醫美', href: '/facial-care', views: '12.3K' },
  { title: 'HIFU vs Thermage 最新比較', href: '/facial-care', views: '9.8K' },
  { title: '2025年度十大美容院排行榜', href: '/topics', views: '8.5K' },
  { title: '韓式水光肌養成法', href: '/skincare', views: '6.9K' },
  { title: '明星逆齡保養術大公開', href: '/entertainment', views: '6.1K' },
  { title: '敏感肌護理完全指南', href: '/facial-care', views: '5.8K' },
  { title: '冷凍溶脂效果實測', href: '/body-shaping', views: '5.3K' },
  { title: '排毒飲食計劃七日改善膚質', href: '/healthy-diet', views: '4.9K' },
];

const EDITOR_PICKS = [
  { title: '香港十大隱世美容院推薦', href: '/explore-salons', tag: '編輯推薦' },
  { title: '零基礎護膚入門懶人包', href: '/skincare', tag: '新手必讀' },
  { title: '美容院消費陷阱大揭密', href: '/topics', tag: '消費指南' },
  { title: '醫美前必做的功課清單', href: '/facial-care', tag: '實用貼士' },
];

const POPULAR_TAGS = [
  'HIFU', '水光針', '膠原蛋白', '美白', '抗衰老', '瘦面', '去斑',
  '暗瘡', '毛孔', '保濕', '防曬', '脫毛', '按摩', '纖體',
];

const PLATFORM_STATS = [
  { label: '合作美容院', value: '500+', icon: Award },
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

function SalonCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const totalSlides = FEATURED_SALONS.length;

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
          {FEATURED_SALONS.map((salon, i) => (
            <Link
              key={i}
              href="/explore-salons"
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100/80 shrink-0"
              style={{ width: `calc((100% - ${gapPx * (visibleCount - 1)}px) / ${visibleCount})` }}
            >
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-rose-100 to-pink-50">
                <img src={salon.image} alt={salon.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80'; }} />
              </div>
              <div className="p-3.5">
                <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-rose-600 transition-colors">{salon.name}</h3>
                <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>{salon.area}</span>
                  <span className="mx-1">·</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-slate-600 font-medium">{salon.rating}</span>
                  <span className="text-slate-300">({salon.reviews})</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {salon.tags.map((tag) => (
                    <span key={tag} className="text-[14px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 font-medium">{tag}</span>
                  ))}
                </div>
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
  return (
    <PublicLayout>
      {/* ═══════════ 1. FEATURED EDITORIAL ZONE ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main featured article */}
          <Link href={HERO_FEATURED.href} className="lg:col-span-7 group relative rounded-2xl overflow-hidden bg-slate-900 min-h-[320px] lg:min-h-[420px]">
            <img
              src={HERO_FEATURED.image}
              alt={HERO_FEATURED.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
              <Badge className="bg-rose-500 text-white border-0 text-[12px] mb-3 shadow-md">{HERO_FEATURED.tag}</Badge>
              <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-white leading-tight mb-2 group-hover:text-rose-200 transition-colors">
                {HERO_FEATURED.title}
              </h1>
              <p className="text-sm text-white/70 line-clamp-2 max-w-lg">{HERO_FEATURED.description}</p>
            </div>
          </Link>

          {/* Supporting articles stack */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {HERO_SUPPORTING.map((article, i) => (
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

      {/* ═══════════ AD: Horizontal Banner ═══════════ */}
      <HorizontalBannerAd variant="slim" />

      {/* ═══════════ 3. FEATURED SALONS CAROUSEL ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6">
        <SectionHeader title="人氣美容院" href="/explore-salons" subtitle="嚴選全港優質美容院商戶" />
        <SalonCarousel />
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

      {/* ═══════════ AD: Mid-page Promotional Block ═══════════ */}
      <HorizontalBannerAd variant="gradient" />

      {/* ═══════════ 5. EDITORIAL SECTIONS WITH SIDEBAR ═══════════ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* MAIN CONTENT (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {EDITORIAL_SECTIONS.map((section) => (
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
            ))}
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
                  {TRENDING_ARTICLES.map((article, i) => (
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
                  {EDITOR_PICKS.map((article, i) => (
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
                  {POPULAR_TAGS.map((tag) => (
                    <span key={tag} className="text-[12px] px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors border border-slate-100">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sidebar Ad Unit */}
              <SidebarAdUnit variant="salon" />

              {/* Search CTA mini */}
              <div className="rounded-xl p-5 text-center" style={{ background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)' }}>
                <Search className="w-6 h-6 text-rose-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 mb-1">搵你附近美容院</h4>
                <p className="text-[14px] text-slate-400 mb-3">搜索全港500+優質美容院</p>
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

      {/* ═══════════ AD: Bottom Dual Ad Blocks (Left-Right) ═══════════ */}
      <BottomDualAd />

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
