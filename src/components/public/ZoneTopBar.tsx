'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Store, PenLine, Home, Megaphone } from 'lucide-react';

const ZONES = [
  { label: '資訊主頁', href: '/', match: 'main' as const, icon: Home },
  { label: 'KOL推廣', href: '/kol', match: 'kol' as const, icon: Megaphone },
  { label: '商戶專區', href: '/merchant', match: 'merchant' as const, icon: Store },
];

function currentZone(pathname: string) {
  if (pathname === '/merchant' || pathname.startsWith('/merchant-')) return 'merchant';
  if (pathname === '/kol' || pathname.startsWith('/kol/')) return 'kol';
  return 'main';
}

/** Top strip shared by main site, KOL zone, and merchant zone — switch areas / return home */
export default function ZoneTopBar() {
  const pathname = usePathname();
  const zone = currentZone(pathname);

  return (
    <div
      className="w-full text-white overflow-hidden"
      style={{
        fontSize: '13px',
        background: 'linear-gradient(135deg, #f9a8d4 0%, #f472b6 50%, #ec4899 100%)',
        height: '36px',
        lineHeight: '36px',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[36px] gap-3">
          <nav className="flex items-center gap-1 sm:gap-1.5 min-w-0" aria-label="網站專區">
            {ZONES.map((item) => {
              const active = zone === item.match;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1 px-2 sm:px-2.5 rounded-full text-[11px] sm:text-xs whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-white text-rose-600 font-semibold'
                      : 'text-white/90 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/member-login"
              className="hidden sm:flex items-center gap-1 text-white/85 hover:text-white transition-colors"
            >
              <Heart className="w-3 h-3" />
              <span>登入/登記</span>
            </Link>
            <span className="hidden sm:inline text-white/30">|</span>
            <Link
              href="/suggest-salon-update"
              className="hidden md:flex items-center gap-1 text-yellow-100 hover:text-white transition-colors"
            >
              <PenLine className="w-3 h-3" />
              <span>更新美容院資料</span>
            </Link>
            <span className="hidden md:inline text-white/30">|</span>
            <Link
              href="/login"
              className="flex items-center gap-1 text-white/85 hover:text-white transition-colors"
            >
              <Store className="w-3 h-3" />
              <span className="hidden sm:inline">商戶登入</span>
              <span className="sm:hidden">登入</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
