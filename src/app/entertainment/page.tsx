'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import {
  Clock, ArrowRight, Eye, Flame, TrendingUp, Star,
  Bookmark, Tag,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const TABS = [
  '全部',
  '明星護膚',
  '紅毯造型',
  '韓流美妝',
  '男星保養',
  '美容院推薦',
  '素顏話題',
  '幕後直擊',
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
  // ── 明星護膚 ──
  {
    title: '女星逆齡秘密：鄭秀文凍齡保養法公開',
    description: '年過五十依然青春嘅鄭秀文，原來佢嘅保養秘訣係咁簡單！從日常飲食到專業療程，全面揭開佢嘅逆齡之道。',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80',
    tag: '凍齡秘訣',
    category: ['明星護膚'],
    date: '2025年4月2日',
    views: '18.7K',
    featured: true,
  },
  {
    title: '佘詩曼護膚心得：從TVB花旦到凍齡女神',
    description: '佘詩曼分享佢多年嘅護膚經驗，保持肌膚年輕嘅關鍵原來係呢幾步。',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
    tag: '明星分享',
    category: ['明星護膚'],
    date: '2025年3月28日',
    views: '14.3K',
    featured: true,
  },
  {
    title: '張栢芝護膚routine大公開：三個孩子嘅媽依然少女肌',
    description: '張栢芝分享佢每日嘅護膚步驟，原來凍齡嘅秘密在於堅持同簡單。',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    tag: '護膚日常',
    category: ['明星護膚'],
    date: '2025年3月22日',
    views: '11.5K',
  },
  {
    title: '蔡卓妍護膚秘訣：點樣維持二十年唔變嘅好膚質',
    description: '阿Sa嘅皮膚一直保持得非常好，佢嘅護膚心得原來同佢嘅生活習慣好有關。',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    tag: '凍齡保養',
    category: ['明星護膚'],
    date: '2025年3月18日',
    views: '9.2K',
  },
  // ── 紅毯造型 ──
  {
    title: '紅毯造型背後：化妝師揭秘底妝技巧',
    description: '專業化妝師分享明星紅毯造型背後嘅底妝秘訣，零毛孔妝容原來係咁做，仲有獨家產品推薦。',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
    tag: '造型解構',
    category: ['紅毯造型'],
    date: '2025年4月1日',
    views: '16.4K',
    featured: true,
  },
  {
    title: '金像獎紅毯最佳造型盤點：邊個最令人驚艷？',
    description: '今屆金像獎紅毯上最令人印象深刻嘅造型，從髮型到妝容逐一分析。',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    tag: '紅毯回顧',
    category: ['紅毯造型'],
    date: '2025年3月30日',
    views: '13.6K',
    featured: true,
  },
  {
    title: '明星御用化妝師教你畫出高級感妝容',
    description: '多位金像獎御用化妝師分享打造高級感妝容嘅關鍵步驟同技巧。',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    tag: '妝容教學',
    category: ['紅毯造型'],
    date: '2025年3月25日',
    views: '10.8K',
  },
  // ── 韓流美妝 ──
  {
    title: '韓星護膚法：韓國女星最愛嘅護膚步驟',
    description: '韓國女星個個皮膚好好，原來佢哋嘅護膚步驟有呢啲秘密，10步韓式護膚法完全解構。',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80',
    tag: 'K-Beauty',
    category: ['韓流美妝'],
    date: '2025年3月29日',
    views: '15.1K',
    featured: true,
  },
  {
    title: 'BLACKPINK Jennie同款美妝：佢嘅日常妝容點樣畫？',
    description: '拆解Jennie嘅標誌性妝容，從眼妝到唇色教你step by step重現佢嘅風格。',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80',
    tag: 'K-POP妝容',
    category: ['韓流美妝', '紅毯造型'],
    date: '2025年3月26日',
    views: '12.4K',
  },
  {
    title: '韓國最新美容趨勢：Glass Skin進化版',
    description: '韓國美容界最新流行嘅「水光玻璃肌」升級版，比傳統glass skin更加通透自然。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    tag: '韓國趨勢',
    category: ['韓流美妝'],
    date: '2025年3月21日',
    views: '8.9K',
  },
  // ── 男星保養 ──
  {
    title: '男星護膚也瘋狂：陳偉霆嘅護膚心得',
    description: '男星都開始注重護膚，陳偉霆分享佢嘅日常護膚routine，簡單三步就搞掂。',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    tag: '男士護膚',
    category: ['男星保養'],
    date: '2025年3月27日',
    views: '11.2K',
    featured: true,
  },
  {
    title: '古天樂嘅護膚秘密：點樣保持「古仔」嘅帥氣',
    description: '古天樂一直保持良好嘅外型，佢嘅護膚同健身心得首次公開分享。',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80',
    tag: '型男保養',
    category: ['男星保養'],
    date: '2025年3月20日',
    views: '9.6K',
  },
  // ── 美容院推薦 ──
  {
    title: '娛樂圈最愛美容院排行榜：明星都去邊間？',
    description: '明星都去邊間美容院做Facial？呢幾間係娛樂圈人氣之選，普通人都book得到！',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80',
    tag: '排行榜',
    category: ['美容院推薦'],
    date: '2025年3月24日',
    views: '13.8K',
    featured: true,
  },
  {
    title: '明星御用美容師推薦：最有效嘅面部療程',
    description: '多位明星御用美容師親自推薦佢哋最常幫客人做嘅面部療程，效果即時見到。',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    tag: '療程推薦',
    category: ['美容院推薦'],
    date: '2025年3月19日',
    views: '10.1K',
  },
  // ── 素顏話題 ──
  {
    title: '女星素顏對比：邊個真係天生麗質？',
    description: '一眾女星嘅素顏照曝光，邊個先係真正嘅天生麗質？網友熱議排行榜公佈！',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
    tag: '話題熱議',
    category: ['素顏話題'],
    date: '2025年3月23日',
    views: '17.3K',
    featured: true,
  },
  {
    title: '明星素顏自信宣言：擁抱真實嘅自己',
    description: '越來越多明星喺社交媒體分享素顏照，呢股潮流背後嘅意義係咩？',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    tag: '正面態度',
    category: ['素顏話題'],
    date: '2025年3月16日',
    views: '7.5K',
  },
  // ── 幕後直擊 ──
  {
    title: '拍攝現場直擊：明星化妝間的護膚秘密',
    description: '跟住我哋深入拍攝現場，睇吓明星喺化妝間用咩產品保養肌膚。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '幕後花絮',
    category: ['幕後直擊'],
    date: '2025年3月17日',
    views: '8.7K',
  },
  {
    title: 'MV拍攝幕後：造型師點樣喺限時內打造完美造型',
    description: '從concept到完成只有幾個鐘，睇吓造型團隊點樣喺高壓環境下交出完美作品。',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    tag: '造型幕後',
    category: ['幕後直擊', '紅毯造型'],
    date: '2025年3月14日',
    views: '6.3K',
  },
  {
    title: '廣告拍攝特輯：美妝品牌點樣揀代言人',
    description: '揭秘美妝品牌揀選明星代言人嘅過程，原來皮膚狀態係最重要嘅考量因素。',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
    tag: '行業揭秘',
    category: ['幕後直擊'],
    date: '2025年3月12日',
    views: '5.8K',
  },
];

const TRENDING_ARTICLES = [
  { title: '女星素顏對比：邊個真係天生麗質？', views: '17.3K' },
  { title: '女星逆齡秘密：鄭秀文凍齡保養法', views: '18.7K' },
  { title: '紅毯造型背後：化妝師揭秘底妝技巧', views: '16.4K' },
  { title: '韓星護膚法：10步韓式護膚法', views: '15.1K' },
  { title: '娛樂圈最愛美容院排行榜', views: '13.8K' },
  { title: '佘詩曼護膚心得：凍齡女神之路', views: '14.3K' },
];

const EDITOR_PICKS = [
  { title: '2025年明星最愛護膚品大公開', tag: '編輯精選' },
  { title: '紅毯妝容完全重現教學', tag: '必讀教學' },
  { title: '明星御用美容院完整指南', tag: '消費指南' },
  { title: '男星護膚入門懶人包', tag: '型男必讀' },
];

const POPULAR_TAGS = [
  '凍齡', '素顏', '紅毯', 'K-Beauty', '明星同款', '護膚routine',
  '底妝', '男士護膚', '美容院', '造型師', '化妝教學', '逆齡',
  '韓星', '御用產品', '幕後花絮', '保養秘訣',
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
        <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #e879f9, #a21caf)' }} />
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

export default function EntertainmentPage() {
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
        style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #fdf2f8 30%, #fef9c3 70%, #fdf4ff 100%)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-fuchsia-500" />
            <span className="text-[12px] font-semibold tracking-[0.15em] text-fuchsia-400 uppercase">Entertainment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            娛樂圈
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
            追蹤娛樂圈最新美容動態，揭開明星嘅護膚秘密同美容心得，緊貼紅毯造型同韓流美妝潮流。
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
                  <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #e879f9, #a21caf)' }} />
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
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-fuchsia-50">
                    <Clock className="w-7 h-7 text-fuchsia-300" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 mb-1">更多精彩內容即將推出</h3>
                  <p className="text-sm text-slate-400">敬請期待更多「{activeTab}」相關文章！</p>
                </div>
              )}
            </section>

            {/* ── Latest Updates (mobile only) ── */}
            <section className="mt-10 lg:hidden">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #e879f9, #a21caf)' }} />
                <TrendingUp className="w-4 h-4 text-fuchsia-500" />
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
                    href="/entertainment"
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
                    href="/entertainment"
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

            {/* 最新更新 */}
            <SidebarSection title="最新更新" icon={TrendingUp}>
              <div className="space-y-2.5">
                {ALL_ARTICLES.slice(0, 4).map((article, i) => (
                  <Link
                    key={i}
                    href="/entertainment"
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
          </aside>
        </div>
      </div>

      {/* ═══════════ MOBILE SIDEBAR MODULES ═══════════ */}
      <div className="lg:hidden max-w-[1280px] mx-auto px-4 sm:px-6 pb-10 space-y-6">
        {/* 熱門標籤 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #e879f9, #a21caf)' }} />
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
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #e879f9, #a21caf)' }} />
            <Star className="w-3.5 h-3.5 text-fuchsia-500" />
            編輯推薦
          </h3>
          <div className="space-y-2">
            {EDITOR_PICKS.map((pick, i) => (
              <Link
                key={i}
                href="/entertainment"
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
            <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #e879f9, #a21caf)' }} />
            <Flame className="w-3.5 h-3.5 text-fuchsia-500" />
            熱門文章
          </h3>
          <div className="space-y-2.5">
            {TRENDING_ARTICLES.slice(0, 5).map((article, i) => (
              <Link
                key={i}
                href="/entertainment"
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
    </PublicLayout>
  );
}
