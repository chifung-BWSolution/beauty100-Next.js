'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import {
  Clock, ArrowRight, Eye, Flame, TrendingUp, Star,
  Bookmark, Tag, Sparkles,
} from 'lucide-react';
import { HorizontalBannerAd, NativePromoCard, SidebarAdUnit } from '@/components/ads/AdComponents';

/* ═══════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════ */

const TABS = [
  '全部',
  '底妝技巧',
  '護膚保養',
  '彩妝趨勢',
  '產品推薦',
  '韓系妝感',
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
  // ── 底妝技巧 ──
  {
    title: '底妝教學：打造零毛孔無瑕妝容',
    description: '專業化妝師教你用最簡單嘅方法打造零毛孔底妝，持久唔脫妝，全日完美。',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
    tag: '化妝技巧',
    category: ['底妝技巧'],
    date: '2025年4月2日',
    views: '24.3K',
    featured: true,
  },
  {
    title: '遮瑕膏選購指南：唔同膚質點揀好？',
    description: '遮瑕膏種類繁多，跟住呢篇指南就可以揀到最適合自己嘅產品，完美遮蓋瑕疵。',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80',
    tag: '底妝',
    category: ['底妝技巧'],
    date: '2025年3月28日',
    views: '18.7K',
    featured: true,
  },
  {
    title: '粉底液 vs 氣墊粉底：邊款更適合你？',
    description: '粉底液同氣墊粉底各有優缺點，分析唔同膚質應該揀邊款先至最自然持久。',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    tag: '底妝對比',
    category: ['底妝技巧'],
    date: '2025年3月20日',
    views: '12.5K',
  },
  {
    title: '定妝噴霧使用技巧：妝容持久一整日',
    description: '定妝噴霧唔止噴一噴咁簡單，正確使用方法可以令妝容持久度大幅提升。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '定妝',
    category: ['底妝技巧'],
    date: '2025年3月15日',
    views: '9.8K',
  },
  // ── 護膚保養 ──
  {
    title: '2025年必入嘅護膚品清單',
    description: '美容編輯精選2025年最值得入手嘅護膚品，唔同價位都有推薦，總有一款啱你。',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    tag: '推薦清單',
    category: ['護膚保養'],
    date: '2025年4月1日',
    views: '21.6K',
    featured: true,
  },
  {
    title: '防曬全攻略：唔同場合嘅防曬選擇',
    description: '防曬係護膚最重要一步！教你揀啱唔同場合嘅防曬產品，全面保護肌膚。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '防曬',
    category: ['護膚保養'],
    date: '2025年3月25日',
    views: '16.2K',
    featured: true,
  },
  {
    title: '敏感肌護膚品推薦：溫和又有效嘅選擇',
    description: '敏感肌選護膚品好頭痛？呢幾款溫和又有效嘅產品啱晒你，唔再怕過敏。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    tag: '敏感肌',
    category: ['護膚保養'],
    date: '2025年3月19日',
    views: '13.4K',
  },
  {
    title: '卸妝正確步驟：你可能一直做錯咗',
    description: '卸妝係護膚嘅第一步，但好多人嘅卸妝方法其實係錯嘅！學識正確步驟好重要。',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80',
    tag: '清潔',
    category: ['護膚保養'],
    date: '2025年3月16日',
    views: '10.1K',
  },
  // ── 彩妝趨勢 ──
  {
    title: '2025春夏彩妝趨勢：大膽撞色成主流',
    description: '今季彩妝潮流以大膽撞色為主調，教你點樣日常都可以carry到，潮爆全場。',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80',
    tag: '趨勢',
    category: ['彩妝趨勢'],
    date: '2025年3月30日',
    views: '19.4K',
    featured: true,
  },
  {
    title: '唇妝新玩法：漸層唇色教學',
    description: '漸層唇妝係今季大熱趨勢，教你用簡單技巧畫出完美漸層唇色。',
    image: 'https://images.unsplash.com/photo-1583241475880-083f84372725?w=600&q=80',
    tag: '唇妝',
    category: ['彩妝趨勢'],
    date: '2025年3月22日',
    views: '14.8K',
  },
  {
    title: '眼影配色攻略：新手都可以畫出大師級眼妝',
    description: '眼影配色係化妝新手最怕嘅一環，呢篇攻略教你簡單配色法則。',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
    tag: '眼妝',
    category: ['彩妝趨勢'],
    date: '2025年3月18日',
    views: '11.3K',
  },
  // ── 產品推薦 ──
  {
    title: '平價護膚好物推薦：$200以下嘅寶藏產品',
    description: '護膚唔一定要貴！呢幾款$200以下嘅產品效果一樣出色，性價比超高。',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
    tag: '平價好物',
    category: ['產品推薦'],
    date: '2025年3月27日',
    views: '17.2K',
    featured: true,
  },
  {
    title: '精華液排行榜：10款最受歡迎精華液評比',
    description: '精華液係護膚步驟中最重要嘅一環，呢10款精華液各有特色，邊款最啱你？',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    tag: '排行榜',
    category: ['產品推薦'],
    date: '2025年3月23日',
    views: '15.6K',
  },
  {
    title: '面膜推薦：唔同膚質嘅最佳選擇',
    description: '面膜種類繁多，呢篇文章幫你按照膚質揀出最適合嘅面膜產品。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '面膜',
    category: ['產品推薦'],
    date: '2025年3月14日',
    views: '8.9K',
  },
  // ── 韓系妝感 ──
  {
    title: '韓系化妝教學：自然裸妝步驟分享',
    description: '韓系自然裸妝一直都好受歡迎，跟住呢個教學就可以輕鬆做到，素顏感滿分。',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    tag: '韓妝教學',
    category: ['韓系妝感'],
    date: '2025年3月26日',
    views: '20.1K',
    featured: true,
  },
  {
    title: '韓國女生嘅水光肌秘密',
    description: '想擁有韓國女生嘅水光肌？呢幾個護膚步驟同產品你一定要知。',
    image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=600&q=80',
    tag: '水光肌',
    category: ['韓系妝感'],
    date: '2025年3月21日',
    views: '16.8K',
  },
  {
    title: 'K-Beauty必買清單：韓國藥妝店掃貨攻略',
    description: '去韓國旅行唔知買咩護膚品好？呢份清單幫你整理好所有必買好物。',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    tag: '韓國必買',
    category: ['韓系妝感'],
    date: '2025年3月12日',
    views: '13.5K',
  },
];

const TRENDING_ARTICLES = [
  { title: '底妝教學：打造零毛孔無瑕妝容', views: '24.3K' },
  { title: '2025年必入嘅護膚品清單', views: '21.6K' },
  { title: '韓系化妝教學：自然裸妝步驟分享', views: '20.1K' },
  { title: '2025春夏彩妝趨勢：大膽撞色成主流', views: '19.4K' },
  { title: '遮瑕膏選購指南：唔同膚質點揀好？', views: '18.7K' },
  { title: '平價護膚好物推薦：$200以下嘅寶藏產品', views: '17.2K' },
];

const EDITOR_PICKS = [
  { title: '化妝新手入門完整指南', tag: '編輯精選' },
  { title: '最值得投資嘅護膚步驟', tag: '護膚建議' },
  { title: '專櫃 vs 開架彩妝大比拼', tag: '消費指南' },
  { title: '換季護膚注意事項', tag: '季節護理' },
];

const POPULAR_TAGS = [
  '底妝', '遮瑕', '防曬', '精華液', '面膜', '韓妝',
  '眼影', '唇膏', '卸妝', '保濕', '美白', '抗衰老',
  '敏感肌', '控油', '毛孔', '素顏霜',
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FeaturedMainCard({ article }: { article: Article }) {
  return (
    <Link href="/topics/skincare-guide" className="group relative block rounded-2xl overflow-hidden bg-slate-900 h-[320px] sm:h-[360px] lg:h-full">
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
        <Badge className="bg-fuchsia-500 text-white border-0 text-[12px] mb-3 shadow-md">{article.tag}</Badge>
        <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-white leading-tight mb-2 group-hover:text-fuchsia-200 transition-colors">
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
    <Link href="/topics/skincare-guide" className="group relative block rounded-xl overflow-hidden bg-slate-900 h-[140px] sm:h-[130px] lg:h-full">
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Badge className="bg-white/20 text-white border-0 text-[14px] backdrop-blur-sm mb-1.5">{article.tag}</Badge>
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-fuchsia-200 transition-colors">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href="/topics/skincare-guide"
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
          <Badge className="bg-fuchsia-500 text-white border-0 text-[14px] shadow-sm">{article.tag}</Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2 group-hover:text-fuchsia-600 transition-colors leading-snug">
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
          <span className="flex items-center gap-1 text-sm text-fuchsia-500 font-medium group-hover:gap-2 transition-all">
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
      href="/topics/skincare-guide"
      className="group flex gap-4 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100/80 p-3"
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-28 h-20 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="flex flex-col justify-center min-w-0">
        <Badge className="bg-fuchsia-50 text-fuchsia-500 border-0 text-[12px] w-fit mb-1">{article.tag}</Badge>
        <h4 className="text-[14px] font-semibold text-slate-700 line-clamp-2 group-hover:text-fuchsia-600 transition-colors leading-snug">
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
        <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #f0abfc, #d946ef)' }} />
        <Icon className="w-3.5 h-3.5 text-fuchsia-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function SkincarePage() {
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
      <div style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
        {/* ═══════════ 1. PAGE HEADER ═══════════ */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #faf5ff 30%, #fdf2f8 70%, #fdf4ff 100%)' }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-fuchsia-500" />
              <span className="text-[12px] font-semibold tracking-[0.15em] text-fuchsia-400 uppercase">Skincare &amp; Makeup</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              化妝護膚
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
              最新化妝護膚技巧同產品推薦，幫你揀啱最適合嘅護膚品同學識化妝技巧，養出完美肌膚。
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
                        ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-200/50'
                        : 'text-slate-500 hover:text-fuchsia-600 hover:bg-fuchsia-50/60'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ AD: Slim Banner Below Tabs ═══════════ */}
        <HorizontalBannerAd variant="slim" />

        {/* ═══════════ 3. CONTENT AREA ═══════════ */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
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
                    <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f0abfc, #d946ef)' }} />
                    {activeTab === '全部' ? '最新文章' : activeTab}
                  </h2>
                  <span className="text-[12px] text-slate-400">
                    共 {feedArticles.length + featuredArticles.length} 篇文章
                  </span>
                </div>

                {feedArticles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {feedArticles.map((article, i) => (
                      <React.Fragment key={`${activeTab}-${i}`}>
                        <ArticleCard article={article} />
                        {(i + 1) % 6 === 0 && i < feedArticles.length - 1 && (
                          <NativePromoCard variant={i % 12 === 5 ? 'salon' : 'default'} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white/60 rounded-xl border border-slate-100/60">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-fuchsia-50">
                      <Clock className="w-7 h-7 text-fuchsia-300" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-700 mb-1">更多精彩內容即將推出</h3>
                    <p className="text-sm text-slate-400">敬請期待更多「{activeTab}」相關文章！</p>
                  </div>
                )}
              </section>

              {/* ── 更多化妝護膚文章 (mobile only) ── */}
              <section className="mt-10 lg:hidden">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f0abfc, #d946ef)' }} />
                  <TrendingUp className="w-4 h-4 text-fuchsia-500" />
                  更多化妝護膚文章
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
                      href="/skincare"
                      className="group flex items-start gap-3 hover:bg-fuchsia-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <span className="text-lg font-bold text-fuchsia-200 shrink-0 w-6 text-right leading-tight">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-[14px] font-medium text-slate-700 line-clamp-2 group-hover:text-fuchsia-600 transition-colors leading-snug">
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
                      href="/skincare"
                      className="group flex items-center gap-2.5 hover:bg-fuchsia-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-fuchsia-300 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-[14px] font-medium text-slate-700 line-clamp-1 group-hover:text-fuchsia-600 transition-colors">
                          {pick.title}
                        </h4>
                        <span className="text-[12px] text-fuchsia-400 font-medium">{pick.tag}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </SidebarSection>

              {/* 更多化妝護膚文章 */}
              <SidebarSection title="更多化妝護膚文章" icon={TrendingUp}>
                <div className="space-y-2.5">
                  {ALL_ARTICLES.slice(0, 4).map((article, i) => (
                    <Link
                      key={i}
                      href="/skincare"
                      className="group flex gap-3 items-start hover:bg-fuchsia-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-14 h-10 rounded-md object-cover shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <h4 className="text-[12px] font-medium text-slate-700 line-clamp-2 group-hover:text-fuchsia-600 transition-colors leading-snug">
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
                      className="text-[14px] px-2.5 py-1 rounded-full bg-fuchsia-50 text-fuchsia-500 font-medium hover:bg-fuchsia-100 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </SidebarSection>

              {/* Sidebar Ad Unit */}
              <SidebarAdUnit variant="app" />
            </aside>
          </div>
        </div>

        {/* ═══════════ MOBILE SIDEBAR MODULES ═══════════ */}
        <div className="lg:hidden max-w-[1280px] mx-auto px-4 sm:px-6 pb-10 space-y-6">
          {/* 熱門標籤 */}
          <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #f0abfc, #d946ef)' }} />
              <Tag className="w-3.5 h-3.5 text-fuchsia-500" />
              熱門標籤
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="text-[14px] px-2.5 py-1 rounded-full bg-fuchsia-50 text-fuchsia-500 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 編輯推薦 */}
          <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #f0abfc, #d946ef)' }} />
              <Star className="w-3.5 h-3.5 text-fuchsia-500" />
              編輯推薦
            </h3>
            <div className="space-y-2">
              {EDITOR_PICKS.map((pick, i) => (
                <Link
                  key={i}
                  href="/skincare"
                  className="group flex items-center gap-2.5 py-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5 text-fuchsia-300 shrink-0" />
                  <div>
                    <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-fuchsia-600 transition-colors">
                      {pick.title}
                    </h4>
                    <span className="text-[12px] text-fuchsia-400 font-medium">{pick.tag}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 熱門文章 */}
          <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #f0abfc, #d946ef)' }} />
              <Flame className="w-3.5 h-3.5 text-fuchsia-500" />
              熱門文章
            </h3>
            <div className="space-y-2.5">
              {TRENDING_ARTICLES.slice(0, 5).map((article, i) => (
                <Link
                  key={i}
                  href="/skincare"
                  className="group flex items-start gap-3 py-1"
                >
                  <span className="text-base font-bold text-fuchsia-200 shrink-0 w-5 text-right leading-tight">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-fuchsia-600 transition-colors leading-snug">
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
      </div>
    </PublicLayout>
  );
}
