'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import dynamic from 'next/dynamic';
import { Menu, X } from 'lucide-react';

const AdminSidebar = dynamic(() => import('@/components/AdminSidebar'), {
  ssr: false,
  loading: () => <div className="w-60 h-full" style={{ background: 'rgba(15,23,42,0.97)' }} />,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoadingAuth } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #334155 100%)' }}>
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-cyan-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}>
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-50"
          style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(6,182,212,0.2)' }}>
          <div className="flex items-center h-full px-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="ml-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #0e7490)' }}>
                <span className="text-white text-[14px] font-bold">B</span>
              </div>
              <span className="font-bold text-white text-sm tracking-tight">BEAUTY 管理後台</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed top-14 left-0 right-0 bottom-0 z-40 overflow-y-auto" style={{ background: 'rgba(15,23,42,0.97)' }}>
            <AdminSidebar isMobile={true} onClose={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pt-14 md:pt-0">
          {children}
        </div>
      </div>
    </>
  );
}
