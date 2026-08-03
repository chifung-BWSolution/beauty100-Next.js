'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { KOL_HUB_NAV, KOL_APPLY_HREF } from '@/lib/kol-hub';

function isNavActive(pathname: string, href: string, match: 'exact' | 'prefix') {
  if (match === 'exact') return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

/** KOL zone main navbar — replaces site PublicNavbar inside /kol/* */
export default function KolNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-5 h-[60px]">
          <Link href="/kol" className="shrink-0" aria-label="Beauty100 KOL 推廣">
            <Image
              src="/images/beauty-100_logo.png"
              alt="Beauty 100 Magazine"
              width={120}
              height={30}
              className="h-[32px] sm:h-[36px] w-auto object-contain"
              priority
            />
          </Link>

          <nav
            className="flex-1 flex items-center gap-0.5 sm:gap-1 overflow-x-auto min-w-0 py-1"
            aria-label="KOL 推廣導覽"
            style={{ scrollbarWidth: 'none' }}
          >
            {KOL_HUB_NAV.map((item) => {
              const active = isNavActive(pathname, item.href, item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-full text-[12px] sm:text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    active
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-700 hover:text-rose-600'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href={KOL_APPLY_HREF}
            className="shrink-0 hidden md:inline-flex items-center justify-center min-h-9 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
          >
            立即登記
          </Link>
        </div>
      </div>
    </header>
  );
}
