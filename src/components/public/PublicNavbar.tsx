'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, Heart, Settings, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import NavbarSearch from './NavbarSearch';

const NAV_ITEMS = [
  { label: '首頁', href: '/' },
  { label: '找美容院', href: '/explore-salons' },
  { label: '焦點話題', href: '/topics' },
  { label: '娛樂圈', href: '/entertainment' },
  { label: '面部護理', href: '/facial-care' },
  { label: '回復青春', href: '/anti-aging' },
  { label: '身體保養', href: '/body-care' },
  { label: '化妝護膚', href: '/skincare' },
  { label: '飲食健康', href: '/healthy-diet' },
  { label: 'KOL實錄', href: '/kol' },
  { label: '聯絡我們', href: '/contact' },
];

interface MemberInfo {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
}

export default function PublicNavbar({ activeHref }: { activeHref?: string } = {}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [memberLoading, setMemberLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMember = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: memberData } = await supabase
            .from('members')
            .select('id, full_name, avatar_url, email')
            .eq('auth_user_id', session.user.id)
            .single();
          if (memberData) {
            setMember(memberData);
          }
        }
      } catch (e) {
        // Silently fail
      } finally {
        setMemberLoading(false);
      }
    };
    checkMember();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setMember(null);
      } else if (event === 'SIGNED_IN' && session?.user) {
        supabase
          .from('members')
          .select('id, full_name, avatar_url, email')
          .eq('auth_user_id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setMember(data);
          });
      }
    });

    return () => { subscription?.unsubscribe(); };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMember(null);
    setDropdownOpen(false);
    window.location.href = '/';
  };

  const isActive = (href: string) => {
    if (activeHref) {
      if (href === '/') return activeHref === '/';
      return activeHref === href || activeHref.startsWith(href + '/');
    }
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const memberInitials = member?.full_name
    ? member.full_name.slice(0, 2)
    : member?.email?.slice(0, 1).toUpperCase() || '?';

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(251,207,232,0.35)',
        height: '60px',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/images/beauty-100_logo.png"
              alt="Beauty 100 Magazine"
              width={120}
              height={30}
              className="h-[38px] w-auto object-contain"
              priority
              quality={60}
            />
          </Link>

          {/* Desktop Nav — all items visible, no dropdowns */}
          <nav className="hidden xl:flex items-center gap-0" style={{ contain: 'layout' }}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative px-[10px] py-1.5 text-[14px] leading-tight rounded-md transition-all duration-200 whitespace-nowrap ${
                  isActive(item.href)
                    ? 'text-rose-600 font-semibold'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                {item.label}
                {/* Active underline indicator */}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-200 ${
                    isActive(item.href)
                      ? 'w-5 opacity-100'
                      : 'w-0 opacity-0 group-hover:w-3 group-hover:opacity-60'
                  }`}
                  style={{ background: 'linear-gradient(90deg, #f472b6, #e11d48)' }}
                />
              </Link>
            ))}
          </nav>

          {/* Right side: Search + Member area + Hamburger */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Search */}
            <NavbarSearch />

            {/* Show member avatar + name when logged in */}
            {!memberLoading && member ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="hidden sm:flex items-center gap-2 text-[14px] font-medium text-slate-700 px-3 py-[6px] rounded-full transition-all duration-200 hover:bg-rose-50 border border-rose-100"
                >
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.full_name || '會員'}
                      className="w-7 h-7 rounded-full object-cover border border-rose-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                      {memberInitials}
                    </div>
                  )}
                  <span className="max-w-[80px] truncate">{member.full_name || member.email?.split('@')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-rose-100/40 border border-rose-100/60 py-2 z-[100]">
                    <div className="px-4 py-2 border-b border-rose-50">
                      <p className="text-sm font-semibold text-slate-700 truncate">{member.full_name || '會員'}</p>
                      <p className="text-xs text-slate-400 truncate">{member.email}</p>
                    </div>
                    <Link
                      href="/member-settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      我的帳戶
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      登出
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Mobile Hamburger — xl breakpoint to match nav */}
            <button
              className="xl:hidden text-slate-600 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50/60"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Menu */}
      <div
        className={`xl:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[calc(100vh-60px)] opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{
          background: 'rgba(255,255,255,0.98)',
          borderTop: mobileMenuOpen ? '1px solid rgba(251,207,232,0.3)' : 'none',
        }}
      >
        <div className="px-4 py-3 space-y-0.5 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 text-sm rounded-lg transition-all duration-150 ${
                isActive(item.href)
                  ? 'text-rose-600 font-semibold bg-rose-50'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {/* Mobile login / member area */}
          <div className="pt-2 mt-2 border-t border-rose-100/50 space-y-2">
            {member ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2.5">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-rose-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                      {memberInitials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{member.full_name || '會員'}</p>
                    <p className="text-xs text-slate-400 truncate">{member.email}</p>
                  </div>
                </div>
                <Link
                  href="/member-settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-rose-600 rounded-full transition-all border border-rose-200 bg-white"
                >
                  <Settings className="w-4 h-4" />
                  我的帳戶
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-500 rounded-full transition-all border border-slate-200 bg-white w-full"
                >
                  <LogOut className="w-4 h-4" />
                  登出
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/member-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-rose-600 rounded-full transition-all border border-rose-200 bg-white"
                >
                  <Heart className="w-4 h-4" />
                  會員登入 / 登記
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
