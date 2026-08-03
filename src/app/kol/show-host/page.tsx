'use client';

import React from 'react';
import Image from 'next/image';
import KolHubShell from '@/components/kol/KolHubShell';
import {
  KolPrimaryButton,
  KolBottomCta,
} from '@/components/kol/KolHubPrimitives';
import { KOL_APPLY_HREF, KOL_HUB_IMAGES } from '@/lib/kol-hub';
import { Radio } from 'lucide-react';

export default function KolShowHostPage() {
  return (
    <KolHubShell>
      <section className="relative overflow-hidden min-h-[520px] sm:min-h-[600px] flex items-center">
        <Image
          src={KOL_HUB_IMAGES.talkShowStudio}
          alt="節目錄影工作室"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/70 via-slate-900/65 to-slate-950/80" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white">
          <p className="inline-flex items-center gap-2 text-sm font-medium bg-white/15 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
            <Radio className="w-4 h-4" aria-hidden />
            KOL 商業進階通道
          </p>
          <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance">
            不止於發帖！
            <span className="block mt-2">成為美妝界具影響力的節目主播</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-rose-50/95 leading-relaxed text-balance">
            由專業團隊協助您打造專屬 YouTube 美妝節目，
            <br className="hidden sm:block" />
            開拓更大商業舞台與長期品牌合作。
          </p>
          <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl mx-auto text-balance">
            包括個人形象定位、節目構思、錄影支援，以及與品牌合作對接，
            協助您由內容創作者進階為具權威感的美容主播。
          </p>
          <div className="mt-8">
            <KolPrimaryButton href={KOL_APPLY_HREF}>報名主播試鏡／登記</KolPrimaryButton>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-3 gap-5">
          {[
            { t: '節目定位', d: '按您的風格與受眾，訂立節目主題與節奏。' },
            { t: '錄影支援', d: '提供製作建議與拍攝支援，降低開播門檻。' },
            { t: '品牌合作', d: '成熟節目可進一步對接長期品牌贊助與聯乘。' },
          ].map((item) => (
            <div key={item.t} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 text-center">
              <h3 className="font-bold text-slate-900">{item.t}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <KolBottomCta
        title="想由創作者進階成為節目主播？"
        description="填寫登記表，專員會與您了解經驗、平台與合作方向。"
        primaryHref={KOL_APPLY_HREF}
        primaryLabel="立即登記"
      />
    </KolHubShell>
  );
}
