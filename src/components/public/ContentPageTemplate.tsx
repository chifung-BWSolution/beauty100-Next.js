'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Article {
  title: string;
  description: string;
  image: string;
  tag?: string;
  date?: string;
  href?: string;
}

interface ContentPageProps {
  title: string;
  subtitle: string;
  heroImage: string;
  heroDescription: string;
  articles: Article[];
  accentColor?: string;
}

export default function ContentPageTemplate({
  title,
  subtitle,
  heroImage,
  heroDescription,
  articles,
  accentColor = 'rose',
}: ContentPageProps) {
  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={heroImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
          <Badge className={`bg-${accentColor}-500 text-white border-0 mb-3`}>
            {subtitle}
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl">{heroDescription}</p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <div
              key={i}
              className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.8)' }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {article.tag && (
                  <div className="absolute top-3 left-3">
                    <Badge className={`bg-${accentColor}-500 text-white border-0 text-[10px]`}>
                      {article.tag}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-800 text-base mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {article.description}
                </p>
                <div className="flex items-center justify-between">
                  {article.date && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {article.date}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-rose-500 font-medium group-hover:gap-2 transition-all">
                    閱讀更多 <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon placeholder */}
        {articles.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-rose-50">
              <Clock className="w-8 h-8 text-rose-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">內容準備中</h3>
            <p className="text-sm text-slate-400">精彩內容即將推出，敬請期待！</p>
          </div>
        )}
      </div>
    </div>
  );
}
