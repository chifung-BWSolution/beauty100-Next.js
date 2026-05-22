'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, Home, Mail, Lock, User } from 'lucide-react';
import Image from 'next/image';

const TABS = { login: 'login', signup: 'signup' };

export default function MemberLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState(TABS.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setCheckingSession(false), 3000);
    Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
    ])
      .then(async ({ data: { session } }: any) => {
        clearTimeout(timeout);
        if (session?.user) {
          const { data: member } = await supabase.from('members').select('id').eq('auth_user_id', session.user.id).single();
          if (member) {
            router.push('/');
          }
        }
        setCheckingSession(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setCheckingSession(false);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const { data: member } = await supabase.from('members').select('id').eq('auth_user_id', data.user.id).single();
      if (!member) {
        await supabase.auth.signOut();
        setError('此帳號不是會員帳號，請使用商戶登入。');
        setLoading(false);
        return;
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? '電郵或密碼錯誤，請重試。' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('密碼不一致，請重試。'); return; }
    if (password.length < 6) { setError('密碼最少需要 6 個字元。'); return; }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'member' } }
      });
      if (signUpError) throw signUpError;
      if (data.user) {
        await supabase.from('members').insert({
          auth_user_id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          phone: phone || null,
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
      <div className="fixed inset-0 flex items-center justify-center" style={{background: 'linear-gradient(160deg, #fff5f7 0%, #ffe4ec 30%, #ffd6e7 60%, #ffc8d6 100%)'}}>
        <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #fff5f7 0%, #ffe4ec 30%, #ffd6e7 60%, #ffc8d6 100%)' }}>
      {/* Decorative blobs */}
      <div className="absolute top-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-40 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #f9a8d4, #fce7f3)' }} />
      <div className="absolute bottom-[-120px] left-[-120px] w-[450px] h-[450px] rounded-full opacity-25 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #fbcfe8, #fdf2f8)' }} />
      <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] rounded-full opacity-20 blur-2xl pointer-events-none" style={{ background: 'radial-gradient(circle, #f472b6, #fce7f3)' }} />

      <div className="w-full max-w-[480px] relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-base text-rose-500 hover:text-rose-700 font-medium mb-6 transition-colors">
          <Home className="w-5 h-5" />
          返回主頁
        </Link>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl shadow-xl shadow-rose-200/60 mb-5 bg-white p-3">
            <Image src="/images/beauty-100_logo.png" alt="Beauty 100" width={72} height={72} className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">會員登入</h1>
          <p className="text-lg text-rose-500 mt-2 font-semibold">Member Portal</p>
          <p className="text-base text-slate-500 mt-1">登入即可預約療程及享受會員優惠</p>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-rose-200/50" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.8)' }}>
          <div className="flex p-2 gap-1 bg-rose-50/80 m-5 rounded-2xl">
            {[{ key: TABS.login, label: '登入' }, { key: TABS.signup, label: '免費註冊' }].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-3 text-base font-semibold rounded-xl transition-all duration-200 ${tab === t.key ? 'bg-white text-rose-600 shadow-sm shadow-rose-100' : 'text-slate-400 hover:text-slate-600'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="px-7 pb-8">
            {successMsg && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-2xl px-4 py-3 mb-5">{successMsg}</div>}

            {tab === TABS.login && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">電郵地址</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="h-[52px] pl-12 rounded-xl border-rose-100 bg-rose-50/40 text-base focus:border-rose-300" autoComplete="email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">密碼</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                    <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="請輸入密碼" required className="h-[52px] pl-12 pr-12 rounded-xl border-rose-100 bg-rose-50/40 text-base focus:border-rose-300" autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
                <Button type="submit" disabled={loading} className="w-full h-[52px] text-base font-bold rounded-xl shadow-lg shadow-rose-200/50 text-white border-0 mt-2" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>
                  {loading ? <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />登入中...</span> : <span className="flex items-center gap-2"><LogIn className="w-5 h-5" />會員登入</span>}
                </Button>
              </form>
            )}

            {tab === TABS.signup && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">姓名 <span className="text-rose-400">*</span></label>
                  <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" /><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="請輸入您的全名" required className="h-[52px] pl-12 rounded-xl border-rose-100 bg-rose-50/40 text-base" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">電郵地址 <span className="text-rose-400">*</span></label>
                  <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" /><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="h-[52px] pl-12 rounded-xl border-rose-100 bg-rose-50/40 text-base" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">電話號碼（選填）</label>
                  <div className="relative"><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="例：9123 4567" className="h-[52px] pl-5 rounded-xl border-rose-100 bg-rose-50/40 text-base" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">密碼 <span className="text-rose-400">*</span></label>
                  <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" /><Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="最少 6 個字元" required className="h-[52px] pl-12 pr-12 rounded-xl border-rose-100 bg-rose-50/40 text-base" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-300">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">確認密碼 <span className="text-rose-400">*</span></label>
                  <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" /><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次輸入密碼" required className="h-[52px] pl-12 rounded-xl border-rose-100 bg-rose-50/40 text-base" /></div>
                </div>
                {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
                <Button type="submit" disabled={loading} className="w-full h-[52px] text-base font-bold rounded-xl text-white border-0 mt-2" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>
                  {loading ? <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />註冊中...</span> : '立即免費註冊'}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-rose-100 text-center">
              <p className="text-base text-slate-500">
                商戶請使用{' '}
                <Link href="/login" prefetch={false} className="text-rose-500 hover:text-rose-600 font-bold">商戶登入</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
