'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PublicLayout from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import {
  Clock, Eye, Share2, Bookmark, Link2, ChevronRight,
  ArrowRight, Flame, Star, TrendingUp, Tag, User,
  Calendar, RefreshCw, MessageCircle, ThumbsUp, ArrowLeft,
  X, ChevronLeft, ZoomIn, ImageIcon,
} from 'lucide-react';
import { HorizontalBannerAd, InContentAd, PromotionalBlock, SidebarAdUnit } from '@/components/ads/AdComponents';

/* ═══════════════════════════════════════════════════════════════
   TYPES & DATA
   ═══════════════════════════════════════════════════════════════ */

interface ArticleData {
  slug: string;
  title: string;
  description: string;
  heroImage: string;
  heroCaption?: string;
  category: string;
  categorySlug: string;
  tag: string;
  author: string;
  authorAvatar: string;
  publishDate: string;
  publishTime: string;
  updatedDate?: string;
  updatedTime?: string;
  views: string;
  readTime: string;
  body: ContentBlock[];
}

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'bold-paragraph'; text: string }
  | { type: 'image'; src: string; caption?: string }
  | { type: 'gallery'; images: GalleryImage[] }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'list'; ordered?: boolean; items: string[] };

interface RelatedArticle {
  slug: string;
  title: string;
  image: string;
  tag: string;
  date: string;
  views: string;
}

/* ── Sample article data (keyed by slug) ── */

const ARTICLES_DB: Record<string, ArticleData> = {
  'celebrity-anti-aging-secrets': {
    slug: 'celebrity-anti-aging-secrets',
    title: '女星逆齡保養術：40歲皮膚如少女的秘密',
    description: '揭開多位凍齡女星的護膚秘訣，從日常習慣到專業療程全面解析，讓你也能擁有明星般的肌膚。',
    heroImage: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1200&q=80',
    heroCaption: '多位女星保持年輕肌膚的秘密武器，從日常護膚到專業療程一次公開。',
    category: '娛樂焦點',
    categorySlug: '娛樂焦點',
    tag: '明星護膚',
    author: '林美欣',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    publishDate: '2025年4月2日',
    publishTime: '14:30',
    updatedDate: '2025年4月3日',
    updatedTime: '09:15',
    views: '15.2K',
    readTime: '8 分鐘',
    body: [
      {
        type: 'paragraph',
        text: '在娛樂圈中，總有一些女星能夠完美抵抗歲月的痕跡，40歲看起來依然像少女一般。她們的秘密是什麼？今天我們將深入探討多位凍齡女星的護膚心得，從基礎護理到進階療程，為你一一揭開神秘面紗。',
      },
      {
        type: 'heading',
        text: '一、基礎護膚：從清潔開始的黃金法則',
      },
      {
        type: 'paragraph',
        text: '幾乎所有凍齡女星都強調一個共同點：徹底清潔是美肌的基石。鄭秀文曾在訪問中提到，她每晚都會進行雙重清潔——先用卸妝油溶解彩妝，再用溫和的潔面乳深層清潔。這個步驟看似簡單，卻是很多人容易忽略的。',
      },
      {
        type: 'quote',
        text: '護膚最重要的不是用多貴的產品，而是每天堅持做好基礎清潔和保濕。十年如一日，皮膚自然會回報你。',
        author: '鄭秀文',
      },
      {
        type: 'paragraph',
        text: '除了清潔之外，保濕也是不可或缺的一環。多位女星都會在清潔後立即塗上精華液和面霜，鎖住水分。有些還會在上妝前敷一片保濕面膜，讓妝容更加服貼持久。',
      },
      {
        type: 'heading',
        text: '二、專業療程：科技助力逆齡',
      },
      {
        type: 'paragraph',
        text: '隨著醫美技術日益進步，不少女星也開始借助專業療程來維持年輕外觀。其中最受歡迎的包括 HIFU 超聲刀、皮秒激光以及水光針等。這些療程各有特點，適合不同的肌膚需求。',
      },
      {
        type: 'gallery',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80',
            alt: '專業醫美療程',
            caption: '專業醫美療程成為不少女星維持年輕肌膚的秘密武器。',
          },
          {
            src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80',
            alt: '皮膚科專家諮詢',
            caption: '定期諮詢皮膚科專家，制定個人化的護膚方案是凍齡的關鍵。',
          },
          {
            src: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=900&q=80',
            alt: '日常護膚品',
            caption: '選擇適合自己膚質的護膚品，堅持使用才能看到效果。',
          },
          {
            src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&q=80',
            alt: '面部護理療程',
            caption: '面部護理療程幫助深層清潔和補充營養，提升肌膚光澤度。',
          },
          {
            src: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=900&q=80',
            alt: '保濕精華液',
            caption: '保濕精華液是凍齡女星們公認的每日必備護膚品。',
          },
          {
            src: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=900&q=80',
            alt: '健康飲食與美容',
            caption: '由內至外的美容理念越來越受到重視，健康飲食是基礎。',
          },
        ],
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'HIFU 超聲刀：透過聚焦超聲波能量，刺激深層膠原蛋白再生，達到提拉緊緻效果',
          '皮秒激光：以極短脈衝時間擊碎色素，有效改善色斑、暗沉等問題',
          '水光針：將透明質酸直接注入真皮層，即時補充水分，改善膚質',
          '射頻緊膚：利用射頻能量加熱真皮層，促進膠原蛋白收縮和新生',
        ],
      },
      {
        type: 'heading',
        text: '三、飲食與生活習慣的重要性',
      },
      {
        type: 'paragraph',
        text: '美麗不僅僅靠外在護理，內在調養同樣重要。多位凍齡女星都有嚴格的飲食習慣：多吃蔬果、少糖少鹽、充足飲水。張曼玉更是出名的健康飲食倡導者，她每天堅持喝至少兩公升水，並且盡量避免加工食品。',
      },
      {
        type: 'bold-paragraph',
        text: '研究顯示，充足的睡眠、適量的運動和健康的飲食習慣，對皮膚狀態的影響甚至超過昂貴的護膚品。這也是為什麼越來越多美容專家開始強調「由內至外」的護膚理念。',
      },
      {
        type: 'heading',
        text: '四、心態決定一切',
      },
      {
        type: 'paragraph',
        text: '最後也是最重要的一點——保持年輕的心態。壓力是皮膚老化的催化劑，而積極樂觀的心態則能讓人散發由內而外的光彩。許多凍齡女星都有自己的減壓方式，無論是瑜伽冥想、戶外運動還是閱讀寫作，都能有效緩解壓力，讓身心保持平衡。',
      },
      {
        type: 'quote',
        text: '真正的美麗來自內心的平靜和對生活的熱愛。年齡只是一個數字，重要的是你如何看待自己。',
        author: '張曼玉',
      },
      {
        type: 'paragraph',
        text: '無論你現在幾歲，開始認真對待自己的肌膚永遠不會太遲。找到適合自己的護膚方式，堅持下去，你也能擁有令人羨慕的凍齡美肌。',
      },
    ],
  },
  'hifu-vs-thermage': {
    slug: 'hifu-vs-thermage',
    title: 'HIFU vs Thermage：最新技術全面比較',
    description: '兩大拉提療程全面比較，從原理到效果逐一分析，幫你揀啱最適合自己嘅療程。',
    heroImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80',
    heroCaption: '了解兩大熱門拉提療程的差異，做出最適合自己的選擇。',
    category: '輕醫美話題',
    categorySlug: '輕醫美話題',
    tag: '療程比較',
    author: '陳雅琳',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    publishDate: '2025年3月28日',
    publishTime: '10:00',
    views: '14.1K',
    readTime: '10 分鐘',
    body: [
      {
        type: 'paragraph',
        text: '在香港醫美市場中，HIFU（高強度聚焦超聲波）和 Thermage（射頻緊膚）是兩大最受歡迎的非入侵性拉提療程。兩者都聲稱能有效對抗肌膚鬆弛和皺紋，但它們的原理、效果和適用人群都有所不同。今天我們邀請了多位皮膚科專家，為你作出最全面的比較分析。',
      },
      {
        type: 'heading',
        text: '一、基本原理的差異',
      },
      {
        type: 'paragraph',
        text: 'HIFU 利用高強度聚焦超聲波，將能量精準傳送到皮膚的深層（SMAS 筋膜層），透過熱凝固效應刺激膠原蛋白再生。而 Thermage 則使用單極射頻技術，以容量式加熱的方式均勻加熱真皮層及皮下組織。',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'HIFU：聚焦超聲波技術，能深達4.5mm SMAS層',
          'Thermage：單極射頻技術，均勻加熱3-4mm深度',
          'HIFU 屬於「點狀」加熱，Thermage 屬於「面狀」加熱',
          '兩者都能刺激膠原蛋白新生，但作用方式不同',
        ],
      },
      {
        type: 'heading',
        text: '二、效果與適用範圍',
      },
      {
        type: 'paragraph',
        text: '一般來說，HIFU 更擅長處理面部輪廓的提拉和收緊，特別是下頜線和雙下巴的改善。而 Thermage 則在整體緊緻和膚質改善方面表現更佳，尤其是眼周細紋和皮膚鬆弛。',
      },
      {
        type: 'quote',
        text: '沒有所謂最好的療程，只有最適合你的療程。選擇前最重要是了解自己的肌膚狀態和需求。',
        author: '皮膚科專家 Dr. Wong',
      },
      {
        type: 'heading',
        text: '三、療程體驗與恢復期',
      },
      {
        type: 'paragraph',
        text: '在舒適度方面，新一代的 Thermage FLX 已經大幅提升了療程體驗，配備了智能舒適脈衝系統。而 HIFU 在治療過程中可能會有較明顯的刺痛感，但隨著技術改進，最新版本已經有所改善。兩者的恢復期都很短，基本上不影響日常生活。',
      },
      {
        type: 'gallery',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80',
            alt: 'HIFU 超聲刀療程',
            caption: '現代醫美療程的恢復期越來越短，大部分人可以即日恢復正常活動。',
          },
          {
            src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80',
            alt: 'Thermage 射頻緊膚',
            caption: 'Thermage FLX 新一代智能舒適脈衝系統大幅提升療程體驗。',
          },
          {
            src: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=900&q=80',
            alt: '療程前後對比',
            caption: '兩種療程都能刺激膠原蛋白新生，但作用方式和適用範圍各有不同。',
          },
        ],
      },
      {
        type: 'heading',
        text: '四、如何選擇適合自己的療程？',
      },
      {
        type: 'paragraph',
        text: '選擇哪種療程取決於你的主要訴求：如果你想改善面部輪廓、提拉下垂，HIFU 可能更適合你；如果你追求整體緊緻和膚質改善，Thermage 可能是更好的選擇。當然，最理想的做法是諮詢專業的醫美醫生，根據你的具體情況制定個性化的治療方案。',
      },
      {
        type: 'bold-paragraph',
        text: '建議大家在選擇療程前，務必到正規的醫美診所進行諮詢，了解自己的肌膚狀態，再決定最適合的方案。切勿盲目追求潮流，選擇不適合自己的療程。',
      },
    ],
  },
  'beauty-trends-2025': {
    slug: 'beauty-trends-2025',
    title: '2025年最受歡迎嘅美容療程大盤點',
    description: '從水光針到HIFU，盤點今年最受香港女士歡迎的面部護理療程，一文睇晒各大人氣療程。',
    heroImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80',
    heroCaption: '2025年度最受歡迎的美容療程完整指南。',
    category: '美容趨勢',
    categorySlug: '美容趨勢',
    tag: '年度盤點',
    author: '周美儀',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    publishDate: '2025年4月1日',
    publishTime: '11:00',
    updatedDate: '2025年4月2日',
    updatedTime: '16:30',
    views: '18.6K',
    readTime: '12 分鐘',
    body: [
      {
        type: 'paragraph',
        text: '2025年香港美容市場持續蓬勃發展，各種創新療程層出不窮。從傳統的面部護理到最新的科技美容，消費者的選擇越來越多元化。根據我們的調查數據，以下幾種療程成為今年最受歡迎的選擇。',
      },
      {
        type: 'heading',
        text: '一、水光針：持續霸榜的人氣之王',
      },
      {
        type: 'paragraph',
        text: '水光針連續多年位居最受歡迎療程榜首。透過將透明質酸、維他命等營養成分直接注入真皮層，能快速改善膚質、提升水潤度。今年更有「無針水光」技術面世，讓怕打針的客人也能享受水光肌的效果。',
      },
      {
        type: 'heading',
        text: '二、皮秒激光：去斑美白新標準',
      },
      {
        type: 'paragraph',
        text: '皮秒激光以其精準、高效、低損傷的特點，成為去斑美白的首選。相比傳統激光，皮秒激光的脈衝時間更短，對周圍組織的熱損傷更小，恢復期也更短。今年最新的蜂巢皮秒技術更能同時改善毛孔和膚質。',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=900&q=80',
        caption: '皮秒激光已成為香港女士美白去斑的首選療程。',
      },
      {
        type: 'heading',
        text: '三、HIFU 超聲刀：非手術提拉之王',
      },
      {
        type: 'paragraph',
        text: 'HIFU 超聲刀依然是非手術面部提拉的首選方案。今年最新的第三代 HIFU 技術在精準度和舒適度上都有了顯著提升，單次治療即可看到明顯的提拉效果，適合面部開始出現鬆弛跡象的人群。',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          '水光針 — 即時補水、提升膚質，見效快',
          '皮秒激光 — 精準去斑、改善膚色不均',
          'HIFU 超聲刀 — 深層提拉、改善面部輪廓',
          'Thermage FLX — 全面緊緻、膠原蛋白再生',
          '肉毒桿菌 — 去除動態皺紋、瘦面',
        ],
      },
      {
        type: 'bold-paragraph',
        text: '選擇療程前建議先到專業美容院或醫美診所進行詳細諮詢，了解自己的肌膚狀況和需求，再決定最適合的療程方案。',
      },
    ],
  },
};

/* ── Default fallback article ── */
const DEFAULT_ARTICLE: ArticleData = ARTICLES_DB['celebrity-anti-aging-secrets'];

/* ── Related articles ── */
const RELATED_ARTICLES: RelatedArticle[] = [
  {
    slug: 'hifu-vs-thermage',
    title: 'HIFU vs Thermage：最新技術全面比較',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    tag: '療程比較',
    date: '2025年3月28日',
    views: '14.1K',
  },
  {
    slug: 'beauty-trends-2025',
    title: '2025年最受歡迎嘅美容療程大盤點',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    tag: '年度盤點',
    date: '2025年4月1日',
    views: '18.6K',
  },
  {
    slug: 'celebrity-anti-aging-secrets',
    title: '韓國明星最愛的護膚品牌大公開',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    tag: '韓流美妝',
    date: '2025年3月30日',
    views: '12.8K',
  },
  {
    slug: 'celebrity-anti-aging-secrets',
    title: '敏感肌護理：溫和有效嘅保養方法',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
    tag: '敏感肌',
    date: '2025年3月26日',
    views: '10.2K',
  },
];

const HOT_TOPICS: RelatedArticle[] = [
  {
    slug: 'celebrity-anti-aging-secrets',
    title: '皮秒激光 vs 傳統激光：邊個更啱你？',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    tag: '療程分析',
    date: '2025年3月23日',
    views: '9.8K',
  },
  {
    slug: 'celebrity-anti-aging-secrets',
    title: '微電流美容儀真係有用？專家解讀',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    tag: '產品評測',
    date: '2025年3月27日',
    views: '8.9K',
  },
  {
    slug: 'beauty-trends-2025',
    title: '醫美療程前後注意事項全攻略',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    tag: '實用指南',
    date: '2025年3月18日',
    views: '8.2K',
  },
  {
    slug: 'celebrity-anti-aging-secrets',
    title: '香港醫美市場2025年趨勢分析',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80',
    tag: '市場分析',
    date: '2025年3月29日',
    views: '11.4K',
  },
];

const TRENDING_SIDEBAR = [
  { title: '毛孔收細全攻略：從清潔到醫美', views: '12.3K' },
  { title: 'HIFU vs Thermage 最新比較', views: '9.8K' },
  { title: '2025年度十大美容院排行榜', views: '8.5K' },
  { title: 'KOL實測：最強保濕精華液', views: '7.2K' },
  { title: '韓式水光肌養成法', views: '6.9K' },
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
   IMAGE GALLERY COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function LightboxViewer({
  images,
  initialIndex,
  onClose,
}: {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const image = images[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all backdrop-blur-sm"
        aria-label="關閉"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 text-white/70 text-sm font-medium bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main content area */}
      <div className="relative flex flex-col lg:flex-row w-full h-full z-[1]">
        {/* Image area */}
        <div className="flex-1 flex items-center justify-center relative px-4 sm:px-12 lg:px-16 py-16 lg:py-8 min-h-0">
          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm z-10"
              aria-label="上一張"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Image */}
          <img
            src={image.src}
            alt={image.alt}
            className="max-w-full max-h-full object-contain rounded-lg select-none"
            draggable={false}
          />

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm z-10"
              aria-label="下一張"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* Caption side panel (desktop) / bottom panel (mobile) */}
        <div className="lg:w-[320px] shrink-0 bg-black/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/10">
          <div className="p-5 sm:p-6 lg:pt-20 h-full overflow-y-auto">
            {/* Image alt title */}
            <h3 className="text-white font-semibold text-base mb-3 leading-snug">
              {image.alt}
            </h3>

            {/* Caption / description */}
            {image.caption && (
              <p className="text-white/70 text-sm leading-relaxed">
                {image.caption}
              </p>
            )}

            {/* Thumbnail strip in lightbox */}
            {images.length > 1 && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-white/40 text-sm font-medium mb-3 uppercase tracking-wide">
                  所有圖片
                </p>
                <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`relative rounded-lg overflow-hidden aspect-square transition-all ${
                        i === currentIndex
                          ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-black/60 opacity-100'
                          : 'opacity-50 hover:opacity-80'
                      }`}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  const selectedImage = images[selectedIndex];

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailStripRef.current) {
      const activeThumb = thumbnailStripRef.current.children[selectedIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedIndex]);

  // If only one image, render normal single image
  if (images.length <= 1) {
    const img = images[0];
    return (
      <figure className="my-6">
        <div className="rounded-xl overflow-hidden">
          <img src={img.src} alt={img.alt} className="w-full h-auto object-cover" loading="lazy" />
        </div>
        {img.caption && (
          <figcaption className="text-[12px] text-slate-400 mt-2 text-center leading-relaxed">
            {img.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <>
      <figure className="my-6">
        {/* Main large image */}
        <div
          className="relative rounded-xl overflow-hidden cursor-zoom-in group shadow-sm"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            className="w-full h-auto aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {/* Zoom overlay hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-white text-sm font-medium">
              <ZoomIn className="w-4 h-4" />
              點擊放大瀏覽
            </div>
          </div>
          {/* Image counter badge */}
          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-white/90 text-[12px] font-medium">
            <ImageIcon className="w-3 h-3" />
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Alt text / caption area */}
        {selectedImage.caption && (
          <figcaption className="text-[14px] text-slate-500 mt-2.5 text-center leading-relaxed px-2">
            {selectedImage.caption}
          </figcaption>
        )}
        {selectedImage.alt && !selectedImage.caption && (
          <figcaption className="text-[12px] text-slate-400 mt-2 text-center leading-relaxed px-2">
            {selectedImage.alt}
          </figcaption>
        )}

        {/* Thumbnail strip */}
        <div
          ref={thumbnailStripRef}
          className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative shrink-0 w-[72px] h-[54px] sm:w-20 sm:h-[60px] rounded-lg overflow-hidden transition-all duration-200 ${
                i === selectedIndex
                  ? 'ring-2 ring-rose-400 ring-offset-1 ring-offset-white opacity-100 shadow-md'
                  : 'opacity-60 hover:opacity-90 border border-slate-200'
              }`}
              aria-label={img.alt || `圖片 ${i + 1}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Active indicator dot */}
              {i === selectedIndex && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-rose-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </figure>

      {/* Lightbox */}
      {lightboxOpen && (
        <LightboxViewer
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ARTICLE BODY RENDERER
   ═══════════════════════════════════════════════════════════════ */

function ArticleBody({ blocks }: { blocks: ContentBlock[] }) {
  const midPoint = Math.floor(blocks.length / 2);
  return (
    <div className="article-body space-y-5">
      {blocks.map((block, idx) => {
        const rendered = (() => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={idx} className="text-[15px] sm:text-base leading-[1.85] text-slate-700">
                {block.text}
              </p>
            );
          case 'bold-paragraph':
            return (
              <p key={idx} className="text-[15px] sm:text-base leading-[1.85] text-slate-800 font-medium bg-rose-50/50 border-l-3 border-rose-300 pl-4 py-3 rounded-r-lg">
                {block.text}
              </p>
            );
          case 'heading':
            return (
              <h2
                key={idx}
                className="text-lg sm:text-xl font-bold text-slate-900 pt-4 pb-1 leading-snug"
              >
                <span
                  className="inline-block w-1 h-5 rounded-full mr-2.5 align-middle"
                  style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }}
                />
                {block.text}
              </h2>
            );
          case 'image':
            return (
              <figure key={idx} className="my-6">
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={block.src}
                    alt={block.caption || ''}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-[12px] text-slate-400 mt-2 text-center leading-relaxed">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          case 'gallery':
            return <ImageGallery key={idx} images={block.images} />;
          case 'quote':
            return (
              <blockquote
                key={idx}
                className="relative my-6 pl-5 pr-4 py-4 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fff7ed 100%)' }}
              >
                <div
                  className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }}
                />
                <p className="text-[15px] sm:text-base leading-[1.8] text-slate-700 italic">
                  「{block.text}」
                </p>
                {block.author && (
                  <cite className="block mt-2 text-[14px] text-rose-500 font-medium not-italic">
                    — {block.author}
                  </cite>
                )}
              </blockquote>
            );
          case 'list':
            const ListTag = block.ordered ? 'ol' : 'ul';
            return (
              <ListTag
                key={idx}
                className={`space-y-2 pl-5 ${
                  block.ordered ? 'list-decimal' : 'list-disc'
                } marker:text-rose-400`}
              >
                {block.items.map((item, i) => (
                  <li key={i} className="text-[15px] sm:text-base leading-[1.8] text-slate-700 pl-1">
                    {item}
                  </li>
                ))}
              </ListTag>
            );
          default:
            return null;
        }
        })();
        return (
          <React.Fragment key={idx}>
            {rendered}
            {idx === midPoint && <InContentAd />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function ArticleToolbar({ onCopyLink }: { onCopyLink: () => void }) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleCopy = () => {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-200 hover:border-rose-200"
        title="複製連結"
      >
        <Link2 className="w-3.5 h-3.5" />
        {copied ? '已複製' : '複製連結'}
      </button>
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-200 hover:border-rose-200"
        title="分享"
      >
        <Share2 className="w-3.5 h-3.5" />
        分享
      </button>
      <button
        onClick={() => setBookmarked(!bookmarked)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${
          bookmarked
            ? 'text-rose-600 bg-rose-50 border-rose-200'
            : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-slate-200 hover:border-rose-200'
        }`}
        title="收藏"
      >
        <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
        {bookmarked ? '已收藏' : '收藏'}
      </button>
    </div>
  );
}

function RelatedArticleCard({ article }: { article: RelatedArticle }) {
  return (
    <Link
      href={`/topics/${article.slug}`}
      className="group rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-slate-100/80 block"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5">
          <Badge className="bg-rose-500 text-white border-0 text-[14px] shadow-sm">
            {article.tag}
          </Badge>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-slate-800 text-[14px] mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">
          {article.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[14px] text-slate-400">
            <Clock className="w-3 h-3" />
            {article.date}
          </span>
          <span className="flex items-center gap-1 text-[14px] text-slate-400">
            <Eye className="w-3 h-3" />
            {article.views}
          </span>
        </div>
      </div>
    </Link>
  );
}

function HotTopicCard({ article }: { article: RelatedArticle }) {
  return (
    <Link
      href={`/topics/${article.slug}`}
      className="group flex gap-3.5 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100/80 p-3"
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-24 h-[68px] rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="flex flex-col justify-center min-w-0">
        <Badge className="bg-rose-50 text-rose-500 border-0 text-[12px] w-fit mb-1">
          {article.tag}
        </Badge>
        <h4 className="text-[14px] font-semibold text-slate-700 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">
          {article.title}
        </h4>
        <span className="flex items-center gap-1 text-[14px] text-slate-400 mt-1">
          <Eye className="w-2.5 h-2.5" />
          {article.views} 瀏覽
        </span>
      </div>
    </Link>
  );
}

function SidebarSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3.5">
        <span
          className="w-1 h-4 rounded-full"
          style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }}
        />
        <Icon className="w-3.5 h-3.5 text-rose-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function TopicArticlePage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const article = ARTICLES_DB[slug] || DEFAULT_ARTICLE;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  return (
    <PublicLayout>
      {/* ═══════════ 1. BREADCRUMB & TOP INFO ═══════════ */}
      <section
        className="border-b border-slate-100"
        style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 30%, #fefce8 70%, #fdf2f8 100%)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[14px] text-slate-400 mb-4">
            <Link href="/" className="hover:text-rose-500 transition-colors">
              首頁
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/topics" className="hover:text-rose-500 transition-colors">
              焦點話題
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-rose-500 font-medium">{article.category}</span>
          </nav>

          {/* Category tag */}
          <Badge className="bg-rose-500 text-white border-0 text-[12px] shadow-sm mb-3">
            {article.tag}
          </Badge>

          {/* ═══════════ 2. ARTICLE TITLE ═══════════ */}
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
            {article.title}
          </h1>

          {/* ═══════════ 3. METADATA ROW ═══════════ */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-slate-400">
            {/* Author */}
            <div className="flex items-center gap-2">
              <img
                src={article.authorAvatar}
                alt={article.author}
                className="w-6 h-6 rounded-full object-cover border border-rose-100"
              />
              <span className="font-medium text-slate-600">{article.author}</span>
            </div>
            <span className="hidden sm:inline text-slate-200">|</span>
            {/* Publish date */}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              發佈於 {article.publishDate} {article.publishTime}
            </span>
            {/* Updated date */}
            {article.updatedDate && (
              <>
                <span className="hidden sm:inline text-slate-200">|</span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  更新於 {article.updatedDate} {article.updatedTime}
                </span>
              </>
            )}
            <span className="hidden sm:inline text-slate-200">|</span>
            {/* Views & read time */}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.views} 瀏覽
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime} 閱讀
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTENT AREA ═══════════ */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Main Content Column ── */}
          <article className="flex-1 min-w-0 max-w-[760px]">
            {/* ═══════════ 4. HERO IMAGE ═══════════ */}
            <figure className="mb-6">
              <div className="rounded-xl overflow-hidden shadow-sm">
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="w-full h-auto aspect-[16/9] object-cover"
                />
              </div>
              {article.heroCaption && (
                <figcaption className="text-[12px] text-slate-400 mt-2.5 text-center leading-relaxed px-4">
                  {article.heroCaption}
                </figcaption>
              )}
            </figure>

            {/* ═══════════ AD: Below Hero Image ═══════════ */}
            <InContentAd />

            {/* ═══════════ 7. ARTICLE TOOLS ═══════════ */}
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
              <ArticleToolbar onCopyLink={handleCopyLink} />
              <div className="hidden sm:flex items-center gap-3 text-[12px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  留言
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  讚好
                </span>
              </div>
            </div>

            {/* ═══════════ 5 & 6. ARTICLE BODY ═══════════ */}
            <ArticleBody blocks={article.body} />

            {/* ── Article footer ── */}
            <div className="mt-10 pt-6 border-t border-slate-100">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {['美容', '護膚', article.tag, article.category].map((tag) => (
                  <Link
                    key={tag}
                    href="/topics"
                    className="text-[14px] px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 font-medium hover:bg-rose-100 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Bottom tools (mobile) */}
              <div className="sm:hidden mb-6">
                <ArticleToolbar onCopyLink={handleCopyLink} />
              </div>

              {/* Back link */}
              <Link
                href="/topics"
                className="inline-flex items-center gap-1.5 text-[14px] text-rose-500 font-medium hover:text-rose-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                返回焦點話題
              </Link>
            </div>

            {/* ═══════════ 8. RELATED ARTICLES ═══════════ */}
            <section className="mt-10">
              {/* AD: Promotional Block Near Related Articles */}
              <div className="mb-8 relative rounded-2xl overflow-hidden bg-gradient-to-r from-rose-50 via-pink-50 to-fuchsia-50 border border-rose-100/50 p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[14px] text-rose-500 font-semibold mb-0.5">精選推薦</p>
                    <h4 className="text-sm font-bold text-slate-700">探索更多美容專題文章</h4>
                    <p className="text-[12px] text-slate-500 mt-0.5">由編輯團隊嚴選嘅深度分析同專家觀點</p>
                  </div>
                  <Link href="/topics" className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-100 hover:bg-rose-200 px-4 py-2 rounded-full transition-colors">
                    瀏覽更多
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <span className="absolute top-1.5 right-2.5 text-[7px] text-slate-300 uppercase tracking-wider">廣告</span>
              </div>

              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">
                <span
                  className="w-1 h-5 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }}
                />
                相關文章
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {RELATED_ARTICLES.filter((a) => a.slug !== slug)
                  .slice(0, 4)
                  .map((article, i) => (
                    <RelatedArticleCard key={i} article={article} />
                  ))}
              </div>
            </section>

            {/* ═══════════ 9. HOT TOPICS ═══════════ */}
            <section className="mt-10">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">
                <span
                  className="w-1 h-5 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }}
                />
                <Flame className="w-4 h-4 text-rose-500" />
                熱門焦點
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HOT_TOPICS.map((article, i) => (
                  <HotTopicCard key={i} article={article} />
                ))}
              </div>
            </section>

            {/* ── Extended reading (mobile only) ── */}
            <section className="mt-10 lg:hidden">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span
                  className="w-1 h-5 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }}
                />
                <TrendingUp className="w-4 h-4 text-rose-500" />
                延伸閱讀
              </h2>
              <div className="space-y-3">
                {RELATED_ARTICLES.map((article, i) => (
                  <HotTopicCard key={i} article={article} />
                ))}
              </div>
            </section>
          </article>

          {/* ═══════════ 10. DESKTOP SIDEBAR ═══════════ */}
          <aside className="hidden lg:block w-[300px] shrink-0 space-y-5">
            {/* 熱門文章 */}
            <SidebarSection title="熱門文章" icon={Flame}>
              <div className="space-y-3">
                {TRENDING_SIDEBAR.map((article, i) => (
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
                        <Eye className="w-2.5 h-2.5" />
                        {article.views} 瀏覽
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
                      <span className="text-[12px] text-rose-400 font-medium">
                        {pick.tag}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </SidebarSection>

            {/* 最新更新 */}
            <SidebarSection title="最新更新" icon={TrendingUp}>
              <div className="space-y-2.5">
                {RELATED_ARTICLES.slice(0, 4).map((article, i) => (
                  <Link
                    key={i}
                    href={`/topics/${article.slug}`}
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
                  <Link
                    key={tag}
                    href="/topics"
                    className="text-[14px] px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 font-medium hover:bg-rose-100 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </SidebarSection>

            {/* Sidebar Ad Unit */}
            <SidebarAdUnit variant="default" />
          </aside>
        </div>
      </div>

      {/* ═══════════ MOBILE SIDEBAR MODULES ═══════════ */}
      <div className="lg:hidden max-w-[1280px] mx-auto px-4 sm:px-6 pb-10 space-y-6">
        {/* 熱門標籤 */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span
              className="w-1 h-4 rounded-full"
              style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }}
            />
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
            <span
              className="w-1 h-4 rounded-full"
              style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }}
            />
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
            <span
              className="w-1 h-4 rounded-full"
              style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }}
            />
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            熱門文章
          </h3>
          <div className="space-y-2.5">
            {TRENDING_SIDEBAR.map((article, i) => (
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
                    <Eye className="w-2.5 h-2.5" />
                    {article.views} 瀏覽
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
