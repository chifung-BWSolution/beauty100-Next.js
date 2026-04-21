'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center space-y-4 p-8">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
          <span className="text-rose-500 text-xl">!</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-700">出現錯誤</h2>
        <p className="text-sm text-slate-500 max-w-md">
          {error.message || '發生了意外錯誤，請重試。'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm hover:bg-rose-600 transition-colors"
        >
          重試
        </button>
      </div>
    </div>
  );
}
