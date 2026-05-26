'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { X, Minus, Plus, ShoppingCart, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CartDrawer() {
  const router = useRouter();
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getCartTotal, itemCount } = useCart();

  if (!isCartOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <ShoppingCart className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">購物車</h2>
              <p className="text-xs text-slate-400">{itemCount} 件商品</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">購物車是空的</h3>
              <p className="text-sm text-slate-400">瀏覽療程優惠，加入購物車</p>
            </div>
          ) : (
            items.map((item) => {
              const treatment = item.treatment;
              if (!treatment) return null;
              const price = treatment.promo_price || treatment.original_price;
              const hasPromo = treatment.promo_price && Number(treatment.promo_price) < Number(treatment.original_price);

              return (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                    {treatment.image_url ? (
                      <img
                        src={treatment.image_url}
                        alt={treatment.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
                      {treatment.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {hasPromo ? (
                        <>
                          <span className="text-sm font-bold text-rose-600">
                            HK${Number(treatment.promo_price).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            HK${Number(treatment.original_price).toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-slate-700">
                          HK${Number(treatment.original_price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-slate-600" />
                      </button>
                      <span className="text-sm font-medium text-slate-700 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={treatment.limited_quantity != null && item.quantity >= treatment.limited_quantity}
                        className={`w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center transition-colors
                          ${treatment.limited_quantity != null && item.quantity >= treatment.limited_quantity
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-slate-50'
                          }`}
                      >
                        <Plus className="w-3 h-3 text-slate-600" />
                      </button>

                      {treatment.limited_quantity != null && (
                        <span className="text-[10px] text-amber-600 font-medium">
                          限量{treatment.limited_quantity}個
                        </span>
                      )}

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with total */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">小計</span>
              <span className="text-xl font-bold text-slate-800">
                HK${getCartTotal().toLocaleString()}
              </span>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-full py-5 text-base font-semibold shadow-lg shadow-rose-200/50"
              onClick={() => {
                setIsCartOpen(false);
                router.push('/checkout');
              }}
            >
              立即結帳
            </Button>
            <p className="text-xs text-center text-slate-400">
              結帳後我們會透過 WhatsApp 聯絡確認
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
