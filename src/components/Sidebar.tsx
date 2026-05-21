'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Store,
  FileText,
  CheckSquare,
  LogOut,
  Sparkles,
  Shield,
  Activity,
  Settings,
  Home,
  MessageSquare,
  UserCog,
  Megaphone,
  Package
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

interface SidebarProps {
  userRole?: string;
  hasApprovedProfile?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ userRole: userRoleProp, hasApprovedProfile, isMobile = false, onClose = () => {} }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const { user } = useAuth();

  // Resolve role from multiple sources
  const userRole = userRoleProp
    || (user as any)?.role
    || (user as any)?.user_metadata?.role
    || undefined;

  useEffect(() => {
    if (userRole !== 'admin') return;
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

    // Re-fetch when navigating back to sidebar (e.g. after approving)
    const interval = setInterval(fetchPending, 30000);

    return () => { cancelled = true; clearInterval(interval); };
  }, [userRole, pathname]);

  const isActive = (path: string) => pathname.includes(path);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleNavClick = () => {
    if (isMobile) onClose();
  };

  const isAdmin = userRole === 'admin';

  const merchantLinks = [
    { name: '申請入駐', href: '/merchant-onboarding', icon: FileText, show: true },
    { name: '申請狀態', href: '/application-status', icon: CheckSquare, show: true },
    { name: '我的美容院', href: '/salon-profile', icon: Store, show: hasApprovedProfile || isAdmin },
    { name: '我的療程', href: '/my-treatments', icon: Package, show: hasApprovedProfile || isAdmin },
    { name: 'KOL 推廣', href: '/kol-promotion', icon: Megaphone, show: true },
  ].filter(l => l.show);

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
            ? 'text-rose-600'
            : 'text-slate-500 hover:text-slate-700'
        }`}
        style={active ? {
          background: 'linear-gradient(135deg, rgba(254,205,211,0.5), rgba(251,207,232,0.4))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(253,164,175,0.3)'
        } : {}}
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
            active ? 'shadow-sm' : 'group-hover:bg-slate-50'
          }`}
          style={active ? { background: 'linear-gradient(135deg, #f472b6, #e11d48)', boxShadow: '0 2px 8px rgba(225,29,72,0.25)' } : {}}>
            <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
          </div>
          <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{link.name}</span>
        </div>
        {link.badge && (
          <span className="text-white text-sm font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
            style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}>
            {link.badge}
          </span>
        )}
      </Link>
    );
  };

  const displayName = (user as any)?.user_metadata?.full_name || (user as any)?.full_name || user?.email?.split('@')[0] || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className={`${isMobile ? 'w-full' : 'w-60'} bg-white/95 ${!isMobile && 'border-r'} border-rose-50 ${isMobile ? 'min-h-auto' : 'min-h-screen'} flex flex-col`}
      style={{ backdropFilter: 'blur(20px)' }}>
      {/* Logo */}
      {!isMobile && (
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-rose-200/50"
              style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}>
              <Sparkles className="text-white w-[18px] h-[18px]" />
            </div>
            <div>
              <h1 className="text-slate-800 font-bold text-base leading-tight tracking-tight">BEAUTY</h1>
              <p className="text-rose-300 text-[14px] leading-none mt-0.5 font-medium">商戶入駐平台</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
        {/* Merchant Section */}
        {(userRole !== 'marketing') && (
          <div>
            <p className="text-rose-300 text-[14px] font-bold uppercase tracking-widest px-3 mb-2">我的美容院</p>
            <div className="space-y-0.5">
              {merchantLinks.map(link => <NavLink key={link.href} link={link as any} />)}
            </div>
          </div>
        )}

        {/* Admin Section */}
        {(userRole === 'admin' || userRole === 'marketing') && (
          <div>
            <p className="text-rose-300 text-[14px] font-bold uppercase tracking-widest px-3 mb-2">管理後台</p>
            <div className="space-y-0.5">
              {adminLinks.map(link => <NavLink key={link.href} link={link as any} />)}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom: User + Logout */}
      {!isMobile && (
        <div className="px-3 pb-4 pt-3 border-t border-rose-50/80 space-y-1">
          {user && (
            <Link
              href="/settings"
              onClick={handleNavClick}
              prefetch={false}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50/50 transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #f9a8d4, #e11d48)' }}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700 truncate leading-tight">{displayName}</p>
                <p className="text-[12px] text-slate-400 truncate">{user.email}</p>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-400 flex-shrink-0 transition-colors" />
            </Link>
          )}
          <Link
            href="/"
            onClick={handleNavClick}
            prefetch={false}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 text-sm font-medium group"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-rose-100 transition-colors">
              <Home className="w-3.5 h-3.5" />
            </div>
            <span>返回主頁</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 text-sm font-medium group"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <span>登出</span>
          </button>
        </div>
      )}

      {/* Mobile Logout */}
      {isMobile && (
        <div className="p-3 border-t border-rose-50 mt-auto space-y-1">
          <Link
            href="/"
            onClick={handleNavClick}
            prefetch={false}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-rose-500 hover:bg-rose-50 transition-all duration-200 font-semibold text-sm"
          >
            <Home className="w-4 h-4" />
            <span>返回主頁</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-rose-500 hover:bg-rose-50 transition-all duration-200 font-semibold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>登出</span>
          </button>
        </div>
      )}
    </div>
  );
}
