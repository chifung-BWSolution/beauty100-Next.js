'use client';

import React from 'react';
import ZoneTopBar from '@/components/public/ZoneTopBar';
import PublicFooter from '@/components/public/PublicFooter';
import KolNavbar from '@/components/kol/KolNavbar';

/** Full KOL zone chrome: zone top bar + KOL navbar (replaces main site nav) */
export default function KolHubShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ZoneTopBar />
      <KolNavbar />
      <main
        className="flex-1"
        style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
      >
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
