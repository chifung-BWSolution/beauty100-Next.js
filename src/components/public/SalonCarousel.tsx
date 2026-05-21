'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

// Cover styles for salons without images
const COVER_STYLES = [
  { bgColor: 'from-emerald-700 to-teal-500', textColor: '#ffffff' },
  { bgColor: 'from-rose-400 to-pink-300', textColor: '#ffffff' },
  { bgColor: 'from-stone-700 to-amber-700', textColor: '#f5f5f4' },
  { bgColor: 'from-sky-700 to-cyan-500', textColor: '#ffffff' },
  { bgColor: 'from-purple-800 to-violet-500', textColor: '#ffffff' },
  { bgColor: 'from-indigo-800 to-blue-500', textColor: '#ffffff' },
  { bgColor: 'from-pink-800 to-pink-400', textColor: '#ffffff' },
  { bgColor: 'from-green-800 to-green-500', textColor: '#ffffff' },
  { bgColor: 'from-amber-800 to-amber-500', textColor: '#fef3c7' },
  { bgColor: 'from-rose-800 to-red-400', textColor: '#ffffff' },
  { bgColor: 'from-teal-800 to-teal-400', textColor: '#ffffff' },
  { bgColor: 'from-indigo-700 to-indigo-400', textColor: '#ffffff' },
  { bgColor: 'from-zinc-800 to-zinc-500', textColor: '#fafafa' },
  { bgColor: 'from-cyan-800 to-cyan-400', textColor: '#ffffff' },
  { bgColor: 'from-yellow-700 to-yellow-400', textColor: '#fef9c3' },
  { bgColor: 'from-purple-700 to-purple-400', textColor: '#ffffff' },
];

function getCoverStyleIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % COVER_STYLES.length;
}

export interface FeaturedSalon {
  id: string;
  name: string;
  handle?: string;
  area: string;
  image: string | null;
  tags: string[];
}

export function SalonCarousel({ salons }: { salons: FeaturedSalon[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const totalSlides = salons.length;

  const getVisibleCount = useCallback(() => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }, []);

  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    setVisibleCount(getVisibleCount());
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getVisibleCount]);

  const maxIndex = Math.max(0, totalSlides - visibleCount);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);
  }, [maxIndex]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    stopAutoplay();
    setTimeout(() => startAutoplay(), 5000);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, stopAutoplay, startAutoplay]);

  const goLeft = useCallback(() => {
    goTo(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  }, [currentIndex, maxIndex, goTo]);

  const goRight = useCallback(() => {
    goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  }, [currentIndex, maxIndex, goTo]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [trackOffset, setTrackOffset] = useState(0);
  const containerWidthRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    containerWidthRef.current = el.offsetWidth;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidthRef.current = entry.contentRect.width;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const containerWidth = containerWidthRef.current;
    if (!containerWidth) return;
    const gapPx = 16;
    const cardWidth = (containerWidth - gapPx * (visibleCount - 1)) / visibleCount;
    setTrackOffset(currentIndex * (cardWidth + gapPx));
  }, [currentIndex, visibleCount]);

  const gapPx = 16;

  return (
    <div className="relative group/carousel">
      {/* Left arrow */}
      <button
        onClick={goLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-slate-200/60 flex items-center justify-center text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:shadow-xl transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
        aria-label="上一個"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Right arrow */}
      <button
        onClick={goRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-slate-200/60 flex items-center justify-center text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:shadow-xl transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
        aria-label="下一個"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Carousel track */}
      <div className="overflow-hidden rounded-xl" ref={containerRef}>
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            gap: `${gapPx}px`,
            transform: `translateX(-${trackOffset}px)`,
          }}
        >
          {salons.map((salon, i) => (
            <Link
              key={salon.id || i}
              href={salon.id ? `/salon/${salon.handle || salon.id}` : '/explore-salons'}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100/80 shrink-0"
              style={{ width: `calc((100% - ${gapPx * (visibleCount - 1)}px) / ${visibleCount})` }}
            >
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-rose-100 to-pink-50">
                {salon.image ? (
                  <Image src={salon.image} alt={salon.name} fill loading="lazy" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (() => {
                  const styleIdx = getCoverStyleIndex(salon.id || salon.name);
                  const coverStyle = COVER_STYLES[styleIdx];
                  return (
                    <div className={`relative w-full h-full bg-gradient-to-br ${coverStyle.bgColor}`}>
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                        <p className="text-[9px] uppercase tracking-[0.2em] opacity-70 mb-0.5" style={{ color: coverStyle.textColor }}>
                          Beauty Salon
                        </p>
                        <h3 className="text-sm font-bold text-center leading-tight drop-shadow-md line-clamp-2" style={{ color: coverStyle.textColor }}>
                          {salon.name}
                        </h3>
                        <div className="mt-1.5 w-8 h-0.5 opacity-60 rounded" style={{ backgroundColor: coverStyle.textColor }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="p-3.5">
                <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-rose-600 transition-colors">{salon.name}</h3>
                {salon.area && (
                  <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{salon.area}</span>
                  </div>
                )}
                {salon.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {salon.tags.map((tag) => (
                      <span key={tag} className="text-[14px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 font-medium">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-5 h-1.5 bg-rose-500'
                : 'w-1.5 h-1.5 bg-slate-300 hover:bg-rose-300'
            }`}
            aria-label={`前往第 ${i + 1} 頁`}
          />
        ))}
      </div>
    </div>
  );
}
