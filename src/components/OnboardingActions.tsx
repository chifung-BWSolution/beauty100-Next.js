'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Search, ArrowRight } from 'lucide-react';

interface Props {
  applicationCount: number;
}

export default function OnboardingActions({ applicationCount }: Props) {
  const router = useRouter();

  return (
    <>
      {applicationCount > 0 && (
        <div
          className="mt-5 flex items-center justify-between p-4 rounded-2xl border border-emerald-100"
          style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
        >
          <p className="text-sm text-emerald-700 font-medium">
            您已有 {applicationCount} 間美容院申請，可以繼續申請更多。
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push('/application-status')}
            className="text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-sm ml-3 whitespace-nowrap rounded-xl"
          >
            查看申請
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div
          onClick={() => router.push('/merchant-signup?type=new')}
          className="group cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-rose-100/60 hover:-translate-y-1"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(251,207,232,0.4)',
            boxShadow: '0 4px 24px rgba(244,114,182,0.08)',
          }}
        >
          <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #f472b6, #e11d48)' }} />
          <div className="p-7">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' }}
            >
              <Plus className="w-7 h-7 text-rose-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">新增美容院</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              建立一間新的美容院，提供您的資料和服務資訊。
            </p>
            <div className="flex items-center gap-2 text-rose-500 text-sm font-semibold">
              <span>立即開始</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div
          onClick={() => router.push('/claim-salon')}
          className="group cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/60 hover:-translate-y-1"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(249,168,212,0.3)',
            boxShadow: '0 4px 24px rgba(236,72,153,0.06)',
          }}
        >
          <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #e879f9, #a855f7)' }} />
          <div className="p-7">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'linear-gradient(135deg, #fdf4ff, #fae8ff)' }}
            >
              <Search className="w-7 h-7 text-fuchsia-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">認領美容院</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              從我們的列表中認領一間已存在的美容院，補充完整資料。
            </p>
            <div className="flex items-center gap-2 text-fuchsia-500 text-sm font-semibold">
              <span>搜尋認領</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
