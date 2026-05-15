'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import OnboardingActions from '@/components/OnboardingActions';

export default function MerchantOnboardingPage() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [applicationCount, setApplicationCount] = useState(0);

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    let cancelled = false;

    Promise.resolve(
      supabase
        .from('salon_applications')
        .select('id, status')
        .eq('created_by', user.id)
    )
      .then(({ data: applications }) => {
        if (cancelled) return;
        const allApplications = applications || [];
        setApplicationCount(allApplications.length);
        setHasPendingApplication(allApplications.some((a) => a.status === 'pending'));
        setDataLoading(false);
      })
      .catch(() => {
        if (!cancelled) setDataLoading(false);
      });

    return () => { cancelled = true; };
  }, [user, isLoadingAuth, router]);

  if (isLoadingAuth || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="p-6 md:p-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 animate-pulse" />
              <div>
                <div className="h-5 w-24 bg-slate-100 rounded animate-pulse mb-1" />
                <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasPendingApplication) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-sm w-full text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-100"
            style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}
          >
            <Loader2 className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">申請審核中</h2>
          <p className="text-slate-500 text-sm mb-7 leading-relaxed">
            您有一個申請正在審核中，請等待審核完成後再提交新申請。
          </p>
          <Link
            href="/application-status"
            prefetch={false}
            className="flex items-center justify-center w-full h-12 rounded-2xl font-semibold text-white shadow-lg shadow-rose-200/50"
            style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
          >
            查看申請狀態
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-rose-200/50"
              style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">加入我們</h1>
              <p className="text-slate-400 text-sm">請選擇您想要的方式</p>
            </div>
          </div>

          <OnboardingActions applicationCount={applicationCount} />
        </div>
      </div>
    </div>
  );
}
