'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import {
  Clock, ArrowRight, Eye, Flame, TrendingUp, Star,
  Bookmark, Tag, Sparkles,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════ */

const TABS = [
  '全部',
  '熱門抗老',
  '療程解析',
  '膠原管理',
  '緊緻提升',
  '日常抗老',
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
  // ── 熱門抗老 ──
  {
    title: '2025年最受歡迎嘅抗老療程排行榜',
    description: '由專業醫美顧問評選出嘅年度最佳抗老療程，涵蓋提拉、修護、緊緻等多個範疇，幫你搵到最適合嘅回復青春方案。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    tag: '年度精選',
    category: ['熱門抗老'],
    date: '2025年4月2日',
    views: '24.3K',
    featured: true,
  },
  {
    title: '30歲後必做嘅5大抗老護理步驟',
    description: '30歲係肌膚老化嘅分水嶺，呢5個護理步驟可以有效延緩衰老，保持青春肌膚狀態。',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    tag: '抗老必讀',
    category: ['熱門抗老'],
    date: '2025年3月30日',
    views: '18.2K',
    featured: true,
  },
  {
    title: '抗老護膚品成分解讀：邊啲真正有效？',
    description: '視黃醇、煙酰胺、胜肽⋯⋯市面上嘅抗老成分多不勝數，了解邊啲成分真正經科學驗證有效。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '成分科學',
    category: ['熱門抗老'],
    date: '2025年3月25日',
    views: '12.7K',
  },
  {
    title: '抗老飲食攻略：由內到外回復年輕',
    description: '除咗外用護膚品，飲食對抗老同樣重要，呢啲超級食物可以幫你由內到外對抗衰老。',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    tag: '飲食抗老',
    category: ['熱門抗老'],
    date: '2025年3月20日',
    views: '9.8K',
  },
  // ── 療程解析 ──
  {
    title: 'HIFU超聲刀深度解構：提拉緊緻嘅黃金標準',
    description: '想做HIFU但唔知從何入手？呢篇文章由專業醫生詳細解構HIFU嘅原理、適合人群同預期效果。',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    tag: 'HIFU',
    category: ['療程解析'],
    date: '2025年4月1日',
    views: '21.6K',
    featured: true,
  },
  {
    title: '熱瑪吉 vs Ultherapy：兩大緊膚療程全面比較',
    description: '兩大人氣抗老療程比較分析，從價錢、效果到復原時間，幫你做出最適合嘅選擇。',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    tag: '療程比較',
    category: ['療程解析'],
    date: '2025年3月28日',
    views: '16.4K',
    featured: true,
  },
  {
    title: '埋線提升療程全攻略：效果可以維持幾耐？',
    description: '埋線提升療程可以即時見到效果，但究竟可以維持幾耐？術後護理要注意咩？',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80',
    tag: '埋線',
    category: ['療程解析'],
    date: '2025年3月22日',
    views: '11.3K',
  },
  {
    title: 'PRP自體血清療程：用自己嘅血液回復青春',
    description: 'PRP療程利用自體血小板生長因子刺激膠原增生，了解呢個天然抗老療程嘅原理同效果。',
    image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=600&q=80',
    tag: 'PRP',
    category: ['療程解析'],
    date: '2025年3月18日',
    views: '8.9K',
  },
  // ── 膠原管理 ──
  {
    title: '膠原蛋白流失：點解25歲後皮膚開始鬆弛？',
    description: '了解膠原蛋白流失嘅原因同速度，以及點樣通過日常護理同療程有效補充膠原。',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=80',
    tag: '膠原流失',
    category: ['膠原管理'],
    date: '2025年3月27日',
    views: '17.5K',
    featured: true,
  },
  {
    title: '口服膠原蛋白有效嗎？科學研究點樣講',
    description: '口服膠原蛋白補充劑到底有冇用？最新科學研究揭示膠原蛋白補充嘅真相。',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    tag: '膠原補充',
    category: ['膠原管理'],
    date: '2025年3月23日',
    views: '13.2K',
  },
  {
    title: '刺激膠原增生嘅5大有效方法',
    description: '除咗食補充品，呢5個方法可以有效刺激皮膚自我產生膠原蛋白，回復彈性緊緻。',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
    tag: '膠原增生',
    category: ['膠原管理'],
    date: '2025年3月19日',
    views: '8.6K',
  },
  // ── 緊緻提升 ──
  {
    title: '面部輪廓提升：唔同年齡嘅最佳方案',
    description: '20代、30代、40代各有唔同嘅面部輪廓問題，了解每個年齡段最適合嘅提升方案。',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    tag: '輪廓提升',
    category: ['緊緻提升'],
    date: '2025年3月26日',
    views: '14.8K',
    featured: true,
  },
  {
    title: '法令紋消除全攻略：從預防到治療',
    description: '法令紋係最容易顯老嘅面部紋路之一，呢篇文章教你點樣預防同有效消除法令紋。',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
    tag: '法令紋',
    category: ['緊緻提升'],
    date: '2025年3月21日',
    views: '11.9K',
  },
  {
    title: '雙下巴點樣消除？非手術方案大比拼',
    description: '雙下巴困擾好多人，呢幾個非手術方案可以幫你有效改善面部輪廓。',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80',
    tag: '雙下巴',
    category: ['緊緻提升'],
    date: '2025年3月17日',
    views: '10.1K',
  },
  // ── 日常抗老 ──
  {
    title: '日常抗老習慣：簡單改變帶來大不同',
    description: '抗老唔一定要靠昂貴療程，呢啲日常習慣改變已經可以有效延緩肌膚老化。',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    tag: '日常習慣',
    category: ['日常抗老'],
    date: '2025年3月29日',
    views: '15.3K',
    featured: true,
  },
  {
    title: '防曬抗老：紫外線係肌膚老化嘅頭號敵人',
    description: '80%嘅面部老化都係由紫外線引起，做好防曬就係最有效嘅抗老方法。',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    tag: '防曬抗老',
    category: ['日常抗老'],
    date: '2025年3月24日',
    views: '11.5K',
  },
  {
    title: '睡眠同抗老嘅關係：優質睡眠令你年輕5歲',
    description: '充足優質嘅睡眠可以促進生長激素分泌，幫助肌膚修復同再生。',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    tag: '睡眠修護',
    category: ['日常抗老'],
    date: '2025年3月16日',
    views: '7.8K',
  },
];

const TRENDING_ARTICLES = [
  { title: '2025年最受歡迎嘅抗老療程排行榜', views: '24.3K' },
  { title: 'HIFU超聲刀深度解構：提拉緊緻嘅黃金標準', views: '21.6K' },
  { title: '30歲後必做嘅5大抗老護理步驟', views: '18.2K' },
  { title: '膠原蛋白流失：25歲後皮膚鬆弛', views: '17.5K' },
  { title: '熱瑪吉 vs Ultherapy 全面比較', views: '16.4K' },
  { title: '日常抗老習慣：簡單改變大不同', views: '15.3K' },
];

const EDITOR_PICKS = [
  { title: '抗老療程新手入門完整指南', tag: '編輯精選' },
  { title: '回復青春護膚品成分解讀', tag: '必讀知識' },
  { title: '抗老美容院推薦', tag: '消費指南' },
  { title: '無創抗老方案全攻略', tag: '溫和抗老' },
];

const POPULAR_TAGS = [
  'HIFU', '熱瑪吉', '膠原蛋白', '緊緻提升', '埋線', '抗皺',
  '視黃醇', '胜肽', '法令紋', '眼紋', '頸紋', 'PRP',
  '超聲刀', '射頻', '提拉', '彈性纖維',
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FeaturedMainCard({ article }: { article: Article }) {
  return (
    <Link href="/topics/anti-aging-guide" className="group relative block rounded-2xl overflow-hidden bg-slate-900 h-[320px] sm:h-[360px] lg:h-full">
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
        <Badge className="bg-purple-500 text-white border-0 text-[12px] mb-3 shadow-md">{article.tag}</Badge>
        <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-white leading-tight mb-2 group-hover:text-purple-200 transition-colors">
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
    <Link href="/topics/anti-aging-guide" className="group relative block rounded-xl overflow-hidden bg-slate-900 h-[140px] sm:h-[130px] lg:h-full">
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Badge className="bg-white/20 text-white border-0 text-[14px] backdrop-blur-sm mb-1.5">{article.tag}</Badge>
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-purple-200 transition-colors">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href="/topics/anti-aging-guide"
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
          <Badge className="bg-purple-500 text-white border-0 text-[14px] shadow-sm">{article.tag}</Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2 group-hover:text-purple-600 transition-colors leading-snug">
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
          <span className="flex items-center gap-1 text-sm text-purple-500 font-medium group-hover:gap-2 transition-all">
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
      href="/topics/anti-aging-guide"
      className="group flex gap-4 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100/80 p-3"
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-28 h-20 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="flex flex-col justify-center min-w-0">
        <Badge className="bg-purple-50 text-purple-500 border-0 text-[12px] w-fit mb-1">{article.tag}</Badge>
        <h4 className="text-[14px] font-semibold text-slate-700 line-clamp-2 group-hover:text-purple-600 transition-colors leading-snug">
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
        <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #c084fc, #7c3aed)' }} />
        <Icon className="w-3.5 h-3.5 text-purple-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function AntiAgingPage() {
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
        style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 30%, #ede9fe 70%, #faf5ff 100%)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-[12px] font-semibold tracking-[0.15em] text-purple-400 uppercase">Anti-Aging</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            回復青春
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
            專業抗老回春資訊，從日常護理到醫美療程，幫你搵到最適合嘅逆齡方案，重拾年輕緊緻肌膚。
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
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-200/50'
                      : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50/60'
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
                  <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #c084fc, #7c3aed)' }} />
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
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-purple-50">
                    <Clock className="w-7 h-7 text-purple-300" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 mb-1">更多精彩內容即將推出</h3>
                  <p className="text-sm text-slate-400">敬請期待更多「{activeTab}」相關文章！</p>
                </div>
              )}
            </section>

            {/* ── Latest Updates (mobile only) ── */}
            <section className="mt-10 lg:hidden">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #c084fc, #7c3aed)' }} />
                <TrendingUp className="w-4 h-4 text-purple-500" />
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
                    href="/anti-aging"
                    className="group flex items-start gap-3 hover:bg-purple-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <span className="text-lg font-bold text-purple-200 shrink-0 w-6 text-right leading-tight">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-2 group-hover:text-purple-600 transition-colors leading-snug">
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
                    href="/anti-aging"
                    className="group flex items-center gap-2.5 hover:bg-purple-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {pick.title}
                      </h4>
                      <span className="text-[12px] text-purple-400 font-medium">{pick.tag}</span>
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
                    href="/anti-aging"
                    className="group flex gap-3 items-start hover:bg-purple-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-14 h-10 rounded-md object-cover shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h4 className="text-[12px] font-medium text-slate-700 line-clamp-2 group-hover:text-purple-600 transition-colors leading-snug">
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
                    className="text-[14px] px-2.5 py-1 rounded-full bg-purple-50 text-purple-500 font-medium hover:bg-purple-100 transition-colors cursor-pointer"
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
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #c084fc, #7c3aed)' }} />
            <Tag className="w-3.5 h-3.5 text-purple-500" />
            熱門標籤
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TAGS.map((tag) => (
              <span
                key={tag}
                className="text-[14px] px-2.5 py-1 rounded-full bg-purple-50 text-purple-500 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 編輯推薦 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #c084fc, #7c3aed)' }} />
            <Star className="w-3.5 h-3.5 text-purple-500" />
            編輯推薦
          </h3>
          <div className="space-y-2">
            {EDITOR_PICKS.map((pick, i) => (
              <Link
                key={i}
                href="/anti-aging"
                className="group flex items-center gap-2.5 py-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                <div>
                  <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-purple-600 transition-colors">
                    {pick.title}
                  </h4>
                  <span className="text-[12px] text-purple-400 font-medium">{pick.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 熱門文章 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #c084fc, #7c3aed)' }} />
            <Flame className="w-3.5 h-3.5 text-purple-500" />
            熱門文章
          </h3>
          <div className="space-y-2.5">
            {TRENDING_ARTICLES.slice(0, 5).map((article, i) => (
              <Link
                key={i}
                href="/anti-aging"
                className="group flex items-start gap-3 py-1"
              >
                <span className="text-base font-bold text-purple-200 shrink-0 w-5 text-right leading-tight">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-purple-600 transition-colors leading-snug">
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
