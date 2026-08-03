import React from 'react';
import Image from 'next/image';
import KolHubShell from '@/components/kol/KolHubShell';
import {
  KolPrimaryButton,
  KolBottomCta,
  KolSectionLabel,
} from '@/components/kol/KolHubPrimitives';
import { KOL_APPLY_HREF, KOL_HUB_IMAGES } from '@/lib/kol-hub';
import { Radio, Video, Mic2, Award, Rocket, Heart, Camera, Users } from 'lucide-react';

const BENEFITS = [
  {
    icon: Video,
    title: '專業影棚支援',
    description: '可使用專業影棚、影視級燈光、收音及後製團隊，降低開播製作門檻。',
  },
  {
    icon: Mic2,
    title: '專屬節目企劃',
    description: '協助主持美妝開箱、美容儀器評測及專家訪談等專題節目，建立個人 IP 定位。',
  },
  {
    icon: Award,
    title: '品牌代言優先',
    description: '成熟節目可優先對接國際品牌代言、線下發布會主持及長期贊助合作。',
  },
  {
    icon: Rocket,
    title: '全網流量推廣',
    description: '節目於 Beauty100 全網渠道聯合推廣，為個人帳號注入高質感追蹤者。',
  },
];

const CRITERIA = [
  {
    icon: Heart,
    title: '美妝美容熱誠',
    description: '對護膚、彩妝或美容療程有真誠興趣，願意持續學習並分享專業內容。',
  },
  {
    icon: Camera,
    title: '鏡頭表現力',
    description: '口齒清晰、表達自然，能在鏡頭前展現個人風格與專業感。',
  },
  {
    icon: Users,
    title: '建議 IG 2,000+ 粉絲',
    description: 'Instagram 追蹤者達 2,000 或以上為佳，具備一定受眾基礎與內容創作經驗。',
  },
];

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
            由 Beauty100 專業團隊協助您打造專屬 YouTube 美妝節目，
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
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <KolSectionLabel>Core Benefits</KolSectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              全方位資源扶持
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              助您從社交平台創作者躍升為業界知名主播。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 text-center hover:border-rose-200 transition-colors duration-200"
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

      <section className="py-16 sm:py-20 bg-rose-50/40">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <KolSectionLabel>Recruitment</KolSectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              招募條件
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              只要您具備以下特質，專業影音團隊將協助您完成其餘製作環節。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {CRITERIA.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white border border-rose-100 p-6 text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-600 text-white inline-flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5" aria-hidden />
                </div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
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
