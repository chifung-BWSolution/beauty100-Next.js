'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!user) {
      router.replace('/staff-login');
      return;
    }

    const role = (user as any)?.role || (user as any)?.user_metadata?.role;
    if (role !== 'admin' && role !== 'marketing') {
      router.replace('/staff-login');
      return;
    }
    setAuthorized(true);
  }, [user, isLoadingAuth, router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return <><meta name="robots" content="noindex, nofollow" />{children}</>;
}
