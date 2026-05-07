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
  '熱門護膚',
  '療程解析',
  '抗老修護',
  '保濕美白',
  '敏感肌護理',
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
  // ── 熱門護膚 ──
  {
    title: '2025年最受歡迎嘅面部護理療程排行榜',
    description: '由專業美容師評選出嘅年度最佳面部療程，涵蓋清潔、修護、緊緻等多個範疇，幫你搵到最適合嘅護理方案。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    tag: '年度精選',
    category: ['熱門護膚'],
    date: '2025年4月2日',
    views: '22.1K',
    featured: true,
  },
  {
    title: '深層清潔面部護理：你一定要知嘅5個重點',
    description: '深層清潔唔止係洗面咁簡單，專業美容師分享5個深層清潔嘅重要知識同注意事項。',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    tag: '深層清潔',
    category: ['熱門護膚'],
    date: '2025年3月30日',
    views: '15.8K',
    featured: true,
  },
  {
    title: '每週護膚routine：面部護理嘅黃金時間表',
    description: '唔同嘅護膚步驟應該幾時做？跟住呢個時間表就可以事半功倍。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '護膚日程',
    category: ['熱門護膚'],
    date: '2025年3月25日',
    views: '11.3K',
  },
  {
    title: '面部按摩技巧：提升護膚品吸收效果',
    description: '正確嘅面部按摩手法可以促進血液循環，令護膚品更容易被皮膚吸收。',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80',
    tag: '按摩技巧',
    category: ['熱門護膚'],
    date: '2025年3月20日',
    views: '9.7K',
  },
  // ── 療程解析 ──
  {
    title: 'HIFU面部提升療程完全解構：效果、過程、價錢',
    description: '想做HIFU但唔知從何入手？呢篇文章由專業醫生詳細解構HIFU療程嘅原理、適合人群同預期效果。',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    tag: 'HIFU',
    category: ['療程解析'],
    date: '2025年4月1日',
    views: '19.5K',
    featured: true,
  },
  {
    title: '水光針 vs 光子嫩膚：邊個療程更適合你？',
    description: '兩大人氣面部療程比較分析，從價錢、效果到復原時間，幫你做出最適合嘅選擇。',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    tag: '療程比較',
    category: ['療程解析'],
    date: '2025年3月28日',
    views: '14.2K',
    featured: true,
  },
  {
    title: '微針療程全攻略：點樣安全有效地改善膚質',
    description: '微針療程可以改善毛孔粗大、暗瘡印同細紋，但做之前一定要了解呢啲注意事項。',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80',
    tag: '微針',
    category: ['療程解析'],
    date: '2025年3月22日',
    views: '10.6K',
  },
  {
    title: '射頻緊膚療程：原理同效果全面分析',
    description: '射頻緊膚係非入侵性嘅面部提升療程，了解佢嘅原理同預期效果。',
    image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=600&q=80',
    tag: '射頻',
    category: ['療程解析'],
    date: '2025年3月18日',
    views: '8.4K',
  },
  // ── 抗老修護 ──
  {
    title: '25歲開始抗老：面部護理嘅抗衰老策略',
    description: '抗老唔係等到出皺紋先開始，25歲就應該做好呢幾個抗老步驟，預防勝於治療。',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=80',
    tag: '早期抗老',
    category: ['抗老修護'],
    date: '2025年3月27日',
    views: '16.8K',
    featured: true,
  },
  {
    title: '眼部抗老護理：眼紋、黑眼圈全面解決方案',
    description: '眼部肌膚係全面最薄嘅地方，需要特別嘅護理方法先可以有效抗老。',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    tag: '眼部護理',
    category: ['抗老修護'],
    date: '2025年3月23日',
    views: '12.1K',
  },
  {
    title: '頸部護理被忽略？面部抗老唔能夠漏咗頸',
    description: '好多人只顧面部抗老但忽略頸部，其實頸紋先係最容易暴露年齡嘅部位。',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
    tag: '頸部護理',
    category: ['抗老修護'],
    date: '2025年3月19日',
    views: '7.9K',
  },
  // ── 保濕美白 ──
  {
    title: '面部保濕新觀念：唔同膚質嘅補水策略',
    description: '乾性、油性、混合性肌膚嘅保濕方法大不同，搵到啱自己嘅方法先最有效。',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    tag: '保濕攻略',
    category: ['保濕美白'],
    date: '2025年3月26日',
    views: '13.4K',
    featured: true,
  },
  {
    title: '美白淡斑面部護理：由內到外嘅亮白方案',
    description: '想膚色均勻白皙？除咗外用產品，呢啲面部護理方法可以加速美白效果。',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
    tag: '美白方案',
    category: ['保濕美白'],
    date: '2025年3月21日',
    views: '11.7K',
  },
  {
    title: '玻尿酸保濕面膜大評測：邊款最值得買？',
    description: '市面上嘅玻尿酸面膜琳琅滿目，我哋實測10款熱門產品幫你搵到性價比最高嘅選擇。',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80',
    tag: '產品評測',
    category: ['保濕美白'],
    date: '2025年3月17日',
    views: '9.3K',
  },
  // ── 敏感肌護理 ──
  {
    title: '敏感肌面部護理指南：溫和有效嘅護膚方案',
    description: '敏感肌護膚要特別小心，呢份完整指南教你點樣安全地做好面部護理。',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    tag: '敏感肌',
    category: ['敏感肌護理'],
    date: '2025年3月29日',
    views: '14.6K',
    featured: true,
  },
  {
    title: '換季敏感：面部護理嘅季節性調整策略',
    description: '每到換季皮膚就出事？學識季節性調整護膚routine，同敏感講拜拜。',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    tag: '換季護理',
    category: ['敏感肌護理'],
    date: '2025年3月24日',
    views: '10.2K',
  },
  {
    title: '泛紅肌膚修護：面部鎮靜舒緩療程推薦',
    description: '面部容易泛紅？了解泛紅成因同有效嘅鎮靜舒緩療程方案。',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    tag: '泛紅修護',
    category: ['敏感肌護理'],
    date: '2025年3月16日',
    views: '7.1K',
  },
];

const TRENDING_ARTICLES = [
  { title: '2025年最受歡迎嘅面部護理療程排行榜', views: '22.1K' },
  { title: 'HIFU面部提升療程完全解構', views: '19.5K' },
  { title: '25歲開始抗老：面部護理嘅抗衰老策略', views: '16.8K' },
  { title: '深層清潔面部護理：5個重點', views: '15.8K' },
  { title: '敏感肌面部護理指南', views: '14.6K' },
  { title: '水光針 vs 光子嫩膚比較', views: '14.2K' },
];

const EDITOR_PICKS = [
  { title: '面部療程新手入門完整指南', tag: '編輯精選' },
  { title: '護膚品成分解讀懶人包', tag: '必讀知識' },
  { title: '面部護理美容院推薦', tag: '消費指南' },
  { title: '敏感肌安全護理方案', tag: '溫和護膚' },
];

const POPULAR_TAGS = [
  '深層清潔', 'HIFU', '保濕', '美白', '抗老', '敏感肌',
  '水光針', '微針', '玻尿酸', '射頻', '面膜', '按摩',
  '毛孔', '暗瘡', '淡斑', '緊緻提升',
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FeaturedMainCard({ article }: { article: Article }) {
  return (
    <Link href="/topics/facial-care-guide" className="group relative block rounded-2xl overflow-hidden bg-slate-900 h-[320px] sm:h-[360px] lg:h-full">
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
    <Link href="/topics/facial-care-guide" className="group relative block rounded-xl overflow-hidden bg-slate-900 h-[140px] sm:h-[130px] lg:h-full">
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
      href="/topics/facial-care-guide"
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
      href="/topics/facial-care-guide"
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
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-200/50'
                      : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50/60'
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
                  <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #5eead4, #0d9488)' }} />
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
                  <p className="text-sm text-slate-400">敬請期待更多「{activeTab}」相關文章！</p>
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
                    href="/facial-care"
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
                {EDITOR_PICKS.map((pick, i) => (
                  <Link
                    key={i}
                    href="/facial-care"
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
                {ALL_ARTICLES.slice(0, 4).map((article, i) => (
                  <Link
                    key={i}
                    href="/facial-care"
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
                {POPULAR_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="text-[14px] px-2.5 py-1 rounded-full bg-teal-50 text-teal-500 font-medium hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
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
            {POPULAR_TAGS.map((tag) => (
              <span
                key={tag}
                className="text-[14px] px-2.5 py-1 rounded-full bg-teal-50 text-teal-500 font-medium"
              >
                {tag}
              </span>
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
            {EDITOR_PICKS.map((pick, i) => (
              <Link
                key={i}
                href="/facial-care"
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
            {TRENDING_ARTICLES.slice(0, 5).map((article, i) => (
              <Link
                key={i}
                href="/facial-care"
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
