'use client';

import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import KolApplicationForm from '@/components/kol/KolApplicationForm';
import { ArrowLeft } from 'lucide-react';

export default function KolApplyPage() {
  return (
    <PublicLayout>
      <div
        className="min-h-screen bg-white"
        style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link
            href="/kol"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回創作者合作
          </Link>
        </div>
        <KolApplicationForm />
      </div>
    </PublicLayout>
  );
}
