'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Menu, X, ChevronDown, Store } from 'lucide-react';

const NAV_ITEMS = [
  { label: '首頁', href: '/' },
  { label: '找美容院', href: '/explore-salons' },
  {
    label: '美容專題',
    href: '#',
    children: [
      { label: '焦點話題', href: '/topics' },
      { label: '娛樂圈', href: '/entertainment' },
      { label: 'KOL實錄', href: '/kol' },
    ],
  },
  {
    label: '美容知識',
    href: '#',
    children: [
      { label: '面部護理', href: '/facial-care' },
      { label: '回復青春', href: '/anti-aging' },
      { label: '身材管理', href: '/body-shaping' },
      { label: '化妝護膚', href: '/skincare' },
      { label: '飲食健康', href: '/healthy-diet' },
      { label: '身體保養', href: '/body-care' },
    ],
  },
  { label: '聯絡我們', href: '/contact' },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isParentActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.children) {
      return item.children.some(c => pathname.startsWith(c.href));
    }
    return isActive(item.href);
  };

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(251,207,232,0.4)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-800 tracking-tight">BEAUTY</span>
              <p className="text-[9px] text-rose-400 -mt-1 leading-none">香港美容資訊平台</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.children ? (
                  <button
                    className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                      isParentActive(item)
                        ? 'text-rose-600 font-semibold bg-rose-50'
                        : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
                    }`}
                  >
                    {item.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors block ${
                      isActive(item.href)
                        ? 'text-rose-600 font-semibold bg-rose-50'
                        : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}
                {item.children && openDropdown === item.label && (
                  <div
                    className="absolute top-full left-0 mt-1 w-44 rounded-xl overflow-hidden shadow-xl z-50"
                    style={{
                      background: 'rgba(255,255,255,0.97)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(251,207,232,0.3)',
                    }}
                  >
                    <div className="py-1.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-4 py-2.5 text-sm transition-colors ${
                            isActive(child.href)
                              ? 'text-rose-600 font-medium bg-rose-50'
                              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors px-3 py-2 rounded-lg hover:bg-rose-50/50"
            >
              <Store className="w-4 h-4" />
              商戶登入
            </Link>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden text-slate-600 hover:text-rose-500 transition-colors p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden border-t border-rose-100/50 max-h-[calc(100vh-4rem)] overflow-y-auto"
          style={{ background: 'rgba(255,255,255,0.97)' }}
        >
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors ${
                        isParentActive(item) ? 'text-rose-600 font-semibold bg-rose-50' : 'text-slate-600'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileExpanded === item.label && (
                      <div className="ml-3 space-y-0.5 pb-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                              isActive(child.href)
                                ? 'text-rose-600 font-medium bg-rose-50'
                                : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50/50'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2.5 text-sm rounded-lg transition-colors ${
                      isActive(item.href) ? 'text-rose-600 font-semibold bg-rose-50' : 'text-slate-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-2 border-t border-rose-100/50">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-rose-500 rounded-lg hover:bg-rose-50/50"
              >
                <Store className="w-4 h-4" />
                商戶登入
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
