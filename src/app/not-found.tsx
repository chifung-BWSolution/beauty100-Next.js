'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center space-y-4 p-8">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
          <span className="text-rose-500 text-xl">404</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-700">找不到頁面</h2>
        <p className="text-sm text-slate-500 max-w-md">
          您所查找的頁面不存在或已被移除。
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-rose-500 text-white rounded-lg text-sm hover:bg-rose-600 transition-colors"
        >
          返回首頁
        </Link>
      </div>
    </div>
  );
}
