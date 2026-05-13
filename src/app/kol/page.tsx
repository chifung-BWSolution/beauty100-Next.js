'use client';

import React, { useState } from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import {
  Sparkles, Users, Megaphone, HeadphonesIcon,
  ClipboardList, Search, UserCheck,
  CheckCircle2, ChevronDown, ChevronUp,
  ArrowRight, Gift,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   加入 KOL 實錄 — Creator Recruitment Landing Page
   ═══════════════════════════════════════════════════════════════ */

export default function KolJoinPage() {
  return (
    <PublicLayout>
      <div
        className="min-h-screen bg-white"
        style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
      >
        {/* ═══════════ 1. HERO ═══════════ */}
        <HeroSection />

        {/* ═══════════ 2. 加入我們的優勢 ═══════════ */}
        <AdvantagesSection />

        {/* ═══════════ 3. 加入方法 ═══════════ */}
        <ProcessSection />

        {/* ═══════════ 4. 我們正在尋找 ═══════════ */}
        <LookingForSection />

        {/* ═══════════ 5. 申請加入 Form ═══════════ */}
        <ApplicationFormSection />

        {/* ═══════════ 6. FAQ ═══════════ */}
        <FAQSection />

        {/* ═══════════ AD: Brand Cooperation Block ═══════════ */}
        <BrandCooperationBlock />

        {/* ═══════════ 7. Bottom CTA ═══════════ */}
        <BottomCTASection />
      </div>
    </PublicLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════════ */

function HeroSection() {
  const scrollToForm = () => {
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-rose-50">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-100/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-rose-100/30 to-transparent rounded-full translate-y-1/2 -translate-x-1/3" />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-6">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-medium text-teal-700">KOL 合作計劃</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          加入 KOL 實錄
        </h1>

        <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          分享你的真實體驗與專業觀點，成為我們的合作 KOL，一起創造更有影響力的美容內容。
        </p>

        <Button
          onClick={scrollToForm}
          className="mt-8 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-base rounded-full shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-200 transition-all"
          size="lg"
        >
          立即申請
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADVANTAGES SECTION
   ═══════════════════════════════════════════════════════════════ */

const ADVANTAGES = [
  {
    icon: Megaphone,
    title: '更多曝光機會',
    description: '你的內容將有機會在平台中被更多目標受眾看見，提升整體曝光與影響力。',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Sparkles,
    title: '品牌合作機會',
    description: '有機會參與美容、護膚、療程及健康生活相關合作，拓展更多商業可能性。',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Users,
    title: '建立專業形象',
    description: '透過持續產出真實內容，強化你的個人風格與專業定位。',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: HeadphonesIcon,
    title: '專人對接支援',
    description: '提交申請後，我們會有專員與你聯繫，協助了解合作方向與後續安排。',
    color: 'bg-teal-50 text-teal-600',
  },
];

function AdvantagesSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            加入我們的優勢
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            我們希望與具影響力、具真實分享能力的創作者合作，透過平台內容曝光、品牌對接與專人支援，讓你的內容價值被更多人看見。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADVANTAGES.map((adv) => (
            <div
              key={adv.title}
              className="rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-teal-100 transition-all duration-300 bg-white"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${adv.color} mb-4`}>
                <adv.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{adv.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{adv.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROCESS SECTION
   ═══════════════════════════════════════════════════════════════ */

const STEPS = [
  {
    step: 1,
    icon: ClipboardList,
    title: '填寫申請資料',
    description: '提交你的基本聯絡方式、社交平台與內容方向。',
  },
  {
    step: 2,
    icon: Search,
    title: '平台審核與了解',
    description: '我們會先了解你的內容定位與合作潛力。',
  },
  {
    step: 3,
    icon: UserCheck,
    title: '專員聯繫對接',
    description: '通過初步審核後，我們的專員將與你聯繫，進一步對接合作方式。',
  },
];

function ProcessSection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            加入方法
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            流程簡單清晰，只需提交基本資料，我們將安排專員與你跟進。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {STEPS.map((step, idx) => (
            <div key={step.step} className="relative text-center">
              {/* Connector line (visible on md+) */}
              {idx < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-teal-300 to-teal-100" />
              )}

              <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-200 mb-5">
                <step.icon className="w-8 h-8 text-teal-600" />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                  {step.step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOOKING FOR SECTION
   ═══════════════════════════════════════════════════════════════ */

const LOOKING_FOR = [
  '熱愛美容、護膚、化妝、療程、健康生活分享的創作者',
  '有真實體驗內容產出的 KOL / KOC',
  '擅長短影片、圖文、教學或心得分享內容',
  '希望建立長期合作關係的內容創作者',
];

function LookingForSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              我們正在尋找
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              如果你熱愛分享真實體驗、對美容與生活內容有自己的觀點，歡迎加入我們。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LOOKING_FOR.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-teal-50 hover:border-teal-100 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-slate-700 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APPLICATION FORM SECTION
   ═══════════════════════════════════════════════════════════════ */

function ApplicationFormSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    platformName: '',
    platformLink: '',
    followers: '',
    contentDirection: '',
    region: '',
    experience: '',
    introduction: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await supabase
        .from('kol_applications')
        .insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          platform_name: formData.platformName,
          platform_link: formData.platformLink,
          followers: formData.followers,
          content_direction: formData.contentDirection,
          region: formData.region,
          experience: formData.experience || null,
          introduction: formData.introduction,
        });

      if (dbError) throw dbError;


      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || '提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="application-form" className="py-16 sm:py-20 bg-gradient-to-b from-white to-teal-50/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">申請已提交！</h2>
          <p className="text-base text-slate-600 leading-relaxed mb-3">
            提交後，我們的專員將盡快與你聯繫及對接合作詳情。
          </p>
          <p className="text-sm text-slate-500">
            如資料合適，我們將進一步與你溝通合作方向、內容形式與後續安排。
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="application-form" className="py-16 sm:py-20 bg-gradient-to-b from-white to-teal-50/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            申請加入
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            請填寫以下基本資料，我們將盡快安排專員與你聯繫。
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 lg:p-10 space-y-6"
        >
          {/* Row: Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="姓名"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="你的姓名"
            />
            <FormField
              label="聯絡電話"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="例：9123 4567"
              type="tel"
            />
          </div>

          {/* Email */}
          <FormField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="example@email.com"
            type="email"
          />

          {/* Row: Platform Name & Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="社交平台名稱"
              name="platformName"
              value={formData.platformName}
              onChange={handleChange}
              required
              placeholder="例：Instagram、YouTube、小紅書"
            />
            <FormField
              label="社交平台連結"
              name="platformLink"
              value={formData.platformLink}
              onChange={handleChange}
              required
              placeholder="https://..."
              type="url"
            />
          </div>

          {/* Row: Followers & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="粉絲數量"
              name="followers"
              value={formData.followers}
              onChange={handleChange}
              required
              placeholder="例：5,000"
            />
            <FormField
              label="所在地區"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
              placeholder="例：香港、台灣"
            />
          </div>

          {/* Content Direction */}
          <FormField
            label="主要內容方向"
            name="contentDirection"
            value={formData.contentDirection}
            onChange={handleChange}
            required
            placeholder="例：護膚心得、療程實測、化妝教學..."
          />

          {/* Experience (optional) */}
          <FormTextArea
            label="合作經驗（選填）"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="過往的品牌合作或商業內容經驗..."
            rows={3}
          />

          {/* Introduction */}
          <FormTextArea
            label="自我介紹 / 想加入的原因"
            name="introduction"
            value={formData.introduction}
            onChange={handleChange}
            required
            placeholder="簡單介紹你自己，以及你為什麼想加入 KOL 實錄..."
            rows={4}
          />

          {/* Submit */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-base rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              size="lg"
            >
              {submitting ? '提交中...' : '提交申請'}
            </Button>
          </div>

          {/* Follow-up message */}
          <p className="text-center text-sm text-slate-500 pt-2">
            提交後，我們的專員將盡快與你聯繫及對接合作詳情。
          </p>
        </form>
      </div>
    </section>
  );
}

/* ─── Form Field Components ─── */

function FormField({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = '',
  type = 'text',
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-colors"
      />
    </div>
  );
}

function FormTextArea({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = '',
  rows = 3,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-colors resize-none"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAQ SECTION
   ═══════════════════════════════════════════════════════════════ */

const FAQ_ITEMS = [
  {
    q: '提交後多久會收到聯繫？',
    a: '一般情況下，我們會在收到申請後盡快安排專員與你聯繫。',
  },
  {
    q: '粉絲數量不多也可以申請嗎？',
    a: '可以，我們更重視內容方向、真實分享能力與合作潛力。',
  },
  {
    q: '可以合作哪些內容方向？',
    a: '包括美容、護膚、化妝、療程、健康生活、真實體驗分享等相關內容。',
  },
  {
    q: '是否接受長期合作？',
    a: '我們歡迎有意建立長期合作關係的創作者加入。',
  },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            常見問題
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm sm:text-base font-medium text-slate-800">{item.q}</span>
                {openIdx === idx ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BRAND COOPERATION BLOCK (Minimal ad for KOL page)
   ═══════════════════════════════════════════════════════════════ */

function BrandCooperationBlock() {
  return (
    <section className="py-10 sm:py-12 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-amber-100/50 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                品牌合作機會
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                我們正與多個美容品牌合作中，成為KOL後即有機會獲得品牌試用及合作邀請。
              </p>
            </div>
          </div>
          <span className="absolute top-2 right-3 text-[12px] text-slate-300 uppercase tracking-wider">
            合作推廣
          </span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BOTTOM CTA SECTION
   ═══════════════════════════════════════════════════════════════ */

function BottomCTASection() {
  const scrollToForm = () => {
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-600 to-teal-700">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          準備好加入 KOL 實錄了嗎？
        </h2>
        <p className="mt-4 text-base sm:text-lg text-teal-100 max-w-xl mx-auto leading-relaxed">
          提交你的資料，讓我們更了解你，開啟更多合作與曝光機會。
        </p>
        <Button
          onClick={scrollToForm}
          className="mt-8 bg-white text-teal-700 hover:bg-teal-50 px-8 py-3 text-base rounded-full shadow-lg hover:shadow-xl transition-all font-semibold"
          size="lg"
        >
          立即申請
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </section>
  );
}
