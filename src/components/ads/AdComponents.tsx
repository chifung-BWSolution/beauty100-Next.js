'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star, Gift, Zap } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   AD COMPONENTS — Reusable ad placements for the website
   ═══════════════════════════════════════════════════════════════ */

/**
 * HorizontalBannerAd — Full-width banner ad
 * Used below hero sections and between content sections
 */
export function HorizontalBannerAd({
  variant = 'default',
}: {
  variant?: 'default' | 'slim' | 'gradient';
}) {
  if (variant === 'slim') {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-amber-100/60 px-5 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
                限時優惠：首次預約享8折
              </p>
              <p className="text-[14px] text-slate-400 hidden sm:block">
                精選美容院 · 人氣療程推薦
              </p>
            </div>
          </div>
          <Link
            href="/explore-salons"
            className="shrink-0 inline-flex items-center gap-1 text-[14px] font-medium text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-full transition-colors"
          >
            立即查看
            <ArrowRight className="w-3 h-3" />
          </Link>
          <span className="absolute top-1 right-2 text-[12px] text-slate-300 uppercase tracking-wider">
            廣告
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border border-purple-100/50 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-sm">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  新會員獨家禮遇
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  註冊即送價值 $200 美容療程優惠券 · 限時領取
                </p>
              </div>
            </div>
            <Link
              href="/merchant-signup"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              免費領取
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <span className="absolute top-2 right-3 text-[12px] text-slate-300 uppercase tracking-wider">
            廣告
          </span>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="relative rounded-2xl overflow-hidden border border-rose-100/50 p-5 sm:p-6" style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                探索人氣美容療程
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                嚴選全港優質美容院 · 真實用家評價 · 獨家優惠
              </p>
            </div>
          </div>
          <Link
            href="/explore-salons"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            立即瀏覽
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <span className="absolute top-2 right-3 text-[12px] text-slate-300 uppercase tracking-wider">
          廣告
        </span>
      </div>
    </div>
  );
}

/**
 * NativePromoCard — Looks like an article card but is a promotional placement
 * Blends in with article feeds
 */
export function NativePromoCard({
  variant = 'default',
}: {
  variant?: 'default' | 'salon' | 'treatment';
}) {
  const PROMO_DATA = {
    default: {
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
      tag: '推薦',
      title: '你嘅美容院仲未上線？免費加入平台曝光',
      description: '超過500間美容院已加入，提升曝光率，吸引更多新客人。',
      href: '/merchant-signup',
      cta: '了解更多',
    },
    salon: {
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
      tag: '精選商戶',
      title: '人氣美容院推薦：本月精選優惠',
      description: '多間人氣商戶推出獨家體驗優惠，把握機會試做人氣療程。',
      href: '/explore-salons',
      cta: '查看優惠',
    },
    treatment: {
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80',
      tag: '熱門療程',
      title: '2025年最受歡迎療程：HIFU瘦面體驗',
      description: '非入侵性拉提緊緻，效果持久自然，了解更多療程詳情。',
      href: '/facial-care',
      cta: '了解療程',
    },
  };

  const promo = PROMO_DATA[variant];

  return (
    <div className="relative group rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-amber-100/80">
      <Link href={promo.href} className="block">
        <div className="relative h-44 overflow-hidden">
          <img
            src={promo.image}
            alt={promo.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[14px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
              <Zap className="w-2.5 h-2.5" />
              {promo.tag}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">
            {promo.title}
          </h3>
          <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {promo.description}
          </p>
          <span className="inline-flex items-center gap-1 text-[14px] font-medium text-amber-600 hover:text-amber-700">
            {promo.cta}
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>
      <span className="absolute top-2.5 right-2.5 text-[12px] text-white/70 uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
        廣告
      </span>
    </div>
  );
}

/**
 * PromotionalBlock — CTA-style promotional block
 * Used near the bottom of pages or between sections
 */
export function PromotionalBlock({
  variant = 'default',
}: {
  variant?: 'default' | 'kol' | 'merchant';
}) {
  if (variant === 'kol') {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 border border-teal-100/50 p-6 sm:p-8">
          <div className="text-center max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 text-[14px] font-semibold px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3 h-3" />
              品牌合作
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
              成為品牌合作夥伴
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
              與我們合作推廣你的美容品牌或療程，觸達精準目標受眾。
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              聯絡我們
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <span className="absolute top-2 right-3 text-[12px] text-slate-300 uppercase tracking-wider">
            廣告
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'merchant') {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #fcd34d 100%)' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-900">
                美容院商戶招募中
              </h3>
              <p className="text-xs text-amber-700/70 mt-1">
                免費註冊展示你的美容院，吸引更多目標客人
              </p>
            </div>
            <Link
              href="/merchant-signup"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              免費註冊
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <span className="absolute top-2 right-3 text-[12px] text-amber-600/40 uppercase tracking-wider">
            廣告
          </span>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 p-6 sm:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 left-10 w-24 h-24 bg-rose-500 rounded-full blur-3xl" />
          <div className="absolute bottom-5 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-lg mx-auto">
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">
            下載 Beauty 100 App
          </h3>
          <p className="text-xs text-slate-300 mb-5 leading-relaxed">
            隨時隨地搜索美容院、查看真實評價、預約療程，美容資訊一手掌握。
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="#"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 px-5 py-2.5 rounded-full shadow-sm transition-all"
            >
              App Store
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white border border-white/30 hover:bg-white/10 px-5 py-2.5 rounded-full transition-all"
            >
              Google Play
            </Link>
          </div>
        </div>
        <span className="absolute top-2 right-3 text-[12px] text-white/30 uppercase tracking-wider">
          廣告
        </span>
      </div>
    </div>
  );
}

/**
 * SidebarAdUnit — A compact ad unit for sidebars
 */
export function SidebarAdUnit({
  variant = 'default',
}: {
  variant?: 'default' | 'salon' | 'app';
}) {
  if (variant === 'salon') {
    return (
      <div className="relative rounded-xl overflow-hidden border border-amber-100/60 bg-gradient-to-b from-amber-50 to-orange-50 p-4">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&q=80"
          alt="推薦美容院"
          className="w-full h-24 object-cover rounded-lg mb-3"
          loading="lazy"
        />
        <h4 className="text-xs font-bold text-slate-700 mb-1">本月推薦美容院</h4>
        <p className="text-[14px] text-slate-500 mb-3 leading-relaxed">
          由編輯嚴選嘅優質商戶，為你提供獨家體驗優惠。
        </p>
        <Link
          href="/explore-salons"
          className="inline-flex items-center gap-1 text-[14px] font-semibold text-amber-700 hover:text-amber-800 transition-colors"
        >
          查看推薦
          <ArrowRight className="w-2.5 h-2.5" />
        </Link>
        <span className="absolute top-1.5 right-2 text-[7px] text-slate-300 uppercase tracking-wider">
          廣告
        </span>
      </div>
    );
  }

  if (variant === 'app') {
    return (
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 p-4 text-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h4 className="text-xs font-bold text-white mb-1">下載 App</h4>
        <p className="text-[14px] text-slate-400 mb-3 leading-relaxed">
          隨時搜索、預約、查看評價
        </p>
        <Link
          href="#"
          className="inline-flex items-center gap-1 text-[14px] font-semibold text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-full transition-colors"
        >
          免費下載
          <ArrowRight className="w-2.5 h-2.5" />
        </Link>
        <span className="absolute top-1.5 right-2 text-[7px] text-white/30 uppercase tracking-wider">
          廣告
        </span>
      </div>
    );
  }

  // Default variant
  return (
    <div className="relative rounded-xl overflow-hidden border border-rose-100/60 bg-gradient-to-b from-rose-50 to-pink-50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shrink-0">
          <Gift className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[14px] font-semibold text-rose-600">限時優惠</span>
      </div>
      <h4 className="text-xs font-bold text-slate-700 mb-1">新用戶專享禮遇</h4>
      <p className="text-[14px] text-slate-500 mb-3 leading-relaxed">
        首次登記即享美容療程折扣優惠
      </p>
      <Link
        href="/merchant-signup"
        className="inline-flex items-center gap-1 text-[14px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
      >
        立即領取
        <ArrowRight className="w-2.5 h-2.5" />
      </Link>
      <span className="absolute top-1.5 right-2 text-[7px] text-slate-300 uppercase tracking-wider">
        廣告
      </span>
    </div>
  );
}

/**
 * InContentAd — An ad placed within article body content
 * Designed to be non-intrusive between paragraphs
 */
export function InContentAd() {
  return (
    <div className="my-8 py-5 px-5 rounded-xl border border-amber-100/60 bg-gradient-to-r from-amber-50/50 to-orange-50/50 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <img
          src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80"
          alt="推薦療程"
          className="w-full sm:w-24 h-20 sm:h-16 object-cover rounded-lg shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] text-amber-600 font-semibold mb-0.5">推薦療程</p>
          <h4 className="text-sm font-bold text-slate-700 mb-1 line-clamp-1">
            HIFU 緊膚拉提療程 — 本月獨家優惠
          </h4>
          <p className="text-[12px] text-slate-500 line-clamp-1">
            非入侵性提升面部輪廓，首次體驗享特別價格
          </p>
        </div>
        <Link
          href="/explore-salons"
          className="shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-full transition-colors"
        >
          了解更多
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <span className="absolute top-1.5 right-2.5 text-[7px] text-slate-300 uppercase tracking-wider">
        廣告
      </span>
    </div>
  );
}

/**
 * BottomDualAd — Two side-by-side promotional ad blocks
 * Used at the bottom of the homepage before the merchant CTA
 */
export function BottomDualAd() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Ad: Download App */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:p-8 flex flex-col justify-between">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-6 w-20 h-20 bg-rose-500 rounded-full blur-3xl" />
            <div className="absolute bottom-4 right-6 w-24 h-24 bg-purple-500 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3">
              <Zap className="w-3 h-3" />
              推薦下載
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              下載 Beauty 100 App
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              隨時隨地搜索美容院、查看真實評價、預約療程，美容資訊一手掌握。
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 px-4 py-2 rounded-full shadow-sm transition-all"
              >
                App Store
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white border border-white/30 hover:bg-white/10 px-4 py-2 rounded-full transition-all"
              >
                Google Play
              </Link>
            </div>
          </div>
          <span className="absolute top-2 right-3 text-[10px] text-white/30 uppercase tracking-wider">
            廣告
          </span>
        </div>

        {/* Right Ad: Brand Partnership */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 border border-teal-100/50 p-6 sm:p-8 flex flex-col justify-between">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-700 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3">
              <Sparkles className="w-3 h-3" />
              品牌合作
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">
              成為品牌合作夥伴
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              與我們合作推廣你的美容品牌或療程，觸達精準目標受眾，提升品牌知名度。
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              聯絡我們
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <span className="absolute top-2 right-3 text-[10px] text-slate-300 uppercase tracking-wider">
            廣告
          </span>
        </div>
      </div>
    </div>
  );
}
