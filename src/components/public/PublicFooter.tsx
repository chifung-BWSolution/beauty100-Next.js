'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Phone, Mail, MapPin } from 'lucide-react';

const FOOTER_LINKS = [
  {
    title: '探索',
    links: [
      { label: '找美容院', href: '/explore-salons' },
      { label: '焦點話題', href: '/topics' },
      { label: '娛樂圈', href: '/entertainment' },
      { label: 'KOL實錄', href: '/kol' },
    ],
  },
  {
    title: '美容知識',
    links: [
      { label: '面部護理', href: '/facial-care' },
      { label: '回復青春', href: '/anti-aging' },
      { label: '身材管理', href: '/body-shaping' },
      { label: '化妝護膚', href: '/skincare' },
    ],
  },
  {
    title: '健康生活',
    links: [
      { label: '飲食健康', href: '/healthy-diet' },
      { label: '身體保養', href: '/body-care' },
      { label: '聯絡我們', href: '/contact' },
      { label: '商戶登入', href: '/login' },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-rose-100/50" style={{ background: 'linear-gradient(180deg, rgba(253,242,248,0.3) 0%, rgba(253,242,248,0.8) 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-700 text-sm">BEAUTY</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              香港最全面的美容資訊平台，為你搜羅全港優質美容院及最新美容資訊。
            </p>
            <div className="space-y-2">
              <a href="mailto:info@beauty.com" className="flex items-center gap-2 text-xs text-slate-400 hover:text-rose-500 transition-colors">
                <Mail className="w-3.5 h-3.5" />
                info@beauty.com
              </a>
            </div>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-rose-100/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Beauty Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/contact" className="hover:text-rose-500 transition-colors">私隱政策</Link>
            <Link href="/contact" className="hover:text-rose-500 transition-colors">使用條款</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
