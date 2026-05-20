'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Menu, X } from 'lucide-react';

const Sidebar = dynamic(() => import('@/components/Sidebar'), {
  ssr: false,
  loading: () => <div className="w-64 h-full bg-white/50" />,
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoadingAuth } = useAuth();
  const pathname = usePathname();
  const [hasApprovedProfile, setHasApprovedProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const noSidebarPaths = ['/login', '/staff-login', '/member-login', '/explore-salons', '/topics', '/entertainment', '/kol', '/facial-care', '/anti-aging', '/body-shaping', '/skincare', '/healthy-diet', '/body-care', '/contact', '/suggest-salon-update', '/merchant', '/merchant-registration', '/merchant-signup', '/claim-salon', '/member-settings'];
  const noSidebarPrefixes = ['/topics/', '/admin/settings', '/kol/', '/entertainment/', '/facial-care/', '/anti-aging/', '/body-care/', '/skincare/', '/healthy-diet/', '/salon/', '/merchant-registration', '/merchant-signup', '/merchant-consulting', '/merchant-contact', '/merchant-cooperation', '/merchant-marketing'];
  
  // Hide sidebar for member role users - they should not see merchant sidebar
  const userRole = (user as any)?.role || (user as any)?.user_metadata?.role;
  const isMember = userRole === 'member';
  
  const hideSidebar = isMember || noSidebarPaths.includes(pathname) || pathname === '/' || noSidebarPrefixes.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    Promise.resolve(
      supabase
        .from('salon_profiles')
        .select('id')
        .eq('created_by', user.id)
        .limit(1)
    )
      .then(({ data }) => {
        if (!cancelled) setHasApprovedProfile(!!(data && data.length > 0));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (hideSidebar) {
    return <>{children}</>;
  }

  if (isLoadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'linear-gradient(160deg, #fdf2f8 0%, #faf5ff 60%, #f0f9ff 100%)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-rose-200 border-t-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(160deg, #fdf2f8 0%, #faf5ff 60%, #f0f9ff 100%)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar userRole={(user as any)?.role || (user as any)?.user_metadata?.role} hasApprovedProfile={hasApprovedProfile} />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-50"
        style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(251,207,232,0.4)' }}>
        <div className="flex items-center h-full px-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-500 hover:text-rose-500 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="ml-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}>
              <span className="text-white text-[14px] font-bold">B</span>
            </div>
            <span className="font-bold text-slate-700 text-sm tracking-tight">BEAUTY</span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto">
          <Sidebar userRole={(user as any)?.role || (user as any)?.user_metadata?.role} hasApprovedProfile={hasApprovedProfile} isMobile={true} onClose={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </div>
    </div>
  );
}
