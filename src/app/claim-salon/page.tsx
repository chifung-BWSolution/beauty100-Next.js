'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ClaimSalonClient from '@/components/ClaimSalonClient';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClaimSalonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialDistricts, setInitialDistricts] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace('/login');
        return;
      }

      // Get districts from districts table
      const { data: districtsRows } = await supabase
        .from('districts')
        .select('name')
        .order('sort_order', { ascending: true });

      const uniqueDistricts = (districtsRows || []).map((r: any) => r.name) as string[];

      setInitialDistricts(uniqueDistricts);
      setLoading(false);
    }).catch(() => router.replace('/login'));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 -ml-2 text-slate-600 hover:text-slate-800 hover:bg-rose-50"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回上一頁
          </Button>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">認領美容院</h1>
          <p className="text-slate-500 text-sm">搜尋並認領您的美容院</p>
        </div>
        <ClaimSalonClient initialDistricts={initialDistricts} />
      </div>
    </div>
  );
}
