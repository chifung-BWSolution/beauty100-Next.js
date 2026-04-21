'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { FileText, Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';
import ApplicationList from '@/components/ApplicationList';

export default function ApplicationStatusPage() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appList, setAppList] = useState<any[]>([]);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    let cancelled = false;
    supabase
      .from('salon_applications')
      .select('*')
      .eq('created_by', user.id)
      .order('created_date', { ascending: false })
      .then(({ data: applications }) => {
        if (cancelled) return;
        setAppList(applications || []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user, isLoadingAuth, router]);

  if (isLoadingAuth || !user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (appList.length === 0) {
    return (
      <div className="p-4 md:p-8 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-sm w-full text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-100"
            style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}
          >
            <FileText className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">尚未提交申請</h2>
          <p className="text-slate-400 text-sm mb-7 leading-relaxed">您還未提交申請，立即開始登記您的美容院。</p>
          <Link
            href="/merchant-signup"
            prefetch={false}
            className="flex items-center justify-center w-full h-12 rounded-2xl font-semibold text-white shadow-lg shadow-rose-200/50"
            style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
          >
            立即申請
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 md:p-8 min-h-screen"
      style={{ background: 'linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #f0f9ff 100%)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">申請狀態</h1>
            </div>
            <p className="text-slate-400 text-sm pl-12">追蹤您的美容院申請進度</p>
          </div>
          <Link
            href="/merchant-onboarding"
            prefetch={false}
            className="flex-shrink-0 flex items-center gap-1.5 h-10 rounded-xl font-semibold text-white shadow-md shadow-rose-200/50 px-4 text-sm"
            style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
          >
            <Plus className="w-4 h-4" />申請多間
          </Link>
        </div>

        <ApplicationList applications={appList} />
      </div>
    </div>
  );
}
