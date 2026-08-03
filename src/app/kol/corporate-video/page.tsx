'use client';

import React from 'react';
import Image from 'next/image';
import KolHubShell from '@/components/kol/KolHubShell';
import {
  KolPrimaryButton,
  KolSectionLabel,
  KolBottomCta,
} from '@/components/kol/KolHubPrimitives';
import { KOL_APPLY_HREF, KOL_HUB_IMAGES, MERCHANT_PROMO_HREF } from '@/lib/kol-hub';

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
            我們為品牌打造影院級宣傳片，並邀請優質 KOL 參演，全面提升品牌與創作者的商業格局。
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
