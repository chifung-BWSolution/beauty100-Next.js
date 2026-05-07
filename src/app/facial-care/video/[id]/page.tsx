import { ALL_VIDEOS } from '@/data/facial-care-videos';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Eye, Sparkles, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Types from page.tsx to ensure compatibility
interface Article {
  title: string;
  description: string;
  image: string;
  tag: string;
  category: string[];
  date: string;
  views: string;
  featured?: boolean;
}

// Temporary data mock to use the same logic as the main page.
// In a real application, we would probably extract this to a shared data file.
const RELEVANT_ARTICLES: Article[] = [
  {
    title: '深層清潔面部護理：你真係做啱咗嗎？專家教你正確步驟',
    description: '深層清潔係面部護理嘅基本，但好多人其實做錯咗！專家教你正確嘅潔面方法，從卸妝到二次清潔，每個步驟都唔能夠忽略。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    tag: '基礎護理',
    category: ['熱門護膚'],
    date: '2025年4月2日',
    views: '22.3K',
    featured: true,
  },
  {
    title: '2025年必買護膚品清單：皮膚科醫生推薦嘅10款產品',
    description: '皮膚科醫生親自揀選嘅護膚品清單，從平價到高端，每款都經得起專業考驗。',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    tag: '產品推薦',
    category: ['熱門護膚'],
    date: '2025年3月30日',
    views: '19.8K',
    featured: true,
  },
  {
    title: 'HIFU緊膚療程全攻略：效果、價錢、注意事項一文睇晒',
    description: 'HIFU係近年最受歡迎嘅面部緊膚療程，從原理到術後護理，全面解構你想知嘅所有資訊。',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80',
    tag: '醫美療程',
    category: ['療程解析'],
    date: '2025年4月1日',
    views: '20.5K',
  }
];

function ArticleGridCard({ article }: { article: Article }) {
  return (
    <Link
      href="/topics/celebrity-anti-aging-secrets"
      className="group rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-slate-100/80 block"
    >
      <div className="relative h-44 overflow-hidden">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <Badge className="bg-teal-500 text-white border-0 text-[14px] shadow-sm">{article.tag}</Badge>
          {article.featured && (
            <Badge className="bg-amber-400 text-amber-900 border-0 text-[12px] font-bold flex items-center gap-0.5 shadow-sm">
              <Sparkles className="w-2 h-2" />精選
            </Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2 group-hover:text-teal-600 transition-colors leading-snug">
          {article.title}
        </h3>
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {article.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[14px] text-slate-400">
            <Clock className="w-3 h-3" />{article.date}
          </span>
          <span className="flex items-center gap-1 text-sm text-teal-500 font-medium group-hover:gap-2 transition-all">
            閱讀更多 <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

interface VideoPageProps {
  params: {
    id: string;
  };
}

export default function VideoPage({ params }: VideoPageProps) {
  const video = ALL_VIDEOS.find((v) => v.id === params.id);

  if (!video) {
    notFound();
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
        <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4">
          <span>{video.date}</span>
          <span>{video.views} 次觀看</span>
          <span className="bg-primary/10 text-primary px-2 py-1 rounded">
            {video.tag}
          </span>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-8">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30 transition">
            <svg
              className="w-8 h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mb-4">影片簡介</h2>
        <p className="text-gray-700 leading-relaxed">{video.description}</p>
        
        <div className="mt-8 pt-8 border-t mb-12">
          <h3 className="text-lg font-medium mb-3">分類</h3>
          <div className="flex gap-2">
            {video.category.map((cat, i) => (
              <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── More Articles Section ── */}
      <section className="mt-12 pt-8 border-t border-gray-100">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">
          <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #5eead4, #0d9488)' }} />
          更多面部護理文章
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RELEVANT_ARTICLES.map((article, i) => (
            <ArticleGridCard key={`more-article-${i}`} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}
