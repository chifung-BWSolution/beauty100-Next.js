'use client';

import React from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicTopBar from '@/components/public/PublicTopBar';
import PublicFooter from '@/components/public/PublicFooter';

export default function PublicLayout({ children, activeHref }: { children: React.ReactNode; activeHref?: string }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fafafa' }}>
      <PublicTopBar />
      <PublicNavbar activeHref={activeHref} />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
