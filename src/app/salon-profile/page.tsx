'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Sparkles, FileText } from 'lucide-react';
import Link from 'next/link';
import SalonProfileActions from '@/components/salon/SalonProfileActions';

export default function SalonProfilePage() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [salonList, setSalonList] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const role = (user as any)?.role || (user as any)?.user_metadata?.role;
    setIsAdmin(role === 'admin');

    let cancelled = false;
    Promise.resolve(
      supabase
        .from('salon_profiles')
        .select('*')
        .eq('created_by', user.id)
    )
      .then(({ data: profiles }) => {
        if (cancelled) return;
        setSalonList(profiles || []);
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

  if (salonList.length === 0 && !isAdmin && !loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-sm w-full text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-100"
            style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}
          >
            <FileText className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">尚未有資料</h2>
          <p className="text-slate-400 text-sm mb-7 leading-relaxed">
            您的申請需要獲批准後才可以編輯美容院資料。
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
    <div className="p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">我的美容院</h1>
          </div>
          <p className="text-slate-400 text-sm pl-12">管理及查看您的美容院頁面</p>
        </div>

        <SalonProfileActions profiles={salonList} />
      </div>
    </div>
  );
}
