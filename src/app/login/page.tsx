'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, Eye, EyeOff, LogIn, Store, Star, ChevronRight, ArrowLeft, Mail, Lock, User, Home, AlertCircle } from 'lucide-react';

const TABS = { login: 'login', signup: 'signup' };

export default function UserLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState(TABS.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setCheckingSession(false), 3000);
    Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
    ])
      .then(async ({ data: { session } }: any) => {
        clearTimeout(timeout);
        if (session?.user) {
          const redirected = await redirectByRole(session.user);
          if (!redirected) {
            // Member already logged in - show upgrade modal
            setPendingUser(session.user);
            setShowUpgradeModal(true);
          }
        }
        setCheckingSession(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setCheckingSession(false);
      });
  }, []);

  const redirectByRole = async (user: any) => {
    const { data: profile } = await supabase.from('users').select('role, roles').eq('id', user.id).single();
    const roles: string[] = profile?.roles || (profile?.role ? [profile.role] : [user.user_metadata?.role || '']);
    const primaryRole = profile?.role || user.user_metadata?.role;

    // Ensure merchants/staff also have 'member' role for member features
    if ((roles.includes('merchant') || roles.includes('sub_merchant')) && !roles.includes('member')) {
      const updatedRoles = [...roles, 'member'];
      await supabase.from('users').update({ roles: updatedRoles }).eq('id', user.id);
    }

    if (roles.includes('admin') || roles.includes('marketing') || primaryRole === 'admin' || primaryRole === 'marketing') {
      router.push('/admin/dashboard');
    } else if (roles.includes('merchant') || roles.includes('sub_merchant') || primaryRole === 'merchant' || primaryRole === 'sub_merchant') {
      router.push('/merchant-onboarding');
    } else {
      // Non-merchant users: don't auto-redirect, let them see the upgrade modal
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const { data: profile } = await supabase.from('users').select('role, roles').eq('id', data.user.id).single();
      const roles: string[] = profile?.roles || (profile?.role ? [profile.role] : [data.user.user_metadata?.role || '']);
      const primaryRole = profile?.role || data.user.user_metadata?.role;

      if (roles.includes('admin') || roles.includes('marketing') || primaryRole === 'admin' || primaryRole === 'marketing') {
        await supabase.auth.signOut();
        setError('員工帳號請使用員工登入頁面。');
        setLoading(false);
        return;
      }
      // If user does NOT have merchant/sub_merchant role, ask if they want to upgrade
      if (!roles.includes('merchant') && !roles.includes('sub_merchant') && primaryRole !== 'merchant' && primaryRole !== 'sub_merchant') {
        setPendingUser(data.user);
        setShowUpgradeModal(true);
        setLoading(false);
        return;
      }
      await redirectByRole(data.user);
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? '電郵或密碼錯誤，請重試。' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToMerchant = async () => {
    if (!pendingUser) return;
    setUpgrading(true);
    try {
      // Get current roles
      const { data: profile } = await supabase.from('users').select('roles').eq('id', pendingUser.id).single();
      const currentRoles: string[] = profile?.roles || ['member'];
      const updatedRoles = [...currentRoles, 'merchant'];

      // Update user roles to include merchant
      await supabase.from('users').update({
        roles: updatedRoles,
        role: 'merchant',
      }).eq('id', pendingUser.id);

      setShowUpgradeModal(false);
      setPendingUser(null);
      router.push('/merchant-onboarding');
    } catch (err: any) {
      setError('升級失敗，請稍後再試。');
      setShowUpgradeModal(false);
      await supabase.auth.signOut();
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelUpgrade = () => {
    setShowUpgradeModal(false);
    setPendingUser(null);
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedRole) { setError('請選擇您的身份。'); return; }
    if (password !== confirmPassword) { setError('密碼不一致，請重試。'); return; }
    if (password.length < 6) { setError('密碼最少需要 6 個字元。'); return; }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: selectedRole } }
      });
      if (signUpError) throw signUpError;
      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role: selectedRole,
        });
      }
      setSuccessMsg('註冊成功！請檢查您的電郵以確認帳號，然後登入。');
      setTab(TABS.login);
    } catch (err: any) {
      setError(err.message.includes('already registered') ? '此電郵已被註冊，請直接登入。' : err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fdf4ff 100%)'}}>
        <div className="w-8 h-8 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 40%, #fdf4ff 100%)' }}>
      <div className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #f9a8d4, #fbcfe8)' }} />
      <div className="absolute bottom-[-100px] left-[-100px] w-[350px] h-[350px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #e879f9, #f0abfc)' }} />

      <div className="w-full max-w-[420px] relative z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-rose-400 hover:text-rose-600 font-medium mb-6 transition-colors">
          <Home className="w-4 h-4" />
          返回主頁
        </Link>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg shadow-rose-200/50 mb-4" style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">BEAUTY</h1>
          <p className="text-sm text-rose-400/80 mt-1 font-medium">商戶入駐平台</p>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-rose-100/60" style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.75)' }}>
          <div className="flex p-2 gap-1 bg-rose-50/70 m-4 rounded-2xl">
            {[{ key: TABS.login, label: '登入' }, { key: TABS.signup, label: '免費註冊' }].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${tab === t.key ? 'bg-white text-rose-600 shadow-sm shadow-rose-100' : 'text-slate-400 hover:text-slate-600'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="px-6 pb-7">
            {successMsg && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-2xl px-4 py-3 mb-5">{successMsg}</div>}

            {tab === TABS.login && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">電郵地址</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="h-12 pl-10 rounded-xl border-rose-100 bg-rose-50/40 text-sm focus:border-rose-300" autoComplete="email" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">密碼</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                    <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="請輸入密碼" required className="h-12 pl-10 pr-11 rounded-xl border-rose-100 bg-rose-50/40 text-sm focus:border-rose-300" autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
                <Button type="submit" disabled={loading} className="w-full h-12 font-semibold rounded-xl shadow-lg shadow-rose-200/50 text-white border-0 mt-2" style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}>
                  {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />登入中...</span> : <span className="flex items-center gap-2"><LogIn className="w-4 h-4" />登入</span>}
                </Button>
              </form>
            )}

            {tab === TABS.signup && (
              <form onSubmit={handleSignup} className="space-y-4">
                {!selectedRole ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-600 mb-1">請選擇您的身份</p>
                    {[
                      { role: 'merchant', icon: Store, label: '美容院商家', desc: '擁有美容院，希望入駐平台', gradient: 'from-rose-50 to-pink-50', border: 'border-rose-200 hover:border-rose-300', iconBg: 'bg-rose-100', iconColor: 'text-rose-500' },
                    ].map(item => (
                      <button key={item.role} type="button" onClick={() => setSelectedRole(item.role)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 bg-gradient-to-r ${item.gradient} ${item.border} hover:shadow-md transition-all duration-200 text-left group hover:scale-[1.01]`}>
                        <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{item.label}</p>
                          <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <button type="button" onClick={() => setSelectedRole('')} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-rose-100 text-rose-600`}>
                        <Store className="w-3.5 h-3.5" />
                        美容院商家
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">姓名 <span className="text-rose-400">*</span></label>
                      <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" /><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="請輸入您的全名" required className="h-12 pl-10 rounded-xl border-rose-100 bg-rose-50/40 text-sm" /></div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">電郵地址 <span className="text-rose-400">*</span></label>
                      <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" /><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="h-12 pl-10 rounded-xl border-rose-100 bg-rose-50/40 text-sm" /></div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">密碼 <span className="text-rose-400">*</span></label>
                      <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" /><Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="最少 6 個字元" required className="h-12 pl-10 pr-11 rounded-xl border-rose-100 bg-rose-50/40 text-sm" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-300">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">確認密碼 <span className="text-rose-400">*</span></label>
                      <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" /><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次輸入密碼" required className="h-12 pl-10 rounded-xl border-rose-100 bg-rose-50/40 text-sm" /></div>
                    </div>
                    {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
                    <Button type="submit" disabled={loading} className="w-full h-12 font-semibold rounded-xl text-white border-0 mt-2" style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}>
                      {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />註冊中...</span> : '立即免費註冊'}
                    </Button>
                  </>
                )}
                {!selectedRole && error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-rose-50 text-center">
              <p className="text-sm text-slate-400">
                員工請使用{' '}
                <Link href="/staff-login" prefetch={false} className="text-rose-500 hover:text-rose-600 font-semibold">員工登入</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade to Merchant Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-[400px] rounded-3xl p-6 shadow-2xl" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,255,255,0.8)' }}>
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}>
              <Store className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 text-center mb-2">申請成為商戶？</h2>
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
              偵測到您目前是會員帳號。是否同時申請成為商戶？<br />
              成為商戶後，您可以入駐平台管理美容院，同時保留會員功能。
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleUpgradeToMerchant}
                disabled={upgrading}
                className="w-full h-12 font-semibold rounded-xl text-white border-0 shadow-lg shadow-rose-200/50"
                style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
              >
                {upgrading ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />處理中...</span>
                ) : (
                  <span className="flex items-center gap-2"><Store className="w-4 h-4" />確定，申請成為商戶</span>
                )}
              </Button>
              <button
                onClick={handleCancelUpgrade}
                disabled={upgrading}
                className="w-full h-11 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                暫時不需要
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
