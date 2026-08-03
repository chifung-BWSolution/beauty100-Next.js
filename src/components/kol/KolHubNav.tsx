'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { KOL_HUB_NAV } from '@/lib/kol-hub';

function isNavActive(pathname: string, href: string, match: 'exact' | 'prefix') {
  if (match === 'exact') return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export default function KolHubNav() {
  const pathname = usePathname();

  return (
    <div
      className="sticky top-[60px] z-40 border-b border-rose-100/80 bg-white/95 backdrop-blur-md"
      style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-12">
          <Link
            href="/kol"
            className="shrink-0 inline-flex items-center gap-2 text-rose-700 font-semibold text-sm"
          >
            <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-rose-600 text-white">
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
            </span>
            <span className="hidden sm:inline whitespace-nowrap">Beauty100 KOL 推廣</span>
          </Link>

          <nav
            className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none py-1"
            aria-label="KOL 推廣導覽"
          >
            {KOL_HUB_NAV.map((item) => {
              const active = isNavActive(pathname, item.href, item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-full text-[12px] sm:text-[13px] font-medium whitespace-nowrap transition-colors duration-200 ${
                    active
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
