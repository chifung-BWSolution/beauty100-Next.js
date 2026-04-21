'use client';

import React from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Search, ArrowRight, Star, Heart,
  Zap, Flower2, Palette, Apple, Shield, Users,
} from 'lucide-react';

const CATEGORIES = [
  { label: '面部護理', href: '/facial-care', icon: Sparkles, color: 'from-rose-400 to-pink-500', description: '專業面部護理知識' },
  { label: '回復青春', href: '/anti-aging', icon: Zap, color: 'from-purple-400 to-violet-500', description: '逆齡抗衰老秘訣' },
  { label: '身材管理', href: '/body-shaping', icon: Heart, color: 'from-red-400 to-rose-500', description: '塑形纖體方案' },
  { label: '化妝護膚', href: '/skincare', icon: Palette, color: 'from-fuchsia-400 to-pink-500', description: '化妝護膚技巧' },
  { label: '飲食健康', href: '/healthy-diet', icon: Apple, color: 'from-green-400 to-emerald-500', description: '健康飲食指南' },
  { label: '身體保養', href: '/body-care', icon: Shield, color: 'from-blue-400 to-cyan-500', description: '全身保養貼士' },
];

const FEATURED_ARTICLES = [
  {
    title: '2025年最受歡迎的面部護理療程',
    description: '盤點今年最受香港女士歡迎的面部護理療程，從水光針到HIFU，一文睇晒。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    tag: '焦點話題',
    href: '/topics',
  },
  {
    title: 'KOL親身實測：膠原蛋白飲品真係有用？',
    description: '多位美容KOL親身實測市面熱賣膠原蛋白飲品，真實效果全公開。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: 'KOL實錄',
    href: '/kol',
  },
  {
    title: '明星護膚秘密：零毛孔底妝秘訣',
    description: '揭開娛樂圈女星的護膚秘密，教你如何打造零毛孔無瑕底妝。',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    tag: '娛樂圈',
    href: '/entertainment',
  },
];

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-rose-100 text-rose-600 border-0 mb-4 text-xs">
                ✨ 香港美容資訊平台
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 leading-tight mb-4">
                發現你的
                <span className="bg-gradient-to-r from-rose-500 to-fuchsia-500 bg-clip-text text-transparent"> 美麗秘密</span>
              </h1>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                搜羅全港優質美容院，提供最新美容資訊、專業知識及真實用家分享，讓你輕鬆變美。
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/explore-salons">
                  <Button
                    className="h-12 px-6 rounded-xl text-base font-medium shadow-lg shadow-rose-500/25"
                    style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    搵美容院
                  </Button>
                </Link>
                <Link href="/topics">
                  <Button variant="outline" className="h-12 px-6 rounded-xl text-base font-medium border-rose-200 text-rose-600 hover:bg-rose-50">
                    瀏覽焦點話題
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-rose-500/10">
                <img
                  src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80"
                  alt="Beauty"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-rose-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                    <Star className="w-5 h-5 text-rose-500 fill-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">500+</p>
                    <p className="text-[10px] text-slate-400">優質美容院</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-rose-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-fuchsia-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-fuchsia-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">10K+</p>
                    <p className="text-[10px] text-slate-400">用戶瀏覽</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">美容知識專欄</h2>
          <p className="text-sm text-slate-400">深入了解各類美容知識，從護膚到健康飲食一應俱全</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group rounded-2xl p-5 text-center hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.8)' }}
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.color} shadow-md`}>
                <cat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1 group-hover:text-rose-600 transition-colors">{cat.label}</h3>
              <p className="text-[10px] text-slate-400">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">精選文章</h2>
            <p className="text-sm text-slate-400">最新美容話題及專家分享</p>
          </div>
          <Link href="/topics" className="text-sm font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1">
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_ARTICLES.map((article, i) => (
            <Link
              key={i}
              href={article.href}
              className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.8)' }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-rose-500 text-white border-0 text-[10px]">{article.tag}</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-800 text-base mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {article.description}
                </p>
                <span className="flex items-center gap-1 text-xs text-rose-500 font-medium group-hover:gap-2 transition-all">
                  閱讀更多 <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="rounded-3xl p-8 sm:p-12 text-center overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">你係美容院老闆？</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              免費註冊成為商戶，喺平台展示你嘅美容院，吸引更多客人！
            </p>
            <Link href="/merchant-signup">
              <Button className="h-12 px-8 rounded-xl text-base font-medium bg-white text-rose-600 hover:bg-white/90 shadow-lg">
                免費註冊商戶
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
