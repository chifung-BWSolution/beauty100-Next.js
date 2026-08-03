'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import KolHubShell from '@/components/kol/KolHubShell';
import {
  KolPrimaryButton,
  KolSecondaryButton,
  KolSectionLabel,
  KolBottomCta,
} from '@/components/kol/KolHubPrimitives';
import { KOL_APPLY_HREF, MERCHANT_PROMO_HREF } from '@/lib/kol-hub';

const PACKAGES = [
  {
    id: 'seeding',
    name: 'Seeding 口碑包',
    tagline: '適合新店開業與口碑建立',
    priceNote: '入門方案',
    features: [
      '5–8 位 Nano／Micro KOL',
      '探店或療程體驗內容',
      'IG／小紅書圖文或短片',
      '基礎成效報告',
      '專人 WhatsApp 跟進',
    ],
  },
  {
    id: 'growth',
    name: 'Growth 增長包',
    tagline: '適合穩定增長與產品推廣',
    priceNote: '最受歡迎',
    features: [
      '8–15 位多層級創作者組合',
      '短片＋圖文混合內容',
      '腳本建議與拍攝指引',
      '互動與曝光數據追蹤',
      '兩週推廣節奏規劃',
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate 旗艦包',
    tagline: '適合品牌升級與大型企劃',
    priceNote: '旗艦方案',
    features: [
      'Mid-tier 至 Macro 創作者',
      '品牌宣傳片或主題短片',
      '活動／發布會支援',
      '完整數據與優化建議',
      '專屬項目經理跟進',
    ],
  },
  {
    id: 'custom',
    name: '客製化組合',
    tagline: '按預算與目標靈活配置',
    priceNote: '度身訂造',
    features: [
      '按目標客群重新配對',
      '可跨平台組合投放',
      '可加入主播／長片元素',
      '報價前免費諮詢',
      '適合連鎖及多店品牌',
    ],
  },
];

export default function KolPackagesPage() {
  const [active, setActive] = useState(PACKAGES[1].id);
  const current = PACKAGES.find((p) => p.id === active) || PACKAGES[1];

  return (
    <KolHubShell>
      <section className="py-16 sm:py-20 bg-gradient-to-b from-rose-50 via-white to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <KolSectionLabel>Marketing Packages</KolSectionLabel>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight text-balance">
            清晰透明的高成效推廣方案
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed text-balance">
            收費清楚、無隱藏項目，以高性價比協助商戶控制成本。
            <br className="hidden sm:block" />
            無論是新開張店舖，或尋求突破的連鎖品牌，均可按目標靈活選擇。
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setActive(pkg.id)}
                className={`min-h-10 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  active === pkg.id
                    ? 'bg-white text-rose-700 shadow-md border border-rose-100'
                    : 'bg-transparent text-slate-600 hover:text-rose-700'
                }`}
              >
                {pkg.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-rose-100 bg-white p-6 sm:p-8 shadow-lg shadow-rose-100/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">{current.priceNote}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{current.name}</h2>
            <p className="mt-1 text-slate-600">{current.tagline}</p>
            <ul className="mt-6 space-y-3">
              {current.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-slate-700">
                  <Check className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden />
                  <span className="text-sm sm:text-base leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <KolPrimaryButton href={MERCHANT_PROMO_HREF}>索取方案報價</KolPrimaryButton>
              <KolSecondaryButton href={KOL_APPLY_HREF}>KOL 登記加入</KolSecondaryButton>
            </div>
          </div>
        </div>
      </section>

      <KolBottomCta
        title="未確定哪一個方案最適合？"
        description="歡迎先預約免費諮詢，由專員按您的目標建議組合。"
        primaryHref={MERCHANT_PROMO_HREF}
        primaryLabel="商戶預約諮詢"
        secondaryHref={KOL_APPLY_HREF}
        secondaryLabel="KOL 立即登記"
      />
    </KolHubShell>
  );
}
