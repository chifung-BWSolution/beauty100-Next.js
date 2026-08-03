'use client';

import React from 'react';
import ZoneTopBar from '@/components/public/ZoneTopBar';
import PublicNavbar, { MERCHANT_NAV_ITEMS } from '@/components/public/PublicNavbar';

/** Merchant zone chrome: zone top bar + main-site-styled navbar */
export default function MerchantShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-foreground overflow-x-hidden min-h-screen">
      <ZoneTopBar />
      <PublicNavbar items={MERCHANT_NAV_ITEMS} logoHref="/merchant" />
      {children}
    </div>
  );
}
