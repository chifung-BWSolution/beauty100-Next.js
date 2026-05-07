'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import {
  Clock, ArrowRight, Eye, Flame, TrendingUp, Star,
  Bookmark, Tag, Leaf,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════ */

const TABS = [
  '全部',
  '健康飲食',
  '營養觀念',
  '排毒養顏',
  '瘦身飲食',
  '日常養生',
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
  // ── 健康飲食 ──
  {
    title: '美白食物排行榜：食出白滑肌膚',
    description: '想皮膚白滑？呢幾款食物含豐富維他命C同抗氧化成分，幫你由內靚到外，愈食愈靚。',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    tag: '美白飲食',
    category: ['健康飲食'],
    date: '2025年4月2日',
    views: '24.3K',
    featured: true,
  },
  {
    title: '飲食禁忌：呢啲食物會令皮膚變差',
    description: '有啲食物其實會令皮膚變差，睇吓你有冇食錯嘢，避開呢啲飲食陷阱。',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    tag: '注意事項',
    category: ['健康飲食'],
    date: '2025年3月25日',
    views: '15.8K',
    featured: true,
  },
  {
    title: '超級食物大盤點：每日必食嘅營養食材',
    description: '藜麥、奇亞籽、羽衣甘藍⋯⋯呢啲超級食物營養價值極高，日日食保持健康。',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    tag: '超級食物',
    category: ['健康飲食'],
    date: '2025年3月20日',
    views: '12.1K',
  },
  {
    title: '地中海飲食法：全球最健康嘅飲食模式',
    description: '地中海飲食獲WHO推薦，以橄欖油、魚類、蔬果為主，點樣融入日常生活？',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80',
    tag: '飲食法',
    category: ['健康飲食'],
    date: '2025年3月15日',
    views: '9.7K',
  },
  // ── 營養觀念 ──
  {
    title: '抗衰老超級食物：延緩衰老嘅飲食秘訣',
    description: '藍莓、三文魚、牛油果⋯⋯呢啲超級食物可以幫你有效延緩衰老，維持年輕狀態。',
    image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&q=80',
    tag: '抗氧化',
    category: ['營養觀念'],
    date: '2025年4月1日',
    views: '21.5K',
    featured: true,
  },
  {
    title: '膠原蛋白飲品真嘅有用？科學拆解',
    description: '膠原蛋白飲品大熱，但真係飲咗就有效？聽吓專家點講，科學角度分析。',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    tag: '科學解讀',
    category: ['營養觀念'],
    date: '2025年3月22日',
    views: '16.2K',
    featured: true,
  },
  {
    title: '維他命C點樣食先最有效？吸收率大解密',
    description: '維他命C係美白抗氧化必備，但唔同食法吸收率差好遠，教你最有效嘅攝取方式。',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&q=80',
    tag: '維他命',
    category: ['營養觀念'],
    date: '2025年3月18日',
    views: '11.4K',
  },
  // ── 排毒養顏 ──
  {
    title: '排毒飲食計劃：7日肌膚煥然一新',
    description: '7日排毒飲食計劃幫你清除體內毒素，改善腸胃健康，肌膚自然會變好。',
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80',
    tag: '排毒計劃',
    category: ['排毒養顏'],
    date: '2025年3月30日',
    views: '18.9K',
    featured: true,
  },
  {
    title: '綠色蔬果汁配方：每日一杯排清毒素',
    description: '自家製綠色蔬果汁，簡單幾種材料就可以有效排毒養顏，每日飲一杯好處多。',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600&q=80',
    tag: '果汁配方',
    category: ['排毒養顏'],
    date: '2025年3月24日',
    views: '13.6K',
  },
  {
    title: '排毒食材Top 10：清腸胃由飲食開始',
    description: '檸檬、薑、蘆薈⋯⋯呢10種天然排毒食材，日常加入餐單就可以改善體質。',
    image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&q=80',
    tag: '排毒食材',
    category: ['排毒養顏'],
    date: '2025年3月16日',
    views: '10.2K',
  },
  // ── 瘦身飲食 ──
  {
    title: '低卡飽肚餐單：減肥唔使捱餓',
    description: '想瘦身但唔想捱餓？呢幾款低卡但飽肚嘅餐單幫到你，食得飽又瘦得到。',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    tag: '低卡餐單',
    category: ['瘦身飲食'],
    date: '2025年3月28日',
    views: '17.4K',
    featured: true,
  },
  {
    title: '間歇性斷食入門指南：新手必讀',
    description: '間歇性斷食係近年大熱嘅飲食方式，16:8同5:2邊種啱你？新手應該點樣開始？',
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80',
    tag: '斷食',
    category: ['瘦身飲食'],
    date: '2025年3月21日',
    views: '14.8K',
  },
  {
    title: '高蛋白飲食：增肌減脂最強攻略',
    description: '想增肌減脂就要食啱蛋白質，教你計算每日所需份量同最佳食物來源。',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=80',
    tag: '高蛋白',
    category: ['瘦身飲食'],
    date: '2025年3月14日',
    views: '9.8K',
  },
  // ── 日常養生 ──
  {
    title: '養顏湯水推薦：靚湯養出好皮膚',
    description: '中式養顏湯水一直都好受歡迎，呢幾款靚湯簡單易煲又有效，全家都適合飲。',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
    tag: '養顏湯水',
    category: ['日常養生'],
    date: '2025年3月29日',
    views: '19.2K',
    featured: true,
  },
  {
    title: '日常養生茶推薦：簡單沖泡好處多',
    description: '每日一杯養生茶，改善體質又養顏，呢幾款茶啱晒都市人，辦公室都沖到。',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80',
    tag: '養生茶',
    category: ['日常養生'],
    date: '2025年3月19日',
    views: '11.7K',
  },
  {
    title: '四季養生飲食法：跟住時令食最健康',
    description: '中醫講究時令飲食，春夏秋冬各有唔同嘅飲食重點，跟住食養好身體。',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&q=80',
    tag: '四季養生',
    category: ['日常養生'],
    date: '2025年3月12日',
    views: '8.9K',
  },
  {
    title: '早餐點食最健康？營養師推薦5款組合',
    description: '早餐係一日之中最重要嘅一餐，營養師推薦5款簡單又健康嘅早餐組合。',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80',
    tag: '早餐',
    category: ['日常養生'],
    date: '2025年3月8日',
    views: '7.3K',
  },
];

const TRENDING_ARTICLES = [
  { title: '美白食物排行榜：食出白滑肌膚', views: '24.3K' },
  { title: '抗衰老超級食物：延緩衰老嘅飲食秘訣', views: '21.5K' },
  { title: '養顏湯水推薦：靚湯養出好皮膚', views: '19.2K' },
  { title: '排毒飲食計劃：7日肌膚煥然一新', views: '18.9K' },
  { title: '低卡飽肚餐單：減肥唔使捱餓', views: '17.4K' },
  { title: '膠原蛋白飲品真嘅有用？科學拆解', views: '16.2K' },
];

const EDITOR_PICKS = [
  { title: '健康飲食新手入門完整指南', tag: '編輯精選' },
  { title: '營養師推薦嘅日常食材清單', tag: '消費指南' },
  { title: '全家人都適合嘅養生餐單', tag: '家庭健康' },
  { title: '外食族點樣食得健康？', tag: '都市飲食' },
];

const POPULAR_TAGS = [
  '排毒', '美白', '抗氧化', '瘦身', '養生茶', '湯水',
  '超級食物', '維他命', '膠原蛋白', '斷食', '低卡',
  '高蛋白', '蔬果汁', '四季養生', '早餐', '營養',
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FeaturedMainCard({ article }: { article: Article }) {
  return (
    <Link href="/topics/healthy-diet-guide" className="group relative block rounded-2xl overflow-hidden bg-slate-900 h-[320px] sm:h-[360px] lg:h-full">
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
        <Badge className="bg-green-500 text-white border-0 text-[12px] mb-3 shadow-md">{article.tag}</Badge>
        <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-white leading-tight mb-2 group-hover:text-green-200 transition-colors">
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
    <Link href="/topics/healthy-diet-guide" className="group relative block rounded-xl overflow-hidden bg-slate-900 h-[140px] sm:h-[130px] lg:h-full">
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Badge className="bg-white/20 text-white border-0 text-[14px] backdrop-blur-sm mb-1.5">{article.tag}</Badge>
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-green-200 transition-colors">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href="/topics/healthy-diet-guide"
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
          <Badge className="bg-green-500 text-white border-0 text-[14px] shadow-sm">{article.tag}</Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2 group-hover:text-green-600 transition-colors leading-snug">
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
          <span className="flex items-center gap-1 text-sm text-green-500 font-medium group-hover:gap-2 transition-all">
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
      href="/topics/healthy-diet-guide"
      className="group flex gap-4 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100/80 p-3"
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-28 h-20 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="flex flex-col justify-center min-w-0">
        <Badge className="bg-green-50 text-green-500 border-0 text-[12px] w-fit mb-1">{article.tag}</Badge>
        <h4 className="text-[14px] font-semibold text-slate-700 line-clamp-2 group-hover:text-green-600 transition-colors leading-snug">
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
        <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #86efac, #22c55e)' }} />
        <Icon className="w-3.5 h-3.5 text-green-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function HealthyDietPage() {
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
        style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #f0f9ff 30%, #ecfeff 70%, #f0fdfa 100%)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-green-500" />
            <span className="text-[12px] font-semibold tracking-[0.15em] text-green-400 uppercase">Healthy Diet</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            飲食健康
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
            食出健康美麗！專業營養師教你點樣透過飲食改善膚質同身體狀態，從內到外養出好氣色。
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
                      ? 'bg-green-500 text-white shadow-md shadow-green-200/50'
                      : 'text-slate-500 hover:text-green-600 hover:bg-green-50/60'
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
                  <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #86efac, #22c55e)' }} />
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
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-green-50">
                    <Clock className="w-7 h-7 text-green-300" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 mb-1">更多精彩內容即將推出</h3>
                  <p className="text-sm text-slate-400">敬請期待更多「{activeTab}」相關文章！</p>
                </div>
              )}
            </section>

            {/* ── More Articles (mobile only) ── */}
            <section className="mt-10 lg:hidden">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #86efac, #22c55e)' }} />
                <TrendingUp className="w-4 h-4 text-green-500" />
                更多飲食健康文章
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
                    href="/healthy-diet"
                    className="group flex items-start gap-3 hover:bg-green-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <span className="text-lg font-bold text-green-200 shrink-0 w-6 text-right leading-tight">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-2 group-hover:text-green-600 transition-colors leading-snug">
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
                    href="/healthy-diet"
                    className="group flex items-center gap-2.5 hover:bg-green-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-green-300 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-1 group-hover:text-green-600 transition-colors">
                        {pick.title}
                      </h4>
                      <span className="text-[12px] text-green-400 font-medium">{pick.tag}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </SidebarSection>

            {/* 更多飲食健康文章 */}
            <SidebarSection title="更多飲食健康文章" icon={TrendingUp}>
              <div className="space-y-2.5">
                {ALL_ARTICLES.slice(0, 4).map((article, i) => (
                  <Link
                    key={i}
                    href="/healthy-diet"
                    className="group flex gap-3 items-start hover:bg-green-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-14 h-10 rounded-md object-cover shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h4 className="text-[12px] font-medium text-slate-700 line-clamp-2 group-hover:text-green-600 transition-colors leading-snug">
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
                    className="text-[14px] px-2.5 py-1 rounded-full bg-green-50 text-green-500 font-medium hover:bg-green-100 transition-colors cursor-pointer"
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
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #86efac, #22c55e)' }} />
            <Tag className="w-3.5 h-3.5 text-green-500" />
            熱門標籤
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TAGS.map((tag) => (
              <span
                key={tag}
                className="text-[14px] px-2.5 py-1 rounded-full bg-green-50 text-green-500 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 編輯推薦 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #86efac, #22c55e)' }} />
            <Star className="w-3.5 h-3.5 text-green-500" />
            編輯推薦
          </h3>
          <div className="space-y-2">
            {EDITOR_PICKS.map((pick, i) => (
              <Link
                key={i}
                href="/healthy-diet"
                className="group flex items-center gap-2.5 py-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-green-300 shrink-0" />
                <div>
                  <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-green-600 transition-colors">
                    {pick.title}
                  </h4>
                  <span className="text-[12px] text-green-400 font-medium">{pick.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 熱門文章 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #86efac, #22c55e)' }} />
            <Flame className="w-3.5 h-3.5 text-green-500" />
            熱門文章
          </h3>
          <div className="space-y-2.5">
            {TRENDING_ARTICLES.slice(0, 5).map((article, i) => (
              <Link
                key={i}
                href="/healthy-diet"
                className="group flex items-start gap-3 py-1"
              >
                <span className="text-base font-bold text-green-200 shrink-0 w-5 text-right leading-tight">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-green-600 transition-colors leading-snug">
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
