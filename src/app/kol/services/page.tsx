import React from 'react';
import Image from 'next/image';
import {
  Store,
  Lightbulb,
  FlaskConical,
  Image as ImageIcon,
  Video,
  CalendarDays,
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
    description:
      'KOL 親臨店舖第一視角體驗，全方位展現環境、儀器與服務流程，建立顧客到店信心與安心感。',
  },
  {
    icon: Lightbulb,
    title: '痛點科普與互動',
    description:
      '拆解護膚與療程常見誤區，以專業知識自然植入品牌獨家方案，把潛在顧客轉化為忠實追蹤者。',
  },
  {
    icon: FlaskConical,
    title: '療程真實評測',
    description:
      '親身體驗熱門項目，由諮詢到術後感受完整紀錄，視覺化展示 Before/After，打破顧客疑慮。',
  },
  {
    icon: ImageIcon,
    title: '平面與海報拍攝',
    description:
      '高質感產品照、療程對比與 KOL 肖像授權，素材可同步用於社交媒體、門市展示及線上廣告。',
  },
  {
    icon: Video,
    title: '爆款短片拍攝',
    description:
      '動態視覺衝擊，專為 IG Reels、小紅書演算法打造腳本與節奏，提升完播率與轉化意願。',
  },
  {
    icon: CalendarDays,
    title: '線下活動加持',
    description:
      '邀請多位 KOL 出席新店開幕、發布會或推廣日，即時放大現場聲勢，延長活動曝光週期。',
  },
];

const WORKFLOW_STEPS = [
  {
    step: '1',
    title: '極速對接',
    description: '商戶提交推廣需求，或 KOL 完成免費登記並提供平台資料，專員於一個工作天內初步回覆。',
  },
  {
    step: '2',
    title: '精準派單',
    description: '結合平台配對邏輯與專人審核，透過 WhatsApp 發送企劃詳情、拍攝安排及合作條款。',
  },
  {
    step: '3',
    title: '內容上線',
    description: '體驗或拍攝完成後，內容按計劃發佈，並提供互動與曝光數據追蹤，方便後續優化。',
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
            商戶可預約熱門服務，KOL 亦可優先獲配優質合作機會。
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
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              多維度內容組合，靈活配對最適合的創作者與執行模式，總有一款切合您的目標客群。
            </p>
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

      <section className="py-16 sm:py-20 bg-rose-50/40">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <KolSectionLabel>Service Workflow</KolSectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              高效、透明的企劃執行流程
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              專人全程跟進，讓商戶與 KOL 均省時省心。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {WORKFLOW_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl bg-white border border-rose-100 p-6 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-bold text-lg inline-flex items-center justify-center mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
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
