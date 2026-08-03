'use client';

import React from 'react';
import Image from 'next/image';
import {
  Store,
  FlaskConical,
  Image as ImageIcon,
  CalendarDays,
  Video,
  Users,
} from 'lucide-react';
import KolHubShell from '@/components/kol/KolHubShell';
import {
  KolPrimaryButton,
  KolSectionLabel,
  KolBottomCta,
} from '@/components/kol/KolHubPrimitives';
import { KOL_APPLY_HREF, KOL_HUB_IMAGES, MERCHANT_PROMO_HREF } from '@/lib/kol-hub';

const SERVICES = [
  {
    icon: Store,
    title: '門市探店直擊',
    description: '創作者親臨店舖拍攝，真實呈現環境、服務與氣氛，提升顧客到店信心。',
  },
  {
    icon: FlaskConical,
    title: '療程真實評測',
    description: '由諮詢到術後感受完整紀錄，以第一身體驗化解顧客疑慮。',
  },
  {
    icon: ImageIcon,
    title: '平面與產品拍攝',
    description: '專業產品照、療程前後對比與海報素材，方便社交與門市同步使用。',
  },
  {
    icon: CalendarDays,
    title: '活動現場加持',
    description: '開幕、發布會或推廣日現場紀錄，即時放大活動聲勢。',
  },
  {
    icon: Video,
    title: '短片內容策劃',
    description: '針對 IG、小紅書、TikTok 平台特性撰寫腳本，提升完播與互動。',
  },
  {
    icon: Users,
    title: '多層級 KOL 組合',
    description: '按預算與目標組合 Nano 至 Mega 創作者，平衡口碑與曝光。',
  },
];

export default function KolServicesPage() {
  return (
    <KolHubShell>
      <section className="relative overflow-hidden min-h-[420px] sm:min-h-[480px] flex items-center">
        <Image
          src={KOL_HUB_IMAGES.beautyPortrait}
          alt="美容護膚特寫"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/55 to-rose-900/40" />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <p className="inline-flex text-xs font-semibold tracking-[0.18em] uppercase text-white/90 bg-black/35 px-3 py-1 rounded-full">
            KOL Services
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight max-w-2xl text-balance">
            六大高成效內容推廣服務
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/90 max-w-xl leading-relaxed text-balance">
            打破傳統生硬廣告，以真實影響力帶動顧客行動。
            <br className="hidden sm:block" />
            商戶可預約熱門服務，KOL 亦可優先獲優質合作機會。
          </p>
          <div className="mt-8">
            <KolPrimaryButton href={KOL_APPLY_HREF}>立即登記・開始接合作</KolPrimaryButton>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <KolSectionLabel>Service Matrix</KolSectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              由體驗到曝光，一條龍支援
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {SERVICES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:p-6 hover:border-rose-200 hover:bg-rose-50/40 transition-colors duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 inline-flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <KolBottomCta
        title="想為品牌或個人帳號配對合適合作？"
        description="提交資料後，專員會盡快與您聯絡，說明合作方向與安排。"
        primaryHref={KOL_APPLY_HREF}
        primaryLabel="KOL 立即登記"
        secondaryHref={MERCHANT_PROMO_HREF}
        secondaryLabel="商戶查詢推廣"
      />
    </KolHubShell>
  );
}
