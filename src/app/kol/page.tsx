'use client';

import React from 'react';
import Image from 'next/image';
import {
  TrendingUp,
  Megaphone,
  Network,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Camera,
  Clapperboard,
  Film,
  Mic2,
  CheckCircle2,
} from 'lucide-react';
import KolHubShell from '@/components/kol/KolHubShell';
import {
  KolPrimaryButton,
  KolSecondaryButton,
  KolSectionLabel,
  KolBottomCta,
} from '@/components/kol/KolHubPrimitives';
import {
  KOL_APPLY_HREF,
  MERCHANT_PROMO_HREF,
  KOL_HUB_IMAGES,
} from '@/lib/kol-hub';

const VALUE_CARDS = [
  {
    icon: TrendingUp,
    title: '商戶：提升客量與預約',
    description: '連結超過 2,000 名美容及生活類創作者，以真實分享建立口碑，精準觸達目標顧客。',
  },
  {
    icon: Megaphone,
    title: '商戶：告別生硬廣告',
    description: '以真實療程體驗與短片內容，減輕顧客疑慮，提升門市查詢與預約意欲。',
  },
  {
    icon: Network,
    title: '商戶：一站式跟進',
    description: '由內容構思、KOL 配對、拍攝到成效追蹤，平台協助統籌，您專注接待客人。',
  },
  {
    icon: Sparkles,
    title: 'KOL：免費體驗優質療程',
    description: '有機會試做皮秒、HIFU、水光針等高階療程，親身體驗後再創作真實內容。',
  },
  {
    icon: MessageCircle,
    title: 'KOL：專人 WhatsApp 配對',
    description: '登記後由專員跟進，主動配對合適合作，體驗之餘亦可獲拍攝津貼。',
  },
  {
    icon: ShieldCheck,
    title: 'KOL：嚴選商戶保障',
    description: '平台嚴選優質美容院，拒絕劣質硬銷，守護您的個人品牌與口碑。',
  },
];

const SOLUTIONS = [
  {
    icon: Camera,
    title: 'KOL 體驗與評測',
    description: '門市探店、療程真實評測、平面拍攝，以至活動現場紀錄，全面覆蓋。',
  },
  {
    icon: Clapperboard,
    title: '社交平台短片',
    description: '專為 IG Reels、小紅書、YouTube Shorts 策劃短影音，三秒抓住注意力。',
  },
  {
    icon: Film,
    title: '品牌宣傳片製作',
    description: '影院級形象宣傳片，提升品牌質感與業界專業形象。',
  },
  {
    icon: Mic2,
    title: '節目主播培訓',
    description: '協助打造 YouTube 美妝專題節目，培養具影響力的美容主播。',
  },
];

const TIERS = [
  {
    name: 'Nano KOL',
    followers: '1K–10K',
    engagement: '8–15%',
    best: '口碑推廣',
    tip: '真實感強、信任度高，適合大量口碑種籽推廣。',
  },
  {
    name: 'Micro KOL',
    followers: '10K–100K',
    engagement: '5–8%',
    best: '精準觸達',
    tip: '受眾精準、性價比高，適合產品評測與精準推廣。',
  },
  {
    name: 'Mid-tier KOL',
    followers: '100K–500K',
    engagement: '3–5%',
    best: '品牌知名度',
    tip: '知名度與互動兼備，適合新品發佈與品牌提升。',
  },
  {
    name: 'Macro KOL',
    followers: '500K–1M',
    engagement: '1–3%',
    best: '大規模曝光',
    tip: '適合品牌形象塑造與大型推廣活動。',
  },
  {
    name: 'Mega KOL',
    followers: '1M+',
    engagement: '0.5–1.5%',
    best: '全港宣傳',
    tip: '適合品牌大使及年度大型合作。',
  },
];

const STATS = [
  { value: '10,000+', label: '美容及生活類創作者網絡' },
  { value: '500+', label: '美容院及美妝推廣項目' },
  { value: '98%', label: '創作者再次合作與商戶續約意願' },
];

const HERO_IMAGES = [
  { src: KOL_HUB_IMAGES.salonStorefront, alt: '美容院店面', rotate: '-rotate-2' },
  { src: KOL_HUB_IMAGES.creatorSelfie, alt: '內容創作者拍攝', rotate: 'rotate-2' },
  { src: KOL_HUB_IMAGES.facialTreatment, alt: '面部護理體驗', rotate: 'rotate-1' },
  { src: KOL_HUB_IMAGES.skincareFlatlay, alt: '護膚品陳列', rotate: '-rotate-1' },
];

export default function KolHubHomePage() {
  return (
    <KolHubShell>
      <HeroSection />
      <ValueSection />
      <SolutionsSection />
      <TiersSection />
      <ProofSection />
      <KolBottomCta
        title="準備好開始美容推廣合作？"
        description={
          <>
            別再浪費時間與預算。
            <br className="hidden sm:block" />
            立即加入 Beauty100 的創作者與商戶推廣網絡。
          </>
        }
        primaryHref={KOL_APPLY_HREF}
        primaryLabel="KOL：立即登記"
        secondaryHref={MERCHANT_PROMO_HREF}
        secondaryLabel="商戶：預約推廣諮詢"
      />
    </KolHubShell>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/90 via-white to-white">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-20 left-[12%] w-3 h-3 rounded-sm bg-rose-200/70" />
        <div className="absolute top-32 right-[18%] w-2.5 h-2.5 rounded-full bg-rose-300/50" />
        <div className="absolute bottom-28 left-[30%] w-2 h-2 rounded-sm bg-rose-200/60" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20">
        {/* Desktop floating collage around center copy */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <FloatImage
            src={HERO_IMAGES[0].src}
            alt={HERO_IMAGES[0].alt}
            className="left-0 top-16 w-[200px] aspect-[4/5] -rotate-3"
          />
          <FloatImage
            src={HERO_IMAGES[1].src}
            alt={HERO_IMAGES[1].alt}
            className="right-0 top-10 w-[190px] aspect-[4/5] rotate-3"
          />
          <FloatImage
            src={HERO_IMAGES[2].src}
            alt={HERO_IMAGES[2].alt}
            className="left-8 bottom-10 w-[180px] aspect-[4/5] rotate-2"
          />
          <FloatImage
            src={HERO_IMAGES[3].src}
            alt={HERO_IMAGES[3].alt}
            className="right-6 bottom-8 w-[185px] aspect-[4/5] -rotate-2"
          />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-100 px-4 py-1.5 rounded-full mb-5">
            <Sparkles className="w-4 h-4" aria-hidden />
            美容「熱店 × 創作者合作」推廣平台
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
            告別無效廣告！
            <span className="block mt-2 text-rose-700">全港專注美容的創作者推廣平台</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed text-balance">
            商戶希望提升客量，KOL 希望獲得優質合作？
            <br className="hidden sm:block" />
            我們以精準企劃，連結美容院與內容創作者。
          </p>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-600">
            {['精準推廣方案', '免費體驗優質療程', '拍攝津貼清晰透明', '專人 WhatsApp 配對'].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <KolPrimaryButton href={KOL_APPLY_HREF}>KOL：立即登記接合作</KolPrimaryButton>
            <KolSecondaryButton href={MERCHANT_PROMO_HREF}>商戶：了解推廣方案</KolSecondaryButton>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:hidden max-w-lg mx-auto">
          {HERO_IMAGES.map((img) => (
            <div
              key={img.src}
              className={`relative aspect-[4/5] overflow-hidden rounded-2xl shadow-md border border-white ${img.rotate}`}
            >
              <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="45vw" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FloatImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  return (
    <div className={`absolute overflow-hidden rounded-[1.6rem] shadow-xl shadow-rose-100/80 border-4 border-white ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" sizes="200px" />
    </div>
  );
}

function ValueSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <KolSectionLabel>High Impact Value</KolSectionLabel>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            不玩虛招！以實力提升品牌與創作者價值
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            拒絕自吹自擂式行銷，打造真實口碑與可衡量的商業回報。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {VALUE_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-rose-100 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 inline-flex items-center justify-center mb-4">
                <card.icon className="w-5 h-5" aria-hidden />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionsSection() {
  return (
    <section className="py-16 sm:py-20 bg-rose-50/40">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <KolSectionLabel>Core Solutions</KolSectionLabel>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            全方位美容內容推廣方案
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            由社群口碑到品牌大片，精準觸達目標客群。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {SOLUTIONS.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white border border-rose-100/80 p-5 sm:p-6">
              <div className="w-11 h-11 rounded-xl bg-rose-600 text-white inline-flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5" aria-hidden />
              </div>
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TiersSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <KolSectionLabel>KOL Tiers</KolSectionLabel>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            如何選擇合適的 KOL 層級？
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            粉絲數量愈多，未必等於成效愈好。我們會按您的目標與行業特性，配對最適合的組合。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 hover:border-rose-200 hover:bg-rose-50/40 transition-colors duration-200"
            >
              <h3 className="text-base font-bold text-rose-700">{tier.name}</h3>
              <p className="mt-2 text-sm text-slate-700">粉絲：{tier.followers}</p>
              <p className="text-sm text-slate-700">互動率：{tier.engagement}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">最適合</p>
              <p className="text-sm font-medium text-slate-900">{tier.best}</p>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{tier.tip}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <KolPrimaryButton href={KOL_APPLY_HREF}>免費 KOL 配對諮詢／登記</KolPrimaryButton>
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  return (
    <section className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <KolSectionLabel>Social Proof</KolSectionLabel>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            用實戰數據說話
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            持續更新企劃，協助品牌與創作者發揮最大價值。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center rounded-2xl bg-white border border-slate-100 px-4 py-8">
              <p className="text-3xl sm:text-4xl font-extrabold text-rose-600 tracking-tight">{stat.value}</p>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">{stat.label}</p>
            </div>
          ))}
        </div>

        <blockquote className="mt-10 max-w-2xl mx-auto text-center rounded-2xl bg-white border border-rose-100 px-6 py-8">
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-balance">
            「登記後第三日便收到 WhatsApp，安排試做皮秒療程。過程沒有硬銷，拍攝順利，還獲額外稿費。」
          </p>
          <footer className="mt-4 text-sm font-medium text-rose-600">—— Beauty Creator @Chloe_skincare</footer>
        </blockquote>
      </div>
    </section>
  );
}
