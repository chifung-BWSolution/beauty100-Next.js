'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, Store } from 'lucide-react';

const NAV_ITEMS = [
  { label: '首頁', href: '/' },
  { label: '找美容院', href: '/explore-salons' },
  { label: '焦點話題', href: '/topics' },
  { label: '娛樂圈', href: '/entertainment' },
  { label: '面部護理', href: '/facial-care' },
  { label: '回復青春', href: '/anti-aging' },
  { label: '身體保養', href: '/body-care' },
  { label: '化妝護膚', href: '/skincare' },
  { label: '飲食健康', href: '/healthy-diet' },
  { label: 'KOL實錄', href: '/kol' },
  { label: '聯絡我們', href: '/contact' },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(251,207,232,0.35)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/images/beauty-100_logo.png"
              alt="Beauty 100 Magazine"
              width={160}
              height={40}
              className="h-[38px] w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav — all items visible, no dropdowns */}
          <nav className="hidden xl:flex items-center gap-0">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative px-[10px] py-1.5 text-[14px] leading-tight rounded-md transition-all duration-200 whitespace-nowrap ${
                  isActive(item.href)
                    ? 'text-rose-600 font-semibold'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                {item.label}
                {/* Active underline indicator */}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-200 ${
                    isActive(item.href)
                      ? 'w-5 opacity-100'
                      : 'w-0 opacity-0 group-hover:w-3 group-hover:opacity-60'
                  }`}
                  style={{ background: 'linear-gradient(90deg, #f472b6, #e11d48)' }}
                />
              </Link>
            ))}
          </nav>

          {/* Right side: Merchant Login CTA + Hamburger */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Merchant Login — standalone CTA button */}
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 text-[14px] font-semibold text-white px-4 py-[7px] rounded-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #f472b6, #e11d48)',
                boxShadow: '0 2px 8px rgba(228,29,72,0.2)',
              }}
            >
              <Store className="w-3.5 h-3.5" />
              商戶登入
            </Link>

            {/* Mobile Hamburger — xl breakpoint to match nav */}
            <button
              className="xl:hidden text-slate-600 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50/60"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Menu */}
      <div
        className={`xl:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[calc(100vh-60px)] opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{
          background: 'rgba(255,255,255,0.98)',
          borderTop: mobileMenuOpen ? '1px solid rgba(251,207,232,0.3)' : 'none',
        }}
      >
        <div className="px-4 py-3 space-y-0.5 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 text-sm rounded-lg transition-all duration-150 ${
                isActive(item.href)
                  ? 'text-rose-600 font-semibold bg-rose-50'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {/* Mobile merchant login */}
          <div className="pt-2 mt-2 border-t border-rose-100/50">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-white rounded-full transition-all"
              style={{
                background: 'linear-gradient(135deg, #f472b6, #e11d48)',
              }}
            >
              <Store className="w-4 h-4" />
              商戶登入
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
