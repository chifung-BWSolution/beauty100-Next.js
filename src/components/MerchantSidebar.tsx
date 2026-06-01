'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Store,
  FileText,
  CheckSquare,
  LogOut,
  Settings,
  Home,
  Megaphone,
  Package,
  Menu,
  X,
  Receipt,
  Wallet,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

interface MerchantSidebarProps {
  hasApprovedProfile?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function MerchantSidebar({ hasApprovedProfile, isMobile = false, onClose = () => {} }: MerchantSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const isActive = (path: string) => pathname.includes(path);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleNavClick = () => {
    if (isMobile) onClose();
  };

  const merchantLinks = [
    { name: '申請入駐', href: '/merchant-onboarding', icon: FileText, show: true },
    { name: '申請狀態', href: '/application-status', icon: CheckSquare, show: true },
    { name: '我的美容院', href: '/salon-profile', icon: Store, show: hasApprovedProfile },
    { name: '我的療程', href: '/my-treatments', icon: Package, show: hasApprovedProfile },
    { name: '訂單紀錄', href: '/merchant-orders', icon: Receipt, show: hasApprovedProfile },
    { name: '結算紀錄', href: '/merchant-payouts', icon: Wallet, show: hasApprovedProfile },
    { name: 'KOL 推廣', href: '/kol-promotion', icon: Megaphone, show: true },
  ].filter(l => l.show);

  const NavLink = ({ link }: { link: { name: string; href: string; icon: React.ComponentType<{ className?: string }> } }) => {
    const Icon = link.icon;
    const active = isActive(link.href);
    return (
      <Link
        href={link.href}
        onClick={handleNavClick}
        prefetch={false}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          active
            ? 'text-purple-600'
            : 'text-slate-500 hover:text-slate-700'
        }`}
        style={active ? {
          background: 'linear-gradient(135deg, rgba(233,213,255,0.5), rgba(243,232,255,0.4))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(168,85,247,0.2)'
        } : {}}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
          active ? 'shadow-sm' : 'group-hover:bg-slate-50'
        }`}
        style={active ? { background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 2px 8px rgba(109,40,217,0.25)' } : {}}>
          <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
        </div>
        <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{link.name}</span>
      </Link>
    );
  };

  const displayName = (user as any)?.user_metadata?.full_name || (user as any)?.full_name || user?.email?.split('@')[0] || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className={`${isMobile ? 'w-full' : 'w-60'} bg-white/95 ${!isMobile && 'border-r'} border-purple-50 ${isMobile ? 'min-h-auto' : 'min-h-screen'} flex flex-col`}
      style={{ backdropFilter: 'blur(20px)' }}>
      {/* Logo */}
      {!isMobile && (
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-white border border-purple-100">
              <Image src="/images/beauty-100_logo.png" alt="Beauty 100" width={28} height={28} className="object-contain" />
            </div>
            <div>
              <h1 className="text-slate-800 font-bold text-base leading-tight tracking-tight">BEAUTY</h1>
              <p className="text-purple-400 text-[14px] leading-none mt-0.5 font-medium">商戶平台</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
        <div>
          <p className="text-purple-300 text-[14px] font-bold uppercase tracking-widest px-3 mb-2">我的美容院</p>
          <div className="space-y-0.5">
            {merchantLinks.map(link => <NavLink key={link.href} link={link as any} />)}
          </div>
        </div>
      </nav>

      {/* Bottom: User + Logout */}
      {!isMobile && (
        <div className="px-3 pb-4 pt-3 border-t border-purple-50/80 space-y-1">
          {user && (
            <Link
              href="/settings"
              onClick={handleNavClick}
              prefetch={false}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50/50 transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #a78bfa, #6d28d9)' }}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700 truncate leading-tight">{displayName}</p>
                <p className="text-[12px] text-slate-400 truncate">{user.email}</p>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
            </Link>
          )}
          <Link
            href="/"
            onClick={handleNavClick}
            prefetch={false}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 text-sm font-medium group"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
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
        <div className="p-3 border-t border-purple-50 mt-auto space-y-1">
          <Link
            href="/"
            onClick={handleNavClick}
            prefetch={false}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-purple-500 hover:bg-purple-50 transition-all duration-200 font-semibold text-sm"
          >
            <Home className="w-4 h-4" />
            <span>返回主頁</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-purple-500 hover:bg-purple-50 transition-all duration-200 font-semibold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>登出</span>
          </button>
        </div>
      )}
    </div>
  );
}
