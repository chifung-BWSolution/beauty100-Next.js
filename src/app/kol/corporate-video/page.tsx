import React from 'react';
import Image from 'next/image';
import { Film, Tv, Camera, Sun, Palette } from 'lucide-react';
import KolHubShell from '@/components/kol/KolHubShell';
import {
  KolPrimaryButton,
  KolSectionLabel,
  KolBottomCta,
} from '@/components/kol/KolHubPrimitives';
import { KOL_APPLY_HREF, KOL_HUB_IMAGES, MERCHANT_PROMO_HREF } from '@/lib/kol-hub';

const PRODUCTION_TYPES = [
  {
    icon: Film,
    title: '品牌形象大片',
    description:
      '1–2 分鐘商業級影片，呈現創辦人理念、團隊專業資格、頂尖儀器運作特寫，並邀請 KOL 參演，提升品牌格調與信任度。',
  },
  {
    icon: Tv,
    title: '美容專題節目製作',
    description:
      '打造專屬美容資訊節目，邀請專業醫生、行業專家與 KOL 深度對談，建立具權威感的長期內容資產。',
  },
];

const QUALITY_POINTS = [
  {
    icon: Camera,
    title: '4K 商業級攝影',
    description: '採用 4K 商業電影級攝影機，確保畫面細節與質感達到大屏播放標準。',
  },
  {
    icon: Sun,
    title: '專業影視燈光',
    description: '專業燈光團隊現場佈光，呈現美容行業應有的精緻視覺與層次感。',
  },
  {
    icon: Palette,
    title: '專職調色後期',
    description: '專職調色師統一品牌色調，每一個畫面均經精修，適合官網、門市及大型廣告投放。',
  },
];

export default function KolCorporateVideoPage() {
  return (
    <KolHubShell>
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <KolSectionLabel>Brand Film</KolSectionLabel>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight text-balance">
            影院級質感！品牌形象宣傳片拍攝
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed text-balance">
            以高質感影像提升品牌價值，建立業界專業形象。
            <br className="hidden sm:block" />
            Beauty100 為品牌打造影院級宣傳片，並邀請優質 KOL 參演，全面提升品牌與創作者的商業格局。
          </p>
          <div className="mt-8">
            <KolPrimaryButton href={MERCHANT_PROMO_HREF}>預約宣傳片拍攝</KolPrimaryButton>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] shadow-2xl shadow-rose-100">
            <Image
              src={KOL_HUB_IMAGES.brandFilm}
              alt="品牌宣傳片拍攝場景"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-rose-50/40">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <KolSectionLabel>Production Types</KolSectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              兩大頂級影音方案
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              適用於官網大屏、門市播放及大型商業廣告，拉高品牌格局。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {PRODUCTION_TYPES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white border border-rose-100 p-6 sm:p-8"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-600 text-white inline-flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <KolSectionLabel>Production Quality</KolSectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              嚴謹製作，質素保證
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              頂尖器材與經驗豐富的影音團隊，每一個畫面均呈現美容行業應有的極致美感。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {QUALITY_POINTS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 inline-flex items-center justify-center mb-4 mx-auto">
                  <item.icon className="w-5 h-5" aria-hidden />
                </div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-rose-50/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-3 gap-6 text-center">
          {[
            { t: '品牌故事', d: '以影像說清楚品牌理念與服務差異' },
            { t: 'KOL 聯乘', d: '邀請合適創作者參演，加強真實感' },
            { t: '多平台剪輯', d: '同時輸出完整片與短版社交素材' },
          ].map((item) => (
            <div key={item.t} className="rounded-2xl bg-white border border-rose-100 px-4 py-6">
              <h3 className="font-bold text-slate-900">{item.t}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <KolBottomCta
        title="準備打造品牌形象大片？"
        description="商戶可預約拍攝方案；創作者可登記參演機會。"
        primaryHref={MERCHANT_PROMO_HREF}
        primaryLabel="商戶預約諮詢"
        secondaryHref={KOL_APPLY_HREF}
        secondaryLabel="KOL 登記"
      />
    </KolHubShell>
  );
}
