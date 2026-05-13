'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Store, PenLine } from 'lucide-react';

export default function PublicTopBar() {
  return (
    <div
      className="w-full text-white"
      style={{ fontSize: '13px', background: 'linear-gradient(135deg, #f9a8d4 0%, #f472b6 50%, #ec4899 100%)' }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[32px]">
          {/* Left side - can add announcements/promo text */}
          <div className="hidden sm:flex items-center gap-1 text-white/90 text-xs">
            <span>香港最全面的美容資訊平台</span>
          </div>

          {/* Right side - action links */}
          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/member-login"
              className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
            >
              <Heart className="w-3 h-3" />
              <span>登入/登記</span>
            </Link>
            <span className="text-white/30">|</span>
            <Link
              href="/suggest-salon-update"
              className="flex items-center gap-1 text-yellow-100 hover:text-white transition-colors"
            >
              <PenLine className="w-3 h-3" />
              <span>更新美容院資料</span>
            </Link>
            <span className="text-white/30">|</span>
            <Link
              href="/login"
              className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
            >
              <Store className="w-3 h-3" />
              <span>商戶專區</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
