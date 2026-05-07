'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import {
  Clock, ArrowRight, Eye, Flame, TrendingUp, Star,
  Bookmark, Tag, Droplets,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════ */

const TABS = [
  '全部',
  '身體護理',
  '保濕修護',
  '香氛沐浴',
  '去角質護理',
  '日常保養',
] as const;

type TabLabel = (typeof TABS)[number];

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

interface Article {
  title: string;
  description: string;
  image: string;
  tag: string;
  category: TabLabel[];
  date: string;
  views: string;
  featured?: boolean;
}

const ALL_ARTICLES: Article[] = [
  // ── 身體護理 ──
  {
    title: '全身按摩指南：邊種按摩最適合你？',
    description: '瑞典式、泰式、深層組織按摩⋯⋯唔同類型嘅按摩各有功效，邊種最啱你嘅身體狀況？全面分析各種按摩手法。',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    tag: '按摩指南',
    category: ['身體護理'],
    date: '2025年4月2日',
    views: '22.1K',
    featured: true,
  },
  {
    title: '脫毛方法大比拼：激光 vs IPL vs 蜜蠟',
    description: '想脫毛但唔知揀邊種方法？全面分析各種脫毛方法嘅優劣、價錢同效果持久度。',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80',
    tag: '脫毛',
    category: ['身體護理'],
    date: '2025年3月24日',
    views: '18.5K',
    featured: true,
  },
  {
    title: '背部暗瘡點算好？專家教你徹底處理',
    description: '背部暗瘡成因複雜，從日常清潔到專業療程，教你逐步改善背部肌膚問題。',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80',
    tag: '背部護理',
    category: ['身體護理'],
    date: '2025年3月18日',
    views: '10.3K',
  },
  {
    title: '淋巴排毒按摩：改善水腫同循環',
    description: '淋巴排毒按摩可以幫助身體排走廢物，改善水腫問題，提升整體健康狀態。',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80',
    tag: '淋巴按摩',
    category: ['身體護理'],
    date: '2025年3月14日',
    views: '8.7K',
  },
  // ── 保濕修護 ──
  {
    title: '身體乳液全日保濕秘訣：持久水潤肌膚',
    description: '想全日保持肌膚水潤？跟住呢幾個步驟就可以做到持久保濕效果，唔再乾燥繃緊。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    tag: '保濕攻略',
    category: ['保濕修護'],
    date: '2025年4月1日',
    views: '19.8K',
    featured: true,
  },
  {
    title: '手部護理：養出嫩滑纖纖玉手',
    description: '手部係第二塊面，但好多人都忽略咗手部護理。教你養出嫩滑靚手嘅日常習慣。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '手部護理',
    category: ['保濕修護'],
    date: '2025年3月20日',
    views: '12.4K',
    featured: true,
  },
  {
    title: '乾燥肌救星：冬季身體保濕全攻略',
    description: '冬天皮膚特別容易乾燥痕癢，呢篇攻略教你從沐浴到護膚全方位保濕。',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    tag: '冬季保濕',
    category: ['保濕修護'],
    date: '2025年3月16日',
    views: '9.5K',
  },
  // ── 香氛沐浴 ──
  {
    title: '香薰治療：用精油改善身心狀態',
    description: '香薰治療唔止係好味咁簡單，適當使用精油可以改善多種身心問題，提升生活質素。',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    tag: '香薰精油',
    category: ['香氛沐浴'],
    date: '2025年3月28日',
    views: '15.6K',
    featured: true,
  },
  {
    title: '沐浴露選擇攻略：滋潤 vs 清爽配方',
    description: '唔同膚質適合唔同嘅沐浴露，教你揀啱最適合自己嘅配方，洗出好肌膚。',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
    tag: '沐浴',
    category: ['香氛沐浴'],
    date: '2025年3月22日',
    views: '11.2K',
  },
  {
    title: '泡澡文化：點樣享受一個完美嘅浸浴時光',
    description: '浸浴唔止係清潔咁簡單，加入適當嘅浴鹽同精油，可以變成一個療癒身心嘅儀式。',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=600&q=80',
    tag: '泡澡',
    category: ['香氛沐浴'],
    date: '2025年3月15日',
    views: '7.9K',
  },
  // ── 去角質護理 ──
  {
    title: '身體磨砂正確方法：去除角質唔傷膚',
    description: '身體磨砂可以令肌膚更加光滑，但做錯方法可能會傷害皮膚。學習正確嘅去角質技巧。',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80',
    tag: '磨砂技巧',
    category: ['去角質護理'],
    date: '2025年3月30日',
    views: '16.3K',
    featured: true,
  },
  {
    title: '化學 vs 物理去角質：邊種適合你？',
    description: 'AHA、BHA化學去角質同傳統磨砂物理去角質各有優缺點，了解邊種更適合你嘅膚質。',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
    tag: '去角質',
    category: ['去角質護理'],
    date: '2025年3月25日',
    views: '13.1K',
  },
  {
    title: '足部護理全攻略：同粗糙腳皮講bye bye',
    description: '足部護理經常被忽略，但其實好重要！教你點樣護理雙腳，養出嫩滑腳部肌膚。',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    tag: '足部護理',
    category: ['去角質護理'],
    date: '2025年3月12日',
    views: '8.4K',
  },
  // ── 日常保養 ──
  {
    title: '每日身體護理routine：簡單5步養出好肌膚',
    description: '一個簡單又有效嘅每日身體護理routine，只需5個步驟就可以養出光滑水潤肌膚。',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    tag: '日常Routine',
    category: ['日常保養'],
    date: '2025年3月27日',
    views: '14.7K',
    featured: true,
  },
  {
    title: '防曬身體乳推薦：全身防曬唔可以忽略',
    description: '好多人只顧住面部防曬，但身體一樣需要防護！呢幾款防曬身體乳值得入手。',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    tag: '防曬',
    category: ['日常保養'],
    date: '2025年3月23日',
    views: '10.9K',
  },
  {
    title: '運動後身體護理：唔好錯過黃金修護時間',
    description: '運動後嘅肌膚處於高吸收狀態，把握呢個黃金時間做好身體護理，效果事半功倍。',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    tag: '運動護理',
    category: ['日常保養'],
    date: '2025年3月19日',
    views: '9.2K',
  },
  {
    title: '睡前身體護理：夜間修復黃金法則',
    description: '夜間係肌膚修復嘅最佳時機，做好睡前護理可以令身體肌膚狀態大幅提升。',
    image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=600&q=80',
    tag: '夜間修護',
    category: ['日常保養'],
    date: '2025年3月10日',
    views: '7.6K',
  },
];

const TRENDING_ARTICLES = [
  { title: '全身按摩指南：邊種按摩最適合你？', views: '22.1K' },
  { title: '身體乳液全日保濕秘訣：持久水潤肌膚', views: '19.8K' },
  { title: '脫毛方法大比拼：激光 vs IPL vs 蜜蠟', views: '18.5K' },
  { title: '身體磨砂正確方法：去除角質唔傷膚', views: '16.3K' },
  { title: '香薰治療：用精油改善身心狀態', views: '15.6K' },
  { title: '每日身體護理routine：簡單5步養出好肌膚', views: '14.7K' },
];

const EDITOR_PICKS = [
  { title: '身體保養新手入門完整指南', tag: '編輯精選' },
  { title: '最值得入手嘅身體護理產品', tag: '消費指南' },
  { title: '身體SPA療程全攻略', tag: '療程推薦' },
  { title: '敏感肌身體護理注意事項', tag: '敏感肌' },
];

const POPULAR_TAGS = [
  '按摩', '保濕', '磨砂', '脫毛', '香薰', '沐浴',
  '身體乳', '防曬', '去角質', '精油', '泡澡', '手部護理',
  '足部護理', '淋巴排毒', '背部護理', '運動護膚',
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FeaturedMainCard({ article }: { article: Article }) {
  return (
    <Link href="/topics/body-care-guide" className="group relative block rounded-2xl overflow-hidden bg-slate-900 h-[320px] sm:h-[360px] lg:h-full">
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
        <Badge className="bg-blue-500 text-white border-0 text-[12px] mb-3 shadow-md">{article.tag}</Badge>
        <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-white leading-tight mb-2 group-hover:text-blue-200 transition-colors">
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
    <Link href="/topics/body-care-guide" className="group relative block rounded-xl overflow-hidden bg-slate-900 h-[140px] sm:h-[130px] lg:h-full">
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Badge className="bg-white/20 text-white border-0 text-[14px] backdrop-blur-sm mb-1.5">{article.tag}</Badge>
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-blue-200 transition-colors">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href="/topics/body-care-guide"
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
          <Badge className="bg-blue-500 text-white border-0 text-[14px] shadow-sm">{article.tag}</Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
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
          <span className="flex items-center gap-1 text-sm text-blue-500 font-medium group-hover:gap-2 transition-all">
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
      href="/topics/body-care-guide"
      className="group flex gap-4 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100/80 p-3"
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-28 h-20 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="flex flex-col justify-center min-w-0">
        <Badge className="bg-blue-50 text-blue-500 border-0 text-[12px] w-fit mb-1">{article.tag}</Badge>
        <h4 className="text-[14px] font-semibold text-slate-700 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
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
        <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #93c5fd, #3b82f6)' }} />
        <Icon className="w-3.5 h-3.5 text-blue-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function BodyCarePage() {
  const [activeTab, setActiveTab] = useState<TabLabel>('全部');

  // Filter articles based on active tab
  const filteredArticles = useMemo(() => {
    if (activeTab === '全部') return ALL_ARTICLES;
    return ALL_ARTICLES.filter((a) => a.category.includes(activeTab));
  }, [activeTab]);

  // Get featured articles (those marked featured, or first few)
  const featuredArticles = useMemo(() => {
    const featured = filteredArticles.filter((a) => a.featured);
    if (featured.length >= 3) return featured.slice(0, 4);
    const rest = filteredArticles.filter((a) => !a.featured);
    return [...featured, ...rest].slice(0, 4);
  }, [filteredArticles]);

  // Main feed = everything except the top featured
  const feedArticles = useMemo(() => {
    const featuredIds = new Set(featuredArticles.map((a) => a.title));
    return filteredArticles.filter((a) => !featuredIds.has(a.title));
  }, [filteredArticles, featuredArticles]);

  const mainFeatured = featuredArticles[0];
  const supportFeatured = featuredArticles.slice(1, 4);

  return (
    <PublicLayout>
      {/* ═══════════ 1. PAGE HEADER ═══════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 30%, #ecfeff 70%, #eff6ff 100%)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <span className="text-[12px] font-semibold tracking-[0.15em] text-blue-400 uppercase">Body Care</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            身體保養
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
            全身保養貼士，從按摩到護膚，教你由頭到腳全面護理身體，養出光滑水潤肌膚。
          </p>
        </div>
      </section>

      {/* ═══════════ 2. TAB NAVIGATION ═══════════ */}
      <section className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-1 py-3 min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-200/50'
                      : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 3. CONTENT AREA ═══════════ */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Main Column ── */}
          <div className="flex-1 min-w-0">
            {/* Featured Zone */}
            {mainFeatured && (
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
                  <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #93c5fd, #3b82f6)' }} />
                  {activeTab === '全部' ? '最新文章' : activeTab}
                </h2>
                <span className="text-[12px] text-slate-400">
                  共 {feedArticles.length + featuredArticles.length} 篇文章
                </span>
              </div>

              {feedArticles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {feedArticles.map((article, i) => (
                    <ArticleCard key={`${activeTab}-${i}`} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/60 rounded-xl border border-slate-100/60">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-blue-50">
                    <Clock className="w-7 h-7 text-blue-300" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 mb-1">更多精彩內容即將推出</h3>
                  <p className="text-sm text-slate-400">敬請期待更多「{activeTab}」相關文章！</p>
                </div>
              )}
            </section>

            {/* ── Latest Updates (mobile only) ── */}
            <section className="mt-10 lg:hidden">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #93c5fd, #3b82f6)' }} />
                <TrendingUp className="w-4 h-4 text-blue-500" />
                最新更新
              </h2>
              <div className="space-y-3">
                {ALL_ARTICLES.slice(0, 5).map((article, i) => (
                  <ArticleCardWide key={i} article={article} />
                ))}
              </div>
            </section>
          </div>

          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-[300px] shrink-0 space-y-5">
            {/* 熱門文章 */}
            <SidebarSection title="熱門文章" icon={Flame}>
              <div className="space-y-3">
                {TRENDING_ARTICLES.map((article, i) => (
                  <Link
                    key={i}
                    href="/body-care"
                    className="group flex items-start gap-3 hover:bg-blue-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <span className="text-lg font-bold text-blue-200 shrink-0 w-6 text-right leading-tight">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
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
                {EDITOR_PICKS.map((pick, i) => (
                  <Link
                    key={i}
                    href="/body-care"
                    className="group flex items-center gap-2.5 hover:bg-blue-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {pick.title}
                      </h4>
                      <span className="text-[12px] text-blue-400 font-medium">{pick.tag}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </SidebarSection>

            {/* 最新更新 */}
            <SidebarSection title="最新更新" icon={TrendingUp}>
              <div className="space-y-2.5">
                {ALL_ARTICLES.slice(0, 4).map((article, i) => (
                  <Link
                    key={i}
                    href="/body-care"
                    className="group flex gap-3 items-start hover:bg-blue-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-14 h-10 rounded-md object-cover shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h4 className="text-[12px] font-medium text-slate-700 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
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
                {POPULAR_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="text-[14px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-500 font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </SidebarSection>
          </aside>
        </div>
      </div>

      {/* ═══════════ MOBILE SIDEBAR MODULES ═══════════ */}
      <div className="lg:hidden max-w-[1280px] mx-auto px-4 sm:px-6 pb-10 space-y-6">
        {/* 熱門標籤 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #93c5fd, #3b82f6)' }} />
            <Tag className="w-3.5 h-3.5 text-blue-500" />
            熱門標籤
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TAGS.map((tag) => (
              <span
                key={tag}
                className="text-[14px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-500 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 編輯推薦 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #93c5fd, #3b82f6)' }} />
            <Star className="w-3.5 h-3.5 text-blue-500" />
            編輯推薦
          </h3>
          <div className="space-y-2">
            {EDITOR_PICKS.map((pick, i) => (
              <Link
                key={i}
                href="/body-care"
                className="group flex items-center gap-2.5 py-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                <div>
                  <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                    {pick.title}
                  </h4>
                  <span className="text-[12px] text-blue-400 font-medium">{pick.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 熱門文章 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #93c5fd, #3b82f6)' }} />
            <Flame className="w-3.5 h-3.5 text-blue-500" />
            熱門文章
          </h3>
          <div className="space-y-2.5">
            {TRENDING_ARTICLES.slice(0, 5).map((article, i) => (
              <Link
                key={i}
                href="/body-care"
                className="group flex items-start gap-3 py-1"
              >
                <span className="text-base font-bold text-blue-200 shrink-0 w-5 text-right leading-tight">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-blue-600 transition-colors leading-snug">
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
