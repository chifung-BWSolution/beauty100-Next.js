'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

// Cover styles for salons without images - using real images with overlay
const COVER_STYLES = [
  {
    bgImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
    overlayFrom: 'rgba(6,78,59,0.7)',
    overlayTo: 'rgba(13,148,136,0.5)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80',
    overlayFrom: 'rgba(251,113,133,0.6)',
    overlayTo: 'rgba(249,168,212,0.4)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
    overlayFrom: 'rgba(41,37,36,0.6)',
    overlayTo: 'rgba(146,64,14,0.4)',
    textColor: '#f5f5f4',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    overlayFrom: 'rgba(3,105,161,0.6)',
    overlayTo: 'rgba(6,182,212,0.4)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    overlayFrom: 'rgba(88,28,135,0.65)',
    overlayTo: 'rgba(147,51,234,0.4)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80',
    overlayFrom: 'rgba(30,58,138,0.65)',
    overlayTo: 'rgba(59,130,246,0.4)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80',
    overlayFrom: 'rgba(157,23,77,0.6)',
    overlayTo: 'rgba(236,72,153,0.4)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&q=80',
    overlayFrom: 'rgba(20,83,45,0.65)',
    overlayTo: 'rgba(34,197,94,0.35)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80',
    overlayFrom: 'rgba(120,53,15,0.65)',
    overlayTo: 'rgba(217,119,6,0.4)',
    textColor: '#fef3c7',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    overlayFrom: 'rgba(159,18,57,0.6)',
    overlayTo: 'rgba(244,63,94,0.35)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
    overlayFrom: 'rgba(17,94,89,0.65)',
    overlayTo: 'rgba(45,212,191,0.35)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    overlayFrom: 'rgba(55,48,163,0.65)',
    overlayTo: 'rgba(99,102,241,0.4)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800&q=80',
    overlayFrom: 'rgba(9,9,11,0.5)',
    overlayTo: 'rgba(63,63,70,0.4)',
    textColor: '#fafafa',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    overlayFrom: 'rgba(21,94,117,0.65)',
    overlayTo: 'rgba(34,211,238,0.35)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    overlayFrom: 'rgba(113,63,18,0.65)',
    overlayTo: 'rgba(234,179,8,0.35)',
    textColor: '#fef9c3',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
    overlayFrom: 'rgba(76,29,149,0.6)',
    overlayTo: 'rgba(168,85,247,0.35)',
    textColor: '#ffffff',
  },
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
                    <div className="relative w-full h-full">
                      <img
                        src={coverStyle.bgImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${coverStyle.overlayFrom}, ${coverStyle.overlayTo})`,
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                        <p className="text-[9px] uppercase tracking-[0.25em] opacity-70 mb-0.5" style={{ color: coverStyle.textColor }}>
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
