'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import {
  Clock, ArrowRight, Eye, Flame, TrendingUp, Star,
  Bookmark, Tag,
} from 'lucide-react';
import { HorizontalBannerAd, NativePromoCard, SidebarAdUnit } from '@/components/ads/AdComponents';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const TABS = [
  '全部',
  '娛樂焦點',
  '美容趨勢',
  '護膚保養',
  '化妝技巧',
  '生活熱話',
  '輕醫美話題',
  '自我投資',
] as const;

type TabLabel = (typeof TABS)[number];

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
  // ── 娛樂焦點 ──
  {
    title: '女星逆齡保養術：40歲皮膚如少女的秘密',
    description: '揭開多位凍齡女星的護膚秘訣，從日常習慣到專業療程全面解析，讓你也能擁有明星般的肌膚。',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80',
    tag: '明星護膚',
    category: ['娛樂焦點'],
    date: '2025年4月2日',
    views: '15.2K',
    featured: true,
  },
  {
    title: '韓國明星最愛的護膚品牌大公開',
    description: 'K-beauty品牌深度分析，看看韓國明星真正在用甚麼護膚產品。',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    tag: '韓流美妝',
    category: ['娛樂焦點', '美容趨勢'],
    date: '2025年3月30日',
    views: '12.8K',
    featured: true,
  },
  {
    title: '紅毯妝容解構：點樣畫出高級感？',
    description: '金像獎紅毯上的完美妝容背後，化妝師親自分享打造高級感的秘訣。',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    tag: '妝容教學',
    category: ['娛樂焦點', '化妝技巧'],
    date: '2025年3月28日',
    views: '9.5K',
  },
  {
    title: '星級髮型師推薦：今季最流行髮色',
    description: '多位明星御用髮型師分享今季最熱門的髮色趨勢，讓你走在潮流最前端。',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    tag: '時尚潮流',
    category: ['娛樂焦點'],
    date: '2025年3月25日',
    views: '7.3K',
  },
  // ── 美容趨勢 ──
  {
    title: '2025年最受歡迎嘅美容療程大盤點',
    description: '從水光針到HIFU，盤點今年最受香港女士歡迎的面部護理療程，一文睇晒各大人氣療程。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    tag: '年度盤點',
    category: ['美容趨勢'],
    date: '2025年4月1日',
    views: '18.6K',
    featured: true,
  },
  {
    title: '香港醫美市場2025年趨勢分析',
    description: '專家分析2025年香港醫美市場趨勢，邊啲療程將會成為新寵？',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80',
    tag: '市場分析',
    category: ['美容趨勢', '輕醫美話題'],
    date: '2025年3月29日',
    views: '11.4K',
    featured: true,
  },
  {
    title: '微電流美容儀真係有用？專家解讀',
    description: '家用美容儀越來越火，但真正有效果嗎？皮膚科專家為你深入分析。',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    tag: '產品評測',
    category: ['美容趨勢'],
    date: '2025年3月27日',
    views: '8.9K',
  },
  // ── 護膚保養 ──
  {
    title: '敏感肌護理：溫和有效嘅保養方法',
    description: '敏感肌膚嘅你唔使驚，以下呢幾款溫和療程同護膚品專為敏感肌而設。',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
    tag: '敏感肌',
    category: ['護膚保養'],
    date: '2025年3月26日',
    views: '10.2K',
    featured: true,
  },
  {
    title: '毛孔收細全攻略：從清潔到醫美',
    description: '針對不同毛孔問題的解決方案，從家居護理到專業療程全面解析。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '護膚指南',
    category: ['護膚保養'],
    date: '2025年3月24日',
    views: '12.3K',
  },
  {
    title: '韓式水光肌養成法：七日護膚計劃',
    description: '跟住做就可以擁有韓星般的水潤光澤肌膚，七日完整護膚攻略。',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    tag: '護膚教學',
    category: ['護膚保養', '化妝技巧'],
    date: '2025年3月22日',
    views: '9.8K',
  },
  {
    title: '成分黨必讀：透明質酸 vs 神經醯胺',
    description: '兩大保濕明星成分深度比較，幫你揀啱最適合自己嘅護膚成分。',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    tag: '成分分析',
    category: ['護膚保養'],
    date: '2025年3月20日',
    views: '7.6K',
  },
  // ── 化妝技巧 ──
  {
    title: '零基礎化妝入門：五分鐘日常妝容教學',
    description: '化妝新手必睇！簡單五步驟教你畫出自然清透的日常妝容。',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    tag: '新手教學',
    category: ['化妝技巧'],
    date: '2025年3月19日',
    views: '11.1K',
  },
  {
    title: '遮瑕大法：不同瑕疵的遮瑕技巧',
    description: '黑眼圈、暗瘡印、色斑⋯⋯不同瑕疵需要不同遮瑕方法，專業化妝師教你逐一擊破。',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    tag: '化妝教學',
    category: ['化妝技巧'],
    date: '2025年3月17日',
    views: '6.5K',
  },
  // ── 生活熱話 ──
  {
    title: '食出好皮膚：美容飲食完全指南',
    description: '營養師推薦的美容飲食方案，由內至外改善膚質，吃出好氣色。',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
    tag: '飲食健康',
    category: ['生活熱話'],
    date: '2025年3月16日',
    views: '8.4K',
  },
  {
    title: '都市人壓力管理：身心平衡護膚法',
    description: '壓力係皮膚嘅大敵！學識管理壓力，從身心兩方面改善肌膚狀態。',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    tag: '身心健康',
    category: ['生活熱話', '自我投資'],
    date: '2025年3月14日',
    views: '5.9K',
  },
  {
    title: '睡眠同護膚嘅關係：點樣瞓出好皮膚',
    description: '睡眠質素直接影響肌膚狀態，了解優質睡眠對護膚的重要性。',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    tag: '生活貼士',
    category: ['生活熱話'],
    date: '2025年3月12日',
    views: '6.7K',
  },
  // ── 輕醫美話題 ──
  {
    title: 'HIFU vs Thermage：最新技術全面比較',
    description: '兩大拉提療程全面比較，從原理到效果逐一分析，幫你揀啱最適合自己嘅療程。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    tag: '療程比較',
    category: ['輕醫美話題'],
    date: '2025年3月28日',
    views: '14.1K',
    featured: true,
  },
  {
    title: '皮秒激光 vs 傳統激光：邊個更啱你？',
    description: '皮秒激光近年大熱，但同傳統激光有咩分別？專家為你詳細解構兩者優劣。',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    tag: '療程分析',
    category: ['輕醫美話題'],
    date: '2025年3月23日',
    views: '9.8K',
  },
  {
    title: '醫美療程前後注意事項全攻略',
    description: '做醫美療程之前要準備啲咩？術後護理點做先啱？呢篇文章幫到你。',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    tag: '實用指南',
    category: ['輕醫美話題'],
    date: '2025年3月18日',
    views: '8.2K',
  },
  // ── 自我投資 ──
  {
    title: '美容投資回報率：哪些療程最值得？',
    description: '從性價比角度分析各類美容療程，幫你做出最明智嘅美容投資決定。',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
    tag: '消費指南',
    category: ['自我投資'],
    date: '2025年3月21日',
    views: '10.5K',
    featured: true,
  },
  {
    title: '建立個人護膚routine：由零開始',
    description: '唔知從何入手？專家教你根據自己膚質建立最適合的護膚流程。',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    tag: '入門指南',
    category: ['自我投資', '護膚保養'],
    date: '2025年3月15日',
    views: '7.8K',
  },
  {
    title: '抗氧化超級食物 Top 10',
    description: '盤點十大抗氧化超級食物，從飲食層面守護你的年輕肌膚。',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    tag: '飲食美容',
    category: ['生活熱話', '自我投資'],
    date: '2025年3月10日',
    views: '6.2K',
  },
];

const TRENDING_ARTICLES = [
  { title: '毛孔收細全攻略：從清潔到醫美', views: '12.3K' },
  { title: 'HIFU vs Thermage 最新比較', views: '9.8K' },
  { title: '2025年度十大美容院排行榜', views: '8.5K' },
  { title: 'KOL實測：最強保濕精華液', views: '7.2K' },
  { title: '韓式水光肌養成法', views: '6.9K' },
  { title: '明星逆齡保養術大公開', views: '6.1K' },
];

const EDITOR_PICKS = [
  { title: '香港十大隱世美容院推薦', tag: '編輯推薦' },
  { title: '零基礎護膚入門懶人包', tag: '新手必讀' },
  { title: '美容院消費陷阱大揭密', tag: '消費指南' },
  { title: '醫美前必做的功課清單', tag: '實用貼士' },
];

const POPULAR_TAGS = [
  'HIFU', '水光針', '膠原蛋白', '美白', '抗衰老', '瘦面', '去斑',
  '暗瘡', '毛孔', '保濕', '防曬', '脫毛', '按摩', '纖體', '敏感肌', '韓式護膚',
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FeaturedMainCard({ article }: { article: Article }) {
  return (
    <Link href="/topics/celebrity-anti-aging-secrets" className="group relative block rounded-2xl overflow-hidden bg-slate-900 h-[320px] sm:h-[360px] lg:h-full">
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
        <Badge className="bg-rose-500 text-white border-0 text-[12px] mb-3 shadow-md">{article.tag}</Badge>
        <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-white leading-tight mb-2 group-hover:text-rose-200 transition-colors">
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
    <Link href="/topics/celebrity-anti-aging-secrets" className="group relative block rounded-xl overflow-hidden bg-slate-900 h-[140px] sm:h-[130px] lg:h-full">
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Badge className="bg-white/20 text-white border-0 text-[14px] backdrop-blur-sm mb-1.5">{article.tag}</Badge>
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-rose-200 transition-colors">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href="/topics/celebrity-anti-aging-secrets"
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

function ArticleCardWide({ article }: { article: Article }) {
  return (
    <Link
      href="/topics/celebrity-anti-aging-secrets"
      className="group flex gap-4 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100/80 p-3"
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-28 h-20 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="flex flex-col justify-center min-w-0">
        <Badge className="bg-rose-50 text-rose-500 border-0 text-[12px] w-fit mb-1">{article.tag}</Badge>
        <h4 className="text-[14px] font-semibold text-slate-700 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">
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

export default function TopicsPage() {
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
        style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 30%, #fefce8 70%, #fdf2f8 100%)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <span className="text-[12px] font-semibold tracking-[0.15em] text-rose-400 uppercase">Trending Topics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            焦點話題
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
            緊貼香港美容界最新動態，為你帶來最熱門嘅美容話題、深度分析同專家觀點。
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
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-200/50'
                      : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50/60'
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
                  <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }} />
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
                      {/* Insert native ad after every 6th card */}
                      {(i + 1) % 6 === 0 && i < feedArticles.length - 1 && (
                        <NativePromoCard variant={i % 12 === 5 ? 'salon' : 'treatment'} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/60 rounded-xl border border-slate-100/60">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-rose-50">
                    <Clock className="w-7 h-7 text-rose-300" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 mb-1">更多精彩內容即將推出</h3>
                  <p className="text-sm text-slate-400">敬請期待更多「{activeTab}」相關文章！</p>
                </div>
              )}
            </section>

            {/* ── Latest Updates (mobile only) ── */}
            <section className="mt-10 lg:hidden">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }} />
                <TrendingUp className="w-4 h-4 text-rose-500" />
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
                    href="/topics"
                    className="group flex items-start gap-3 hover:bg-rose-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <span className="text-lg font-bold text-rose-200 shrink-0 w-6 text-right leading-tight">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">
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
                    href="/topics"
                    className="group flex items-center gap-2.5 hover:bg-rose-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-1 group-hover:text-rose-600 transition-colors">
                        {pick.title}
                      </h4>
                      <span className="text-[12px] text-rose-400 font-medium">{pick.tag}</span>
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
                    href="/topics"
                    className="group flex gap-3 items-start hover:bg-rose-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-14 h-10 rounded-md object-cover shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h4 className="text-[12px] font-medium text-slate-700 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">
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
                    className="text-[14px] px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 font-medium hover:bg-rose-100 transition-colors cursor-pointer"
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
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }} />
            <Tag className="w-3.5 h-3.5 text-rose-500" />
            熱門標籤
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TAGS.map((tag) => (
              <span
                key={tag}
                className="text-[14px] px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 編輯推薦 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }} />
            <Star className="w-3.5 h-3.5 text-rose-500" />
            編輯推薦
          </h3>
          <div className="space-y-2">
            {EDITOR_PICKS.map((pick, i) => (
              <Link
                key={i}
                href="/topics"
                className="group flex items-center gap-2.5 py-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                <div>
                  <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-rose-600 transition-colors">
                    {pick.title}
                  </h4>
                  <span className="text-[12px] text-rose-400 font-medium">{pick.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 熱門文章 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }} />
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            熱門文章
          </h3>
          <div className="space-y-2.5">
            {TRENDING_ARTICLES.slice(0, 5).map((article, i) => (
              <Link
                key={i}
                href="/topics"
                className="group flex items-start gap-3 py-1"
              >
                <span className="text-base font-bold text-rose-200 shrink-0 w-5 text-right leading-tight">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-rose-600 transition-colors leading-snug">
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
