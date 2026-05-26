'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ShoppingCart, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, getCartTotal } = useCart();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Prevent double-call of fetchClientSecret (React StrictMode / re-renders)
  const fetchInProgressRef = useRef(false);
  const cachedSecretRef = useRef<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    if (!user || items.length === 0) {
      throw new Error('No user or empty cart');
    }
    
    // If we already have a cached secret, return it immediately
    if (cachedSecretRef.current) {
      return cachedSecretRef.current;
    }
    
    // If a fetch is already in progress, wait for it to complete
    if (fetchInProgressRef.current) {
      // Wait and poll for the cached result
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (!fetchInProgressRef.current) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
      if (cachedSecretRef.current) {
        return cachedSecretRef.current;
      }
      throw new Error('Failed to get client secret');
    }
    
    fetchInProgressRef.current = true;

    const paymentItems = items.map((item) => ({
      treatment_id: item.treatment_id,
      name: item.treatment?.name || '',
      original_price: item.treatment?.original_price || 0,
      promo_price: item.treatment?.promo_price || null,
      quantity: item.quantity,
      salon_profile_id: item.salon_profile_id || item.treatment?.salon_profile_id || null,
      image_url: item.treatment?.image_url || null,
      salon_name: item.salon_name || null,
      redeem_start_date: item.treatment?.redeem_start_date || null,
      redeem_end_date: item.treatment?.redeem_end_date || null,
    }));

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    const { data, error: fnError } = await supabase.functions.invoke('supabase-functions-create-payment-intent', {
      body: {
        items: paymentItems,
        customer_email: user.email,
        customer_name: (user as any).full_name || user.user_metadata?.full_name || '',
        return_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      },
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });

    if (fnError) {
      fetchInProgressRef.current = false;
      let errorMsg = 'Failed to create checkout session';
      try {
        if (fnError instanceof Error) {
          errorMsg = fnError.message || errorMsg;
        }
        if ((fnError as any).context) {
          const ctx = (fnError as any).context;
          if (typeof ctx.json === 'function') {
            const body = await ctx.json();
            errorMsg = body?.error || body?.message || errorMsg;
          }
        }
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    if (data?.error) {
      fetchInProgressRef.current = false;
      throw new Error(data.error);
    }

    setOrderId(data.orderId);
    setStripeSessionId(data.sessionId);
    cachedSecretRef.current = data.clientSecret;
    fetchInProgressRef.current = false;
    return data.clientSecret;
  }, [user, items]);

  useEffect(() => {
    if (!user || items.length === 0) {
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  }, [user, items.length]);

  const handlePaymentComplete = async () => {
    // onComplete fires when the embedded checkout session is complete.
    // Redirect to success page with the Stripe session ID for server-side verification.
    window.location.href = `/checkout/success?session_id=${stripeSessionId || orderId || ''}`;
  };

  // Not logged in
  if (!user) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center p-4 py-20">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">請先登入</h2>
            <p className="text-slate-500 mb-6">你需要登入才能進行結帳</p>
            <Link href="/member-login">
              <Button className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full px-8">
                前往登入
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }



  // Empty cart
  if (!isLoading && items.length === 0) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center p-4 py-20">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md w-full text-center">
            <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">購物車是空的</h2>
            <p className="text-slate-500 mb-6">瀏覽療程優惠，加入購物車</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full px-8">
                瀏覽療程
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <Link href="/" className="text-slate-500 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-slate-800">結帳</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-base font-semibold text-slate-800 mb-4">訂單摘要</h2>
            <div className="space-y-3">
              {items.map((item) => {
                const treatment = item.treatment;
                if (!treatment) return null;
                const price = treatment.promo_price || treatment.original_price;
                return (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {treatment.image_url && (
                        <img
                          src={treatment.image_url}
                          alt={treatment.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {treatment.name}
                        </p>
                        <p className="text-xs text-slate-400">x{item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      HK${(Number(price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-700">合計</span>
              <span className="text-xl font-bold text-slate-900">
                HK${getCartTotal().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-base font-semibold text-slate-800 mb-4">付款方式</h2>

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                <span className="ml-2 text-sm text-slate-500">正在準備付款...</span>
              </div>
            )}

            {user && items.length > 0 && !isLoading && (
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{
                  fetchClientSecret,
                  onComplete: handlePaymentComplete,
                }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>

          <p className="text-xs text-center text-slate-400 pb-8">
            付款由 Stripe 安全處理 · 所有交易均受 SSL 加密保護
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
