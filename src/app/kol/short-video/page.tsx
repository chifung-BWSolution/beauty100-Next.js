import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clapperboard,
  Smartphone,
  Timer,
  Users,
  Sparkles,
  Lightbulb,
  Drama,
  Package,
  ArrowLeftRight,
} from 'lucide-react';
import KolHubShell from '@/components/kol/KolHubShell';
import {
  KolPrimaryButton,
  KolSectionLabel,
  KolBottomCta,
} from '@/components/kol/KolHubPrimitives';
import { KOL_APPLY_HREF, KOL_HUB_IMAGES, MERCHANT_PROMO_HREF } from '@/lib/kol-hub';

const POINTS = [
  {
    icon: Smartphone,
    title: '平台演算法導向',
    description: '專為 IG Reels、小紅書與 YouTube Shorts 設計開場與節奏，提升完播率。',
  },
  {
    icon: Timer,
    title: '三秒抓住注意力',
    description: '把療程亮點濃縮成高衝擊短片，讓觀眾快速理解價值並產生行動。',
  },
  {
    icon: Users,
    title: 'KOL 參演機會',
    description: '為創作者提供大量出鏡與合作機會，同時為品牌帶來真實說服力。',
  },
  {
    icon: Clapperboard,
    title: '專業影音團隊',
    description: '由構思、拍攝到剪接一條龍，確保畫面質感與品牌調性一致。',
  },
];

const VIDEO_STYLES = [
  {
    icon: Sparkles,
    title: 'ASMR 療程體驗',
    description: '沉浸式視聽享受，展現高端環境與專業手法，建立精緻質感與品牌格調。',
  },
  {
    icon: Lightbulb,
    title: '痛點科普解構',
    description: '直擊暗瘡、鬆弛、色斑等常見困擾，以原理說明配合真實試做，說服高意向顧客。',
  },
  {
    icon: Drama,
    title: '劇情反轉短片',
    description: '貼近生活的情境劇情（如約會前急救、職場形象提升），具備社交分享與擴散潛力。',
  },
  {
    icon: Package,
    title: '產品質感開箱',
    description: '快節奏視覺呈現，近鏡展示產品質地與使用感受，帶動網店及門市查詢。',
  },
  {
    icon: ArrowLeftRight,
    title: 'Before/After 對比',
    description: '真實記錄療程前後變化，以清晰對比畫面回應顧客疑慮，提升預約意願。',
  },
];

const PIPELINE_STEPS = [
  '腳本企劃',
  '現場拍攝與燈光佈置',
  '專業後期剪接',
  '初剪審核',
  '高清成品交付',
];

export default function KolShortVideoPage() {
  const collage = [
    KOL_HUB_IMAGES.filmingCreator,
    KOL_HUB_IMAGES.studioLights,
    KOL_HUB_IMAGES.beautyTalk,
  ];

  return (
    <KolHubShell>
      <section className="relative overflow-hidden bg-[#2a1814] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(190,24,93,0.25),_transparent_60%)]" />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <KolSectionLabel>Short Video</KolSectionLabel>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance">
                三秒抓住眼球！
                <span className="block mt-2 text-rose-200">高轉化社交短片製作</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-rose-50/90 leading-relaxed max-w-xl text-balance">
                專為 IG Reels、小紅書、Shorts 打造內容節奏，協助顧客看完後主動查詢或預約。
                專業影音團隊將療程亮點濃縮成具衝擊力的短片，同時為 KOL 提供大量參演機會。
              </p>
              <div className="mt-8">
                <KolPrimaryButton href={MERCHANT_PROMO_HREF} className="!bg-white !text-rose-700 hover:!bg-rose-50">
                  預約短片拍攝團隊
                </KolPrimaryButton>
              </div>
              <p className="mt-3 text-sm text-rose-100/80">
                創作者亦可{' '}
                <Link href={KOL_APPLY_HREF} className="underline underline-offset-2 hover:text-white">
                  登記接拍機會
                </Link>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {collage.map((src, i) => (
                <div
                  key={src}
                  className={`relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 shadow-xl ${
                    i === 1 ? 'mt-6' : i === 2 ? 'mt-3' : ''
                  }`}
                >
                  <Image
                    src={src}
                    alt={`短片製作示例 ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              短片如何為美容院帶來查詢？
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {POINTS.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 p-5 bg-slate-50/50">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 inline-flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5" aria-hidden />
                </div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-rose-50/40">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <KolSectionLabel>Video Styles</KolSectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              多維度爆款內容企劃
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              拒絕千篇一律，以視覺與敘事打動目標客群。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {VIDEO_STYLES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white border border-rose-100 p-5 sm:p-6 hover:border-rose-200 transition-colors duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 inline-flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5" aria-hidden />
                </div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <KolSectionLabel>Production Pipeline</KolSectionLabel>
          <h2 className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            專業團隊，高效交付
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            由企劃到出片全程銜接：{PIPELINE_STEPS.join(' → ')}。
            <br className="hidden sm:block" />
            一般於拍攝後 3–5 個工作天完成初剪交付。
          </p>
        </div>
      </section>

      <KolBottomCta
        title="想製作下一條高成效短片？"
        description="商戶可預約製作團隊；創作者亦可登記參演與合作機會。"
        primaryHref={MERCHANT_PROMO_HREF}
        primaryLabel="商戶預約拍攝"
        secondaryHref={KOL_APPLY_HREF}
        secondaryLabel="KOL 登記"
      />
    </KolHubShell>
  );
}
