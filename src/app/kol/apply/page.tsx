'use client';

import Link from 'next/link';
import KolHubShell from '@/components/kol/KolHubShell';
import KolApplicationForm from '@/components/kol/KolApplicationForm';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function KolApplyPage() {
  return (
    <KolHubShell>
      <section className="bg-gradient-to-b from-rose-50 via-white to-white pt-8 pb-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/kol"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回KOL推廣
          </Link>

          <div className="mt-8 text-center">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-100 px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-4 h-4" aria-hidden />
              Call for Creators
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
              發揮您的 IG 影響力！
              <span className="block mt-2 text-rose-700">專人配對合作，體驗優質療程兼賺稿費</span>
            </h1>
            <p className="mt-3 text-base text-slate-600 leading-relaxed text-balance">
              全港 Beauty KOL 專屬合作平台。只要您願意真誠分享，歡迎立即登記。
            </p>
            <ul className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-slate-600">
              {['專人 WhatsApp 配對', '免費體驗優質療程', '商業拍攝津貼／稿費', '零中介費'].map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <KolApplicationForm />
    </KolHubShell>
  );
}
