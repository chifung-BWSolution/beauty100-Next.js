'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Sparkles } from 'lucide-react';
import MerchantSignupForm from '@/components/MerchantSignupForm';

export default function MerchantSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    userEmail: string;
    userFullName: string;
    userId: string;
    applicationType: string;
    claimedSalonData: any;
    initialDistricts: { id: string; name: string }[];
  } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace('/login');
        return;
      }

      const applicationType = searchParams.get('type') || 'new';
      const salonParam = searchParams.get('salon');
      const claimedSalonData = salonParam
        ? (() => { try { return JSON.parse(decodeURIComponent(salonParam)); } catch { return null; } })()
        : null;

      const { data: districtsRows } = await supabase
        .from('districts')
        .select('id, name')
        .order('sort_order', { ascending: true });

      const districtList = (districtsRows || []).map((r: any) => ({ id: r.id, name: r.name }));

      setUserData({
        userEmail: session.user.email || '',
        userFullName: session.user.user_metadata?.full_name || '',
        userId: session.user.id,
        applicationType,
        claimedSalonData,
        initialDistricts: districtList,
      });
      setLoading(false);
    }).catch(() => router.replace('/login'));
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="p-4 md:p-8 min-h-screen"
      style={{ background: 'linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #f0f9ff 100%)' }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-rose-200/50"
              style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">申請加入平台</h1>
              <p className="text-slate-400 text-sm">立即加入，讓更多客戶發現您的美容院</p>
            </div>
          </div>
        </div>

        <MerchantSignupForm
          applicationType={userData!.applicationType}
          claimedSalonData={userData!.claimedSalonData}
          userEmail={userData!.userEmail}
          userFullName={userData!.userFullName}
          userId={userData!.userId}
          initialDistricts={userData!.initialDistricts}
        />
      </div>
    </div>
  );
}
