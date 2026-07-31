'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Users,
  Megaphone,
  Handshake,
  ClipboardList,
  Search,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Store,
  Camera,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   創作者合作招募 — /kol
   清楚說明：招募網紅／內容創作者，同美容院合作
   ═══════════════════════════════════════════════════════════════ */

export default function KolJoinPage() {
  return (
    <PublicLayout>
      <div
        className="min-h-screen bg-white"
        style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
      >
        <HeroSection />
        <WhatIsSection />
        <BenefitsSection />
        <WhoSection />
        <ProcessSection />
        <ApplyCTASection />
        <FAQSection />
        <BottomCTASection />
      </div>
    </PublicLayout>
  );
}

/* ─── HERO ─── */

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-rose-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(13,148,136,0.08),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(244,63,94,0.05),_transparent_45%)]" />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-teal-800 bg-teal-50/90 border border-teal-200/80 px-4 py-1.5 rounded-full mb-6">
            <Handshake className="w-4 h-4" aria-hidden />
            Beauty100 創作者合作
          </p>

          <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-tight">
            想同美容院合作？
            <span className="block mt-2 text-teal-700">歡迎加入 Beauty100</span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            無論你係網紅、內容創作者，定係鍾意喺社交平台分享美容體驗，
            我哋都可以幫你對接美容院合作同曝光機會。
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              className="w-full sm:w-auto min-h-12 bg-teal-600 hover:bg-teal-700 text-white px-8 text-base rounded-full shadow-lg shadow-teal-200/60 transition-all duration-200"
              size="lg"
            >
              <Link href="/kol/apply">
                立即填寫合作申請
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
              </Link>
            </Button>
            <a
              href="#what-is"
              className="w-full sm:w-auto min-h-12 inline-flex items-center justify-center px-6 text-base font-medium text-slate-700 hover:text-teal-700 transition-colors duration-200"
            >
              先了解係咩計劃
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── WHAT IS ─── */

function WhatIsSection() {
  return (
    <section id="what-is" className="py-14 sm:py-16 bg-slate-50 border-y border-slate-100 scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center">
            呢個計劃係做咩？
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed text-center">
            Beauty100 會撮合<strong className="font-semibold text-slate-800">內容創作者</strong>
            同<strong className="font-semibold text-slate-800">美容院／美容品牌</strong>合作。
            你分享真實體驗，美容院得到曝光，雙方一齊成長。
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Users,
                title: '你係創作者',
                desc: '網紅、KOL、KOC，或者鍾意拍片／寫文分享美容嘅人',
              },
              {
                icon: Store,
                title: '對方係美容院',
                desc: '想搵人真實試療程、拍內容、幫店鋪曝光',
              },
              {
                icon: Handshake,
                title: '我哋做橋樑',
                desc: '審核申請後，專員會同你聯絡，安排合適合作',
              },
            ].map((item) => (
              <div key={item.title} className="text-center sm:text-left px-2 py-3">
                <div className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-white border border-teal-100 text-teal-700 mb-3">
                  <item.icon className="w-5 h-5" aria-hidden />
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm sm:text-base text-slate-500 text-center leading-relaxed bg-white border border-slate-100 rounded-xl px-4 py-3">
            <span className="font-medium text-slate-700">小知識：</span>
            「KOL」即係有影響力嘅網紅／內容創作者（Key Opinion Leader）。
            唔使粉絲好高都可以申請，我哋更重視真實分享。
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── BENEFITS ─── */

const BENEFITS = [
  {
    icon: Megaphone,
    title: '更多人睇到你嘅內容',
    description: '你嘅體驗分享有機會出現喺 Beauty100 平台，接觸更多對美容有興趣嘅讀者。',
  },
  {
    icon: Store,
    title: '對接美容院合作',
    description: '有機會試療程、拍探店內容、同店鋪做真實體驗合作。',
  },
  {
    icon: Camera,
    title: '建立你嘅美容形象',
    description: '持續分享護膚、療程、化妝心得，強化你喺美容領域嘅個人風格。',
  },
  {
    icon: Sparkles,
    title: '有專人跟進',
    description: '交申請之後會有專員聯絡你，解釋合作方式同後續安排。',
  },
];

function BenefitsSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            加入之後有咩好處？
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            重點唔係術語，而係幫你搵到合適嘅美容院合作，同埋畀更多人睇到你嘅分享。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 max-w-4xl mx-auto">
          {BENEFITS.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <item.icon className="w-6 h-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-base text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── WHO ─── */

const WHO_ITEMS = [
  '鍾意分享美容、護膚、化妝、療程體驗',
  '有 IG、小紅書、YouTube、TikTok 或者其他社交平台',
  '可以拍短片、寫圖文，或者分享真實心得',
  '想同美容院建立長期、真誠嘅合作關係',
];

function WhoSection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-teal-50/40 to-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              邊啲人適合申請？
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              唔一定要係大網紅。只要你真心分享，我哋都歡迎你嚟申請。
            </p>
          </div>

          <ul className="space-y-3">
            {WHO_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 px-4 py-4 rounded-xl bg-white border border-slate-100"
              >
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" aria-hidden />
                <span className="text-base text-slate-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─── PROCESS ─── */

const STEPS = [
  {
    step: '1',
    icon: ClipboardList,
    title: '填寫申請',
    description: '留下聯絡方法、社交平台同你想做嘅內容方向。',
  },
  {
    step: '2',
    icon: Search,
    title: '我哋審核',
    description: '團隊會睇吓你嘅內容風格，同有冇合適嘅合作空間。',
  },
  {
    step: '3',
    icon: UserCheck,
    title: '專員聯絡你',
    description: '通過初步審核後，會有人同你傾合作詳情同安排。',
  },
];

function ProcessSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            點樣申請？只需三步
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            流程好簡單，交完資料就等我哋聯絡你。
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {STEPS.map((step, idx) => (
            <li key={step.step} className="relative text-center">
              {idx < STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute top-10 left-[58%] w-[84%] h-px bg-teal-200"
                  aria-hidden
                />
              )}
              <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-200 mb-4">
                <step.icon className="w-8 h-8 text-teal-700" aria-hidden />
                <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-teal-600 text-white text-sm font-bold flex items-center justify-center">
                  {step.step}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-base text-slate-600 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─── APPLY CTA ─── */

function ApplyCTASection() {
  return (
    <section className="py-14 sm:py-16 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          準備好申請未？
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">
          撳下面按鈕去填申請表。大約幾分鐘就搞掂，專員會盡快覆你。
        </p>
        <Button
          asChild
          className="mt-7 min-h-12 bg-teal-600 hover:bg-teal-700 text-white px-8 text-base rounded-full shadow-md transition-all duration-200"
          size="lg"
        >
          <Link href="/kol/apply">
            前往填寫合作申請表
            <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */

const FAQ_ITEMS = [
  {
    q: '「KOL」係咩意思？我唔係大網紅都可以申請嗎？',
    a: 'KOL 即係網紅／內容創作者。粉絲唔使好多都可以申請，我哋更重視你係咪真實分享美容體驗。',
  },
  {
    q: '申請之後會做啲咩？',
    a: '主要係同美容院合作，例如試療程、拍探店、分享真實體驗。具體安排會由專員同你商量。',
  },
  {
    q: '交表之後幾耐會有人聯絡？',
    a: '一般會喺收到申請後盡快安排專員聯絡你。如資料合適，會再傾合作方向。',
  },
  {
    q: '一定要有拍片經驗嗎？',
    a: '唔一定。短片、圖文、心得分享都可以。重點係你願意真誠分享。',
  },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center mb-8 sm:mb-10">
          常見問題
        </h2>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const open = openIdx === idx;
            return (
              <div
                key={item.q}
                className="rounded-xl border border-slate-100 bg-slate-50/60 overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenIdx(open ? null : idx)}
                  className="w-full min-h-12 flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors duration-200"
                >
                  <span className="text-base font-medium text-slate-800">{item.q}</span>
                  {open ? (
                    <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" aria-hidden />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" aria-hidden />
                  )}
                </button>
                {open && (
                  <div className="px-5 pb-4">
                    <p className="text-base text-slate-600 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── BOTTOM CTA ─── */

function BottomCTASection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-600 to-teal-700">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          開始你嘅美容院合作
        </h2>
        <p className="mt-4 text-base sm:text-lg text-teal-50 max-w-xl mx-auto leading-relaxed">
          填一份簡單申請，等 Beauty100 幫你對接合適嘅美容院同曝光機會。
        </p>
        <Button
          asChild
          className="mt-8 min-h-12 bg-white text-teal-700 hover:bg-teal-50 px-8 text-base rounded-full shadow-lg transition-all duration-200 font-semibold"
          size="lg"
        >
          <Link href="/kol/apply">
            立即申請合作
            <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
