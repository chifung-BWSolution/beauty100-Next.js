import React from 'react';
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
    tagline: '新店開業／新療程首發',
    priceNote: '入門方案',
    highlighted: false,
    features: [
      '新店開業／新療程首發',
      '5–10 位 Micro KOL 體驗派單',
      'Instagram 曝光與圖文內容',
      '建立 Google／IG 搜尋口碑',
      '基礎成效報告',
    ],
  },
  {
    id: 'growth',
    name: 'Growth 增長包',
    tagline: '主力療程推廣',
    priceNote: '最受歡迎',
    highlighted: true,
    features: [
      '主力療程推廣',
      '中階 KOL 深度試做',
      '高轉化 Reels 短片拍攝',
      '廣告素材授權投放',
      '互動與曝光數據追蹤',
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate 旗艦包',
    tagline: '連鎖／品牌旗艦',
    priceNote: '旗艦方案',
    highlighted: false,
    features: [
      '連鎖美容院／國際美妝品牌',
      '頭部 KOL 陣容',
      '品牌宣傳片或專題節目元素',
      '線下活動與發布會支援',
      '專屬項目經理跟進',
    ],
  },
  {
    id: 'custom',
    name: '客製化組合',
    tagline: '按預算與 KPI 靈活配置',
    priceNote: '度身訂造',
    highlighted: false,
    features: [
      '按預算與 KPI 自由組合',
      '跨平台（IG、小紅書、YouTube）',
      '可加入主播／長片元素',
      '報價前免費諮詢',
    ],
  },
];

export default function KolPackagesPage() {
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
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`rounded-3xl border bg-white p-6 sm:p-8 shadow-lg transition-all duration-200 ${
                  pkg.highlighted
                    ? 'border-rose-400 ring-2 ring-rose-100 shadow-rose-100/60'
                    : 'border-rose-100 shadow-rose-100/50'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                  {pkg.priceNote}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{pkg.name}</h2>
                <p className="mt-1 text-slate-600">{pkg.tagline}</p>
                <ul className="mt-6 space-y-3">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-slate-700">
                      <Check className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden />
                      <span className="text-sm sm:text-base leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <KolPrimaryButton href={MERCHANT_PROMO_HREF}>索取方案報價</KolPrimaryButton>
                  <KolSecondaryButton href={KOL_APPLY_HREF}>KOL 登記</KolSecondaryButton>
                </div>
              </div>
            ))}
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
