"use client";

import { ArrowUp } from "lucide-react";

export interface MerchantCTABannerProps {
  /** Main heading text */
  title?: string;
  /** Secondary heading text */
  subtitle?: string;
  /** Description paragraph text */
  description?: string;
  /** CTA button label */
  ctaLabel?: string;
  /** CTA button link URL */
  ctaHref?: string;
  /** Additional className for the section */
  className?: string;
}

export default function MerchantCTABanner({
  title = "立即註冊",
  subtitle = "創造營商契機",
  description = "立即註冊成為 Beauty100 用戶會員，解鎖專屬資源及專業支援，讓您的美容業務在香港市場中佔據優勢。通過數據洞察、創意推廣及合作機會，我們助您把握美容業趨勢，實現高效增長與可持續成功。探索更多核心服務，或透過聯繫我們頁面獲取即時協助！",
  ctaLabel = "立即體驗",
  ctaHref = "/login",
  className = "",
}: MerchantCTABannerProps) {
  return (
    <section
      className={`relative h-[450px] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-pink-900 ${className}`}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-purple-500/10 rounded-full translate-y-1/3" />
      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-pink-400/10 rounded-full" />
      <div className="absolute bottom-1/4 left-10 w-20 h-20 bg-white/5 rounded-full" />
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-2">{title}</h2>
          <h3 className="text-3xl font-bold mb-6">{subtitle}</h3>
          <p className="text-sm text-white/80 leading-relaxed mb-8">
            {description}
          </p>
          <a
            href={ctaHref}
            className="flex items-center gap-2 bg-white/10 border border-white/30 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/20 transition-colors w-fit"
          >
            {ctaLabel}
            <ArrowUp className="w-4 h-4 rotate-45" />
          </a>
        </div>
      </div>
    </section>
  );
}
