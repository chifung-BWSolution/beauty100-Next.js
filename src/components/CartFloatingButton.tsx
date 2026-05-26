'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/CartContext';

export default function CartFloatingButton() {
  const { itemCount, setIsCartOpen } = useCart();

  if (itemCount === 0) return null;

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-24 right-6 z-[999] w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-300/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
