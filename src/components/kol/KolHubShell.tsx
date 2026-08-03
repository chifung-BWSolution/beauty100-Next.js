'use client';

import React from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import KolHubNav from '@/components/kol/KolHubNav';

export default function KolHubShell({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout activeHref="/kol">
      <KolHubNav />
      <div
        className="min-h-[50vh] bg-white"
        style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
      >
        {children}
      </div>
    </PublicLayout>
  );
}
