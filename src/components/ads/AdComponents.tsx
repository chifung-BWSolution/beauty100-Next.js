'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

const ATTITUDE = {
  name: 'Attitude Beauty',
  href: '/salon/attitude-beauty',
  website: 'https://www.attitude-beauty.com/',
  whatsapp: 'https://wa.me/85259335046',
  cover: '/images/salons/attitude-beauty/01-logo-wall.jpg',
  treatment: '/images/salons/attitude-beauty/03-treatment-room.jpg',
  glow: '/images/salons/attitude-beauty/01-logo-wall.jpg',
  about: '/images/salons/attitude-beauty/02-consultation.jpg',
  interior: '/images/salons/attitude-beauty/06-lounge.jpg',
  result: '/images/salons/attitude-beauty/04-reception.jpg',
};

/* ═══════════════════════════════════════════════════════════════
   AD COMPONENTS — Attitude Beauty placements
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
        <div className="relative rounded-xl overflow-hidden bg-[#faf6f1] border border-[#e8dfd4] px-5 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white">
              <img src={ATTITUDE.cover} alt="" className="w-full h-full object-cover object-top" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
                Attitude Beauty 新客首試 $480（原價 $1,380）
              </p>
              <p className="text-[14px] text-slate-400 hidden sm:block">
                尖沙咀 · 明碼實價 · 無硬銷 · 做完即走
              </p>
            </div>
          </div>
          <Link
            href={ATTITUDE.href}
            className="shrink-0 inline-flex items-center gap-1 text-[14px] font-medium text-[#8a6a4a] hover:text-[#6f5338] bg-[#efe4d6] hover:bg-[#e6d7c4] px-3 py-1.5 rounded-full transition-colors"
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
        <div className="relative rounded-2xl overflow-hidden bg-[#f7f1ea] border border-[#e8dfd4] p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm bg-white">
                <img src={ATTITUDE.cover} alt="" className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  Attitude Beauty 新客禮遇
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  首試 $480 · 單次明碼實價 · 尖沙咀加連威老道
                </p>
              </div>
            </div>
            <Link
              href={ATTITUDE.href}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-[#c4a484] hover:bg-[#b3916e] px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              了解詳情
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

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="relative rounded-2xl overflow-hidden border border-[#e8dfd4] p-5 sm:p-6" style={{ background: 'linear-gradient(135deg, #faf6f1 0%, #f3ece3 50%, #efe4d6 100%)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-sm bg-white">
              <img src={ATTITUDE.treatment} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Attitude Beauty｜尖沙咀專業肌膚管理
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                暗瘡 · 眼周 · 鬆弛 · 色斑｜明碼實價、做完即走
              </p>
            </div>
          </div>
          <Link
            href={ATTITUDE.href}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-[#c4a484] hover:bg-[#b3916e] px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            查看美容院
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
      image: ATTITUDE.cover,
      tag: '精選商戶',
      title: 'Attitude Beauty：明碼實價，做完即走',
      description: '尖沙咀專業肌膚管理。單次收費、無硬銷，暗瘡、眼周、鬆弛、色斑都有對應方案。',
      href: ATTITUDE.href,
      cta: '了解更多',
    },
    salon: {
      image: ATTITUDE.interior,
      tag: '精選商戶',
      title: '人氣推薦：Attitude Beauty 尖沙咀店',
      description: '新客首試 $480。原廠認證儀器，經驗美容師團隊，療程週期動態追蹤。',
      href: ATTITUDE.href,
      cta: '查看優惠',
    },
    treatment: {
      image: ATTITUDE.treatment,
      tag: '熱門療程',
      title: 'Attitude Beauty 皇牌：水光嫩膚 × 緊緻提拉',
      description: '玻璃肌水光 Facial、心心面提拉、激光去斑，價錢事先講清楚。',
      href: ATTITUDE.href,
      cta: '了解療程',
    },
  };

  const promo = PROMO_DATA[variant];

  return (
    <div className="relative group rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-[#e8dfd4]">
      <Link href={promo.href} className="block">
        <div className="relative h-44 overflow-hidden bg-[#f3ece3]">
          <img
            src={promo.image}
            alt={promo.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 bg-[#c4a484] text-white text-[14px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
              <Zap className="w-2.5 h-2.5" />
              {promo.tag}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2 group-hover:text-[#8a6a4a] transition-colors leading-snug">
            {promo.title}
          </h3>
          <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {promo.description}
          </p>
          <span className="inline-flex items-center gap-1 text-[14px] font-medium text-[#8a6a4a] hover:text-[#6f5338]">
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
        <div className="relative rounded-2xl overflow-hidden bg-[#f7f1ea] border border-[#e8dfd4] p-6 sm:p-8">
          <div className="text-center max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#efe4d6] text-[#8a6a4a] text-[14px] font-semibold px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3 h-3" />
              Attitude Beauty
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
              想體驗真實改善、無壓力護理？
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
              尖沙咀 Attitude Beauty，單次明碼實價，WhatsApp 即時查詢預約。
            </p>
            <Link
              href={ATTITUDE.href}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-[#c4a484] hover:bg-[#b3916e] px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              查看美容院
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
        <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: 'linear-gradient(135deg, #faf6f1 0%, #efe4d6 100%)' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#6f5338]">
                Attitude Beauty 新客首試 $480
              </h3>
              <p className="text-xs text-[#8a6a4a]/80 mt-1">
                原價 $1,380 · 尖沙咀 · 無硬銷 · 做完即走
              </p>
            </div>
            <Link
              href={ATTITUDE.href}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-[#c4a484] hover:bg-[#b3916e] px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              立即了解
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <span className="absolute top-2 right-3 text-[12px] text-[#c4a484]/60 uppercase tracking-wider">
            廣告
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="relative rounded-2xl overflow-hidden bg-[#2c241c] p-6 sm:p-8">
        <div className="absolute inset-0 opacity-20">
          <img src={ATTITUDE.glow} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center max-w-lg mx-auto">
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">
            Attitude Beauty｜香港專業肌膚管理
          </h3>
          <p className="text-xs text-white/70 mb-5 leading-relaxed">
            暗瘡 · 眼周 · 鬆弛 · 色斑。單次收費、明碼實價，預約尖沙咀店體驗。
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href={ATTITUDE.href}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2c241c] bg-white hover:bg-[#faf6f1] px-5 py-2.5 rounded-full shadow-sm transition-all"
            >
              查看詳情
            </Link>
            <Link
              href={ATTITUDE.whatsapp}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white border border-white/30 hover:bg-white/10 px-5 py-2.5 rounded-full transition-all"
            >
              WhatsApp
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
  if (variant === 'salon' || variant === 'app') {
    return (
      <div className="relative rounded-xl overflow-hidden border border-[#e8dfd4] bg-[#faf6f1] p-4">
        <img
          src={variant === 'salon' ? ATTITUDE.cover : ATTITUDE.treatment}
          alt="Attitude Beauty"
          className="w-full h-24 object-cover object-top rounded-lg mb-3 bg-[#efe4d6]"
          loading="lazy"
        />
        <h4 className="text-xs font-bold text-slate-700 mb-1">Attitude Beauty</h4>
        <p className="text-[14px] text-slate-500 mb-3 leading-relaxed">
          尖沙咀專業肌膚管理。新客首試 $480，明碼實價無硬銷。
        </p>
        <Link
          href={ATTITUDE.href}
          className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#8a6a4a] hover:text-[#6f5338] transition-colors"
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

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#e8dfd4] bg-[#faf6f1] p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-white">
          <img src={ATTITUDE.cover} alt="" className="w-full h-full object-cover object-top" />
        </div>
        <span className="text-[14px] font-semibold text-[#8a6a4a]">限時優惠</span>
      </div>
      <h4 className="text-xs font-bold text-slate-700 mb-1">Attitude Beauty 新客首試</h4>
      <p className="text-[14px] text-slate-500 mb-3 leading-relaxed">
        $480 體驗專業肌膚管理，尖沙咀店即約即到
      </p>
      <Link
        href={ATTITUDE.href}
        className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#8a6a4a] hover:text-[#6f5338] transition-colors"
      >
        立即了解
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
    <div className="my-8 py-5 px-5 rounded-xl border border-[#e8dfd4] bg-[#faf6f1] relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <img
          src={ATTITUDE.treatment}
          alt="Attitude Beauty 療程"
          className="w-full sm:w-24 h-20 sm:h-16 object-cover rounded-lg shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] text-[#8a6a4a] font-semibold mb-0.5">Attitude Beauty</p>
          <h4 className="text-sm font-bold text-slate-700 mb-1 line-clamp-1">
            新客首試 $480 — 明碼實價，做完即走
          </h4>
          <p className="text-[12px] text-slate-500 line-clamp-1">
            尖沙咀專業肌膚管理｜暗瘡 · 眼周 · 鬆弛 · 色斑
          </p>
        </div>
        <Link
          href={ATTITUDE.href}
          className="shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold text-[#8a6a4a] hover:text-[#6f5338] bg-[#efe4d6] hover:bg-[#e6d7c4] px-3 py-1.5 rounded-full transition-colors"
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
 * RelatedPromoAd — Compact banner used beside related-article sections
 */
export function RelatedPromoAd() {
  return (
    <div className="mb-8 relative rounded-2xl overflow-hidden bg-[#faf6f1] border border-[#e8dfd4] p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white">
            <img src={ATTITUDE.cover} alt="" className="w-full h-full object-cover object-top" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] text-[#8a6a4a] font-semibold mb-0.5">精選商戶</p>
            <h4 className="text-sm font-bold text-slate-700">Attitude Beauty｜尖沙咀美容院</h4>
            <p className="text-[12px] text-slate-500 mt-0.5">新客首試 $480 · 明碼實價 · 無硬銷</p>
          </div>
        </div>
        <Link
          href={ATTITUDE.href}
          className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-[#8a6a4a] bg-[#efe4d6] hover:bg-[#e6d7c4] px-4 py-2 rounded-full transition-colors"
        >
          查看詳情
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <span className="absolute top-1.5 right-2.5 text-[7px] text-slate-300 uppercase tracking-wider">廣告</span>
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
        <div className="relative rounded-2xl overflow-hidden bg-[#2c241c] p-6 sm:p-8 flex flex-col justify-between min-h-[220px]">
          <img src={ATTITUDE.glow} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3">
              <Zap className="w-3 h-3" />
              新客首試
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              Attitude Beauty 首試 $480
            </h3>
            <p className="text-xs text-white/70 mb-5 leading-relaxed">
              原價 $1,380。尖沙咀專業肌膚管理，單次收費、明碼實價、做完即走。
            </p>
            <Link
              href={ATTITUDE.href}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2c241c] bg-white hover:bg-[#faf6f1] px-4 py-2 rounded-full shadow-sm transition-all"
            >
              查看優惠
            </Link>
          </div>
          <span className="absolute top-2 right-3 text-[10px] text-white/30 uppercase tracking-wider">
            廣告
          </span>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-[#f7f1ea] border border-[#e8dfd4] p-6 sm:p-8 flex flex-col justify-between">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-[#efe4d6] text-[#8a6a4a] text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3">
              <Sparkles className="w-3 h-3" />
              尖沙咀店
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">
              加連威老道愛賓商業大廈
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              806-807室，近尖沙咀站 B2 出口。WhatsApp 5933 5046 即時查詢。
            </p>
            <Link
              href={ATTITUDE.whatsapp}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#c4a484] hover:bg-[#b3916e] px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              WhatsApp 查詢
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
