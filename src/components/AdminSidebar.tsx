'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Store,
  CheckSquare,
  LogOut,
  Shield,
  Activity,
  Settings,
  Home,
  MessageSquare,
  UserCog,
  ArrowLeftRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

interface AdminSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isMobile = false, onClose = () => {} }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchPending = async () => {
      try {
        const [appsResult, editsResult] = await Promise.allSettled([
          supabase.from('salon_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('salon_profile_versions').select('id', { count: 'exact', head: true }).eq('status', 'pending_approval'),
        ]);
        if (cancelled) return;
        const appsCount = appsResult.status === 'fulfilled' ? ((appsResult.value as any).count ?? 0) : 0;
        const editsCount = editsResult.status === 'fulfilled' ? ((editsResult.value as any).count ?? 0) : 0;
        setPendingCount(appsCount + editsCount);
      } catch (e) {}
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);

    return () => { cancelled = true; clearInterval(interval); };
  }, [pathname]);

  const isActive = (path: string) => pathname.includes(path);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/staff-login');
  };

  const handleNavClick = () => {
    if (isMobile) onClose();
  };

  const adminLinks = [
    { name: '申請管理', href: '/admin/dashboard', icon: CheckSquare, badge: pendingCount > 0 ? pendingCount : null },
    { name: '表單查詢', href: '/admin/enquiries', icon: MessageSquare },
    { name: '所有美容院', href: '/admin/salons', icon: Store },
    { name: '用戶管理', href: '/admin/users', icon: Shield },
    { name: 'Staff 管理', href: '/admin/staff', icon: UserCog },
    { name: '用戶日誌', href: '/admin/logs', icon: Activity },
    { name: '系統設定', href: '/admin/settings', icon: Settings },
  ];

  const NavLink = ({ link }: { link: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: number | null } }) => {
    const Icon = link.icon;
    const active = isActive(link.href);
    return (
      <Link
        href={link.href}
        onClick={handleNavClick}
        prefetch={false}
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          active
            ? 'text-white'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
        style={active ? {
          background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(14,116,144,0.2))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(6,182,212,0.3)'
        } : {}}
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
            active ? 'shadow-sm' : 'group-hover:bg-slate-700/50'
          }`}
          style={active ? { background: 'linear-gradient(135deg, #06b6d4, #0e7490)', boxShadow: '0 2px 8px rgba(14,116,144,0.25)' } : {}}>
            <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
          </div>
          <span className={`text-sm ${active ? 'font-semibold text-cyan-300' : 'font-medium'}`}>{link.name}</span>
        </div>
        {link.badge && (
          <span className="text-white text-sm font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0e7490)' }}>
            {link.badge}
          </span>
        )}
      </Link>
    );
  };

  const displayName = (user as any)?.user_metadata?.full_name || (user as any)?.full_name || user?.email?.split('@')[0] || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'A';
  const userRole = (user as any)?.role || (user as any)?.user_metadata?.role;

  return (
    <div className={`${isMobile ? 'w-full' : 'w-60'} ${isMobile ? 'min-h-auto' : 'min-h-screen'} flex flex-col`}
      style={{ background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(20px)' }}>
      {/* Logo */}
      {!isMobile && (
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-white p-1">
              <Image src="/images/beauty-100_logo.png" alt="Beauty 100" width={28} height={28} className="object-contain" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight tracking-tight">BEAUTY</h1>
              <p className="text-cyan-400 text-[14px] leading-none mt-0.5 font-medium">管理後台</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
        <div>
          <p className="text-cyan-400/60 text-[14px] font-bold uppercase tracking-widest px-3 mb-2">管理後台</p>
          <div className="space-y-0.5">
            {adminLinks.map(link => <NavLink key={link.href} link={link as any} />)}
          </div>
        </div>
      </nav>

      {/* Bottom: User + Logout */}
      {!isMobile && (
        <div className="px-3 pb-4 pt-3 border-t border-slate-700/50 space-y-1">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #0e7490)' }}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate leading-tight">{displayName}</p>
                <p className="text-[12px] text-slate-400 truncate">{userRole === 'admin' ? '管理員' : '市場推廣'}</p>
              </div>
            </div>
          )}
          <Link
            href="/salon-profile"
            onClick={handleNavClick}
            prefetch={false}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-violet-300 hover:bg-violet-900/30 hover:text-violet-200 transition-all duration-200 text-sm font-medium group border border-violet-500/20 hover:border-violet-500/40"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-violet-900/30 transition-colors">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>
            <span>切換商戶平台</span>
          </Link>
          <Link
            href="/"
            onClick={handleNavClick}
            prefetch={false}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-all duration-200 text-sm font-medium group"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <Home className="w-3.5 h-3.5" />
            </div>
            <span>返回主頁</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all duration-200 text-sm font-medium group"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-red-900/30 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <span>登出</span>
          </button>
        </div>
      )}

      {/* Mobile Logout */}
      {isMobile && (
        <div className="p-3 border-t border-slate-700 mt-auto space-y-1">
          <Link
            href="/salon-profile"
            onClick={handleNavClick}
            prefetch={false}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-violet-300 hover:bg-violet-900/30 transition-all duration-200 font-semibold text-sm border border-violet-500/20"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>切換商戶平台</span>
          </Link>
          <Link
            href="/"
            onClick={handleNavClick}
            prefetch={false}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-cyan-400 hover:bg-slate-800 transition-all duration-200 font-semibold text-sm"
          >
            <Home className="w-4 h-4" />
            <span>返回主頁</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-red-400 hover:bg-red-900/30 transition-all duration-200 font-semibold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>登出</span>
          </button>
        </div>
      )}
    </div>
  );
}
