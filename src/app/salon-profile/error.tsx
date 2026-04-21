'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SalonProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Salon profile error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center space-y-4 p-8">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
          <span className="text-rose-500 text-xl">!</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-700">頁面載入失敗</h2>
        <p className="text-sm text-slate-500 max-w-md">
          {error.message || '發生了意外錯誤，請重試。'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm hover:bg-rose-600 transition-colors"
          >
            重試
          </button>
          <button
            onClick={() => router.push('/merchant-onboarding')}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors"
          >
            返回主頁
          </button>
        </div>
      </div>
    </div>
  );
}
