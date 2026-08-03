'use client';

import React from 'react';
import ZoneTopBar from '@/components/public/ZoneTopBar';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { KOL_HUB_NAV } from '@/lib/kol-hub';

/** Full KOL zone chrome: zone top bar + main-site-styled navbar with KOL links */
export default function KolHubShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ZoneTopBar />
      <PublicNavbar items={KOL_HUB_NAV} logoHref="/kol" />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
