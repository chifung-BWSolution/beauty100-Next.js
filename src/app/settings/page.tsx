'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import UserSettingsClient from '@/components/UserSettingsClient';

export default function UserSettingsPage() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      router.replace('/login');
    }
  }, [user, isLoadingAuth, router]);

  if (isLoadingAuth || !user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = (user as any)?.full_name || (user as any)?.user_metadata?.full_name || user.email?.split('@')[0] || '用戶';
  const email = user.email || '';
  const role = (user as any)?.role || (user as any)?.user_metadata?.role || 'merchant';

  return (
    <div className="min-h-screen bg-stone-50/60 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">帳號設定</h1>
          <p className="text-stone-400 text-sm mt-1">管理個人資料與安全設定</p>
        </div>

        <UserSettingsClient displayName={displayName} email={email} role={role} />
      </div>
    </div>
  );
}
