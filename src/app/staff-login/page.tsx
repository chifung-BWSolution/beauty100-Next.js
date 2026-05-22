'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Eye, EyeOff, LogIn, Home, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
        const role = profile?.role || session.user.user_metadata?.role;
        if (role === 'admin' || role === 'marketing') {
          router.push('/admin/dashboard');
          return;
        }
      }
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

      const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single();
      const role = profile?.role || data.user.user_metadata?.role;
      if (role !== 'admin' && role !== 'marketing') {
        await supabase.auth.signOut();
        setError('此帳號無法存取員工版面，請使用商戶登入頁面。');
        setLoading(false);
        return;
      }
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? '電郵或密碼錯誤，請重試。' : err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #334155 70%, #1e293b 100%)'}}>
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-cyan-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #334155 70%, #1e293b 100%)' }}>
      {/* Decorative blobs */}
      <div className="absolute top-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #06b6d4, #0e7490)' }} />
      <div className="absolute bottom-[-120px] left-[-120px] w-[450px] h-[450px] rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #22d3ee, #155e75)' }} />
      <div className="absolute top-1/2 right-1/3 w-[200px] h-[200px] rounded-full opacity-10 blur-2xl pointer-events-none" style={{ background: 'radial-gradient(circle, #67e8f9, #0891b2)' }} />

      <div className="w-full max-w-[480px] relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-base text-cyan-400 hover:text-cyan-300 font-medium mb-6 transition-colors">
          <Home className="w-5 h-5" />
          返回主頁
        </Link>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl shadow-xl shadow-slate-900/60 mb-5 bg-white p-3">
            <Image src="/images/beauty-100_logo.png" alt="Beauty 100" width={72} height={72} className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">員工登入</h1>
          <p className="text-lg text-cyan-400 mt-2 font-semibold">Staff Portal</p>
          <p className="text-base text-slate-400 mt-1">僅供管理員及市場推廣人員使用</p>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/30" style={{ background: 'rgba(30,41,59,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(100,116,139,0.3)' }}>
          <div className="px-7 pt-7 pb-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">員工專用入口</h2>
                <p className="text-sm text-slate-400">此入口僅供管理員及市場推廣人員使用</p>
              </div>
            </div>
          </div>

          <div className="px-7 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">電郵地址</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@example.com" required className="h-[52px] pl-12 rounded-xl border-slate-600 bg-slate-800/60 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20" autoComplete="email" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">密碼</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="請輸入密碼" required className="h-[52px] pl-12 pr-12 rounded-xl border-slate-600 bg-slate-800/60 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">{error}</div>}

              <Button type="submit" disabled={loading} className="w-full h-[52px] text-base font-bold rounded-xl text-white border-0 mt-2 shadow-lg shadow-cyan-900/30" style={{ background: 'linear-gradient(135deg, #06b6d4, #0e7490)' }}>
                {loading ? <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />登入中...</span> : <span className="flex items-center gap-2"><LogIn className="w-5 h-5" />員工登入</span>}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-700 text-center">
              <p className="text-base text-slate-400">
                如非員工，請使用{' '}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold">商戶登入</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
