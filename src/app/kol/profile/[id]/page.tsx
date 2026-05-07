'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PublicLayout from '@/components/public/PublicLayout';
import { Play, Clock, Eye, Video, TrendingUp, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import { ALL_KOL_VIDEOS, getArticlesForKol, type KolVideo, type KolArticle } from '@/data/kol-videos';
import { getKolProfile, type KolProfile } from '@/data/kol-profiles';

/* ═══════════════════════════════════════════════════════════════
   KOL PROFILE PAGE — /kol/profile/[id]
   ═══════════════════════════════════════════════════════════════ */

export default function KolProfilePage() {
  const params = useParams();
  const kolId = params?.id as string;

  const profile = useMemo(() => getKolProfile(kolId), [kolId]);

  const kolVideos = useMemo(
    () => ALL_KOL_VIDEOS.filter((v) => v.kolId === kolId),
    [kolId]
  );

  const popularVideos = useMemo(
    () =>
      [...kolVideos].sort(
        (a, b) => parseFloat(b.views.replace('K', '')) - parseFloat(a.views.replace('K', ''))
      ),
    [kolVideos]
  );

  const relatedArticles = useMemo(() => {
    if (!profile) return [];
    return getArticlesForKol(profile.relatedTopics, 4);
  }, [profile]);

  // 404 fallback
  if (!profile) {
    return (
      <PublicLayout>
        <div
          className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white"
          style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
        >
          <div className="text-center">
            <p className="text-6xl mb-4">🔍</p>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">找不到此KOL</h1>
            <p className="text-gray-500 mb-6">此創作者頁面不存在或已移除。</p>
            <Link
              href="/kol"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-600 text-white rounded-full text-sm font-medium hover:bg-pink-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回 KOL實錄
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const recentVideoDate = kolVideos.length > 0 ? kolVideos[0].date : '—';

  return (
    <PublicLayout>
      <div
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
        style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
      >
        {/* ═══════════ BREADCRUMB ═══════════ */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <nav className="flex items-center gap-1.5 text-sm text-gray-400">
            <Link href="/" className="hover:text-pink-500 transition-colors">首頁</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/kol" className="hover:text-pink-500 transition-colors">KOL實錄</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-600 truncate max-w-[200px]">{profile.name}</span>
          </nav>
        </div>

        {/* ═══════════ PROFILE HEADER ═══════════ */}
        <section className="relative">
          {/* Cover Image */}
          <div className="h-48 sm:h-56 lg:h-64 overflow-hidden relative">
            <img
              src={profile.coverImage}
              alt={`${profile.name} cover`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>

          {/* Profile Info Overlay */}
          <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-7">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white shadow-lg -mt-12 sm:-mt-16 relative">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                        {profile.name}
                      </h1>
                      <p className="text-sm text-pink-600 font-medium mb-3">
                        {profile.focusArea}
                      </p>
                    </div>
                    {/* Back link */}
                    <Link
                      href="/kol"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors self-start"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      返回 KOL實錄
                    </Link>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-3xl">
                    {profile.intro}
                  </p>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {profile.expertise.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 sm:gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center">
                        <Video className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{kolVideos.length}</p>
                        <p className="text-[12px] text-gray-500">發佈影片</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {popularVideos.filter((v) => parseFloat(v.views.replace('K', '')) >= 50).length}
                        </p>
                        <p className="text-[12px] text-gray-500">熱門內容</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{recentVideoDate}</p>
                        <p className="text-[12px] text-gray-500">近期更新</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ POPULAR VIDEOS ═══════════ */}
        {popularVideos.length > 0 && (
          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                熱門影片
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {popularVideos.slice(0, 4).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}

        {/* ═══════════ ALL VIDEOS ═══════════ */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-pink-600" />
              全部影片
            </h2>
            <span className="text-sm text-gray-500">
              共 <span className="font-semibold text-gray-800">{kolVideos.length}</span> 條影片
            </span>
          </div>

          {/* Categorized groups */}
          {(() => {
            const categoryMap = new Map<string, KolVideo[]>();
            kolVideos.forEach((v) => {
              v.category.forEach((cat) => {
                if (!categoryMap.has(cat)) categoryMap.set(cat, []);
                categoryMap.get(cat)!.push(v);
              });
            });

            const categories = Array.from(categoryMap.entries());

            if (categories.length <= 1) {
              // Simple grid if only one category
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {kolVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              );
            }

            return (
              <div className="space-y-8">
                {categories.map(([category, videos]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {videos.map((video) => (
                        <VideoCard key={`${category}-${video.id}`} video={video} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {kolVideos.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">此KOL暫未發佈影片</p>
            </div>
          )}
        </section>

        {/* ═══════════ RELATED ARTICLES ═══════════ */}
        {relatedArticles.length > 0 && (
          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="border-t border-gray-100 pt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                📖 延伸閱讀
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {relatedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIDEO CARD
   ═══════════════════════════════════════════════════════════════ */

function VideoCard({ video }: { video: KolVideo }) {
  return (
    <Link
      href={`/kol/watch/${video.id}`}
      className="group cursor-pointer rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-pink-100 transition-all duration-300 block"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="w-11 h-11 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
            <Play className="w-4.5 h-4.5 text-pink-600 ml-0.5" fill="currentColor" />
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {video.duration}
        </div>
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 backdrop-blur-sm text-[14px] font-medium text-gray-700 px-2 py-0.5 rounded-full">
            {video.category[0]}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-pink-700 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-3 text-[12px] text-gray-400">
          <span className="flex items-center gap-0.5">
            <Eye className="w-3 h-3" />
            {video.views}
          </span>
          <span>•</span>
          <span>{video.date}</span>
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ARTICLE CARD
   ═══════════════════════════════════════════════════════════════ */

function ArticleCard({ article }: { article: KolArticle }) {
  return (
    <Link
      href={`/topics/${article.id}`}
      className="group cursor-pointer rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-100 transition-all duration-300 block"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={article.thumbnail}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-pink-600 text-white text-[14px] font-medium px-2 py-0.5 rounded-full">
            {article.category}
          </span>
        </div>
      </div>
      <div className="p-3.5">
        <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5 group-hover:text-pink-700 transition-colors">
          {article.title}
        </h4>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {article.summary}
        </p>
        <div className="mt-2 flex items-center text-[12px] text-pink-600 font-medium">
          閱讀更多
          <ChevronRight className="w-3 h-3 ml-0.5" />
        </div>
      </div>
    </Link>
  );
}
