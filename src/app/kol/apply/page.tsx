'use client';

import Link from 'next/link';
import KolHubShell from '@/components/kol/KolHubShell';
import KolApplicationForm from '@/components/kol/KolApplicationForm';
import { ArrowLeft } from 'lucide-react';

export default function KolApplyPage() {
  return (
    <KolHubShell>
      <section className="bg-gradient-to-b from-rose-50/60 via-white to-white pt-8 pb-2">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/kol"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回KOL推廣
          </Link>

          <div className="mt-8 text-center">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase text-rose-500">
              Join Beauty100 Creator Community
            </p>
            <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              加入 Beauty100 美容體驗創作者社群
            </h1>
            <p className="mt-4 text-sm sm:text-base font-medium text-rose-600">
              KOL・KOC・Blogger・Beauty Reviewer・Content Creator 招募中
            </p>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              喜歡試美容療程、探索新店、分享真實體驗
            </p>
            <div className="mt-6 space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed text-left sm:text-center max-w-2xl mx-auto">
              <p>
                Beauty 100 是一個集合美容店、療程、產品及真實用戶分享的美容平台，讓大家可以透過真實體驗及評價，找到更適合自己的美容選擇。
              </p>
              <p>
                我們現正招募不同類型的創作者加入 Beauty100 Creator Community。
              </p>
            </div>
          </div>
        </div>
      </section>

      <KolApplicationForm />
    </KolHubShell>
  );
}
