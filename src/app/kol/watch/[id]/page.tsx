'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PublicLayout from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import {
  Play, Pause, Volume2, VolumeX, Maximize,
  Clock, Eye, Calendar, ChevronRight, ArrowRight,
  User,
} from 'lucide-react';
import {
  ALL_KOL_VIDEOS,
  getRelatedVideos,
  getRelatedArticles,
  type KolVideo,
  type KolArticle,
} from '@/data/kol-videos';
import { getKolProfile } from '@/data/kol-profiles';

/* ═══════════════════════════════════════════════════════════════
   VIDEO PLAYER COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function VideoPlayer({ video }: { video: KolVideo }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse duration string to seconds
  const parseDuration = (dur: string) => {
    const parts = dur.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  };

  const totalDuration = parseDuration(video.duration);

  // Format time (seconds) to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Simulate progress when "playing"
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    setCurrentTime(Math.floor(percent * totalDuration));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      ref={videoContainerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={handlePlay}
    >
      {/* Video poster / thumbnail */}
      <img
        src={video.thumbnail}
        alt={video.title}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-60' : 'opacity-100'}`}
      />

      {/* Dark overlay when playing */}
      {isPlaying && (
        <div className="absolute inset-0 bg-black/20" />
      )}

      {/* Play button overlay (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-200">
            <Play className="w-8 h-8 text-pink-600 ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/progress hover:h-2.5 transition-all"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full relative transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={handlePlay}
              className="text-white hover:text-pink-300 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="text-white hover:text-pink-300 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-pink-500 h-1"
              />
            </div>

            {/* Time */}
            <span className="text-white/80 text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="text-white hover:text-pink-300 transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RELATED VIDEO CARD
   ═══════════════════════════════════════════════════════════════ */

function RelatedVideoCard({ video }: { video: KolVideo }) {
  return (
    <div className="group flex gap-3 p-2 rounded-lg hover:bg-pink-50/50 transition-colors">
      {/* Thumbnail — links to video playback */}
      <Link
        href={`/kol/watch/${video.id}`}
        className="relative w-40 min-w-[10rem] aspect-video rounded-lg overflow-hidden flex-shrink-0 block"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Duration badge */}
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[14px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" />
          {video.duration}
        </div>
        {/* Play hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col justify-between py-0.5 min-w-0">
        <Link href={`/kol/watch/${video.id}`}>
          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-pink-700 transition-colors">
            {video.title}
          </h4>
        </Link>
        <div className="flex items-center gap-2 mt-1.5">
          <Link href={`/kol/profile/${video.kolId}`} className="shrink-0">
            <img
              src={video.kolAvatar}
              alt={video.kolName}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-pink-100 hover:ring-pink-400 transition-all"
            />
          </Link>
          <Link href={`/kol/profile/${video.kolId}`}>
            <span className="text-xs text-gray-500 truncate hover:text-pink-600 transition-colors">{video.kolName}</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-gray-400 mt-1">
          <span className="flex items-center gap-0.5">
            <Eye className="w-3 h-3" />
            {video.views}
          </span>
          <span>•</span>
          <span>{video.date}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RELATED ARTICLE CARD
   ═══════════════════════════════════════════════════════════════ */

function RelatedArticleCard({ article }: { article: KolArticle }) {
  return (
    <Link
      href={`/topics/${article.id}`}
      className="group rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-gray-100"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={article.thumbnail}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2.5 left-2.5">
          <Badge className="bg-pink-500 text-white border-0 text-[14px] shadow-sm">
            {article.category}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2 group-hover:text-pink-600 transition-colors leading-snug">
          {article.title}
        </h4>
        <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {article.summary}
        </p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[14px] text-slate-400">
            <Calendar className="w-3 h-3" />
            {article.date}
          </span>
          <span className="flex items-center gap-1 text-xs text-pink-500 font-medium group-hover:gap-2 transition-all">
            閱讀更多 <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN WATCH PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function KolWatchPage() {
  const params = useParams();
  const videoId = params?.id as string;

  const video = ALL_KOL_VIDEOS.find((v) => v.id === videoId);

  if (!video) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">找不到影片</h1>
            <p className="text-gray-500 mb-6">此影片可能已被移除或連結無效。</p>
            <Link
              href="/kol"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-600 text-white rounded-full font-medium hover:bg-pink-700 transition-colors"
            >
              返回 KOL實錄
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const relatedVideos = getRelatedVideos(videoId, 8);
  const relatedArticles = getRelatedArticles(videoId, 3);
  const kolProfile = getKolProfile(video.kolId);

  return (
    <PublicLayout>
      <div
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
        style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
      >
        {/* Breadcrumb */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <nav className="flex items-center gap-1.5 text-sm text-gray-400">
            <Link href="/" className="hover:text-pink-500 transition-colors">首頁</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/kol" className="hover:text-pink-500 transition-colors">KOL實錄</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-600 truncate max-w-[200px]">{video.title}</span>
          </nav>
        </div>

        {/* Main content area */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ═══════════ LEFT: Video + Info ═══════════ */}
            <div className="flex-1 min-w-0">
              {/* Video Player */}
              <VideoPlayer video={video} />

              {/* Video Information */}
              <div className="mt-5">
                {/* Category badges */}
                <div className="flex items-center gap-2 mb-3">
                  {video.category.map((cat) => (
                    <Badge
                      key={cat}
                      className="bg-pink-100 text-pink-700 border-pink-200 text-xs font-medium"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-3">
                  {video.title}
                </h1>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {video.views} 次觀看
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {video.date}
                  </span>
                </div>

                {/* KOL identity */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Link href={`/kol/profile/${video.kolId}`} className="shrink-0">
                    <img
                      src={video.kolAvatar}
                      alt={video.kolName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-200 hover:ring-pink-400 transition-all cursor-pointer"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link
                      href={`/kol/profile/${video.kolId}`}
                      className="text-sm font-semibold text-gray-800 hover:text-pink-600 transition-colors"
                    >
                      {video.kolName}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {kolProfile ? kolProfile.focusArea : '美容KOL • 內容創作者'}
                    </p>
                  </div>
                  <Link
                    href={`/kol/profile/${video.kolId}`}
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    查看主頁
                  </Link>
                </div>

                {/* Description */}
                <div className="mt-5 p-4 bg-white rounded-xl border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">影片簡介</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </div>

              {/* ═══════════ RELATED ARTICLES ═══════════ */}
              <section className="mt-10 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span
                      className="w-1 h-5 rounded-full"
                      style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }}
                    />
                    延伸閱讀
                  </h2>
                  <Link
                    href="/topics"
                    className="text-sm text-pink-500 hover:text-pink-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    查看更多 <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {relatedArticles.map((article) => (
                    <RelatedArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            </div>

            {/* ═══════════ RIGHT: Related Videos Sidebar ═══════════ */}
            <aside className="w-full lg:w-[380px] lg:shrink-0">
              <div className="sticky top-[72px]">
                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span
                    className="w-1 h-4 rounded-full"
                    style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }}
                  />
                  相關影片
                </h3>
                <div className="space-y-1">
                  {relatedVideos.map((rv) => (
                    <RelatedVideoCard key={rv.id} video={rv} />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
