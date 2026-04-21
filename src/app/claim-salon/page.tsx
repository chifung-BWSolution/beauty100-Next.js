'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ClaimSalonClient from '@/components/ClaimSalonClient';

export default function ClaimSalonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialDistricts, setInitialDistricts] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace('/login');
        return;
      }

      const { data: districtsRows } = await supabase
        .from('shopify_products_cache')
        .select('district_id, district_name')
        .not('district_id', 'is', null);

      const districtMap: Record<string, { id: string; name: string }> = {};
      (districtsRows || []).forEach((r: any) => {
        if (r.district_id) districtMap[r.district_id] = { id: r.district_id, name: r.district_name };
      });

      setInitialDistricts(Object.values(districtMap));
      setLoading(false);
    }).catch(() => router.replace('/login'));
  }, [router]);

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">認領美容院</h1>
          <p className="text-slate-500 text-sm">搜尋並認領您的美容院</p>
        </div>
        <ClaimSalonClient initialDistricts={initialDistricts} />
      </div>
    </div>
  );
}
