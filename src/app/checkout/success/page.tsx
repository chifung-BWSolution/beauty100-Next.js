'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';

type VerificationStatus = 'loading' | 'paid' | 'failed' | 'error';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const { user, isLoadingAuth } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      setStatus('error');
      setErrorMsg('請先登入');
      return;
    }
    if (!sessionId) {
      setStatus('error');
      setErrorMsg('缺少 session 資訊');
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const { data, error } = await supabase.functions.invoke(
          'supabase-functions-verify-checkout-session',
          {
            body: { session_id: sessionId },
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          }
        );

        if (error) {
          console.error('Verification error:', error);
          setStatus('error');
          setErrorMsg('無法驗證付款狀態');
          return;
        }

        if (data?.payment_status === 'paid') {
          setStatus('paid');
          await clearCart();
        } else if (data?.status === 'expired') {
          setStatus('failed');
          setErrorMsg('付款 session 已過期');
        } else {
          setStatus('failed');
          setErrorMsg('付款未成功，請重新嘗試');
        }
      } catch (err: any) {
        console.error('Verify error:', err);
        setStatus('error');
        setErrorMsg(err.message || '驗證失敗');
      }
    };

    verifyPayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingAuth, user, sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md w-full text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-rose-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">正在驗證付款...</h2>
              <p className="text-slate-500">請稍候，我們正在確認你的付款狀態</p>
            </>
          )}

          {status === 'paid' && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">付款成功！</h2>
              <p className="text-slate-500 mb-2">感謝你的購買</p>
              {sessionId && (
                <p className="text-xs text-slate-400 mb-2">
                  訂單編號：{sessionId.slice(0, 8).toUpperCase()}
                </p>
              )}
              <p className="text-sm text-slate-400 mb-6">
                我們會透過 WhatsApp 聯絡你確認療程預約詳情
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/">
                  <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full">
                    返回首頁
                  </Button>
                </Link>
                <Link href="/my-orders">
                  <Button variant="outline" className="w-full rounded-full">
                    查看我的訂單
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">付款未成功</h2>
              <p className="text-slate-500 mb-6">{errorMsg || '你的卡可能已被拒絕，請重新嘗試'}</p>
              <div className="flex flex-col gap-3">
                <Link href="/checkout">
                  <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full">
                    重新付款
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full rounded-full">
                    返回首頁
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">無法確認付款</h2>
              <p className="text-slate-500 mb-6">{errorMsg || '請稍後查看你的訂單紀錄'}</p>
              <div className="flex flex-col gap-3">
                <Link href="/my-orders">
                  <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full">
                    查看我的訂單
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full rounded-full">
                    返回首頁
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
