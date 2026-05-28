'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

export interface CartItem {
  id: string;
  member_id: string;
  treatment_id: string;
  quantity: number;
  salon_profile_id: string | null;
  created_at: string;
  treatment?: {
    id: string;
    name: string;
    image_url: string | null;
    original_price: number;
    promo_price: number | null;
    promo_expiry: string | null;
    limited_quantity: number | null;
    limit_one_per_customer: boolean;
    status: string;
    salon_profile_id: string | null;
    redeem_start_date: string | null;
    redeem_end_date: string | null;
  };
  salon_name?: string | null;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (treatmentId: string, salonProfileId?: string | null) => Promise<{ success: boolean; error?: string }>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  isInCart: (treatmentId: string) => boolean;
  getRemainingStock: (treatmentId: string) => number | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          treatment:treatments(id, name, image_url, original_price, promo_price, promo_expiry, limited_quantity, limit_one_per_customer, status, salon_profile_id, redeem_start_date, redeem_end_date)
        `)
        .eq('member_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Fetch salon names for items with salon_profile_id
        const salonProfileIds = [...new Set((data as any[]).map(i => i.salon_profile_id || i.treatment?.salon_profile_id).filter(Boolean))];
        let salonNameMap: Record<string, string> = {};
        if (salonProfileIds.length > 0) {
          const { data: salons } = await supabase
            .from('salon_profiles')
            .select('id, name')
            .in('id', salonProfileIds);
          if (salons) {
            salons.forEach((s: any) => { salonNameMap[s.id] = s.name || ''; });
          }
        }
        const enrichedItems = (data as any[]).map(item => ({
          ...item,
          salon_name: salonNameMap[item.salon_profile_id || item.treatment?.salon_profile_id] || null,
        }));
        setItems(enrichedItems as CartItem[]);
      }
    } catch (e) {
      console.error('Error fetching cart:', e);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const getRemainingStock = useCallback((treatmentId: string): number | null => {
    // Find the treatment from any cart item or fetch it
    const cartItem = items.find(item => item.treatment_id === treatmentId);
    const limitedQty = cartItem?.treatment?.limited_quantity;
    if (limitedQty == null) return null; // no limit
    return limitedQty;
  }, [items]);

  const addToCart = async (treatmentId: string, salonProfileId?: string | null): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'not_logged_in' };
    }

    // Check if already in cart
    const existing = items.find(item => item.treatment_id === treatmentId);
    if (existing) {
      // If limit_one_per_customer, don't allow adding more
      if (existing.treatment?.limit_one_per_customer) {
        return { success: false, error: 'limit_one_per_customer' };
      }
      // Check limited_quantity before incrementing
      const limit = existing.treatment?.limited_quantity;
      if (limit != null && existing.quantity >= limit) {
        return { success: false, error: 'limit_reached' };
      }
      // Increment quantity
      await updateQuantity(existing.id, existing.quantity + 1);
      return { success: true };
    }

    // For new additions, check limited_quantity and limit_one_per_customer from DB
    const { data: treatmentData } = await supabase
      .from('treatments')
      .select('limited_quantity, limit_one_per_customer')
      .eq('id', treatmentId)
      .single();

    if (treatmentData?.limited_quantity != null && treatmentData.limited_quantity <= 0) {
      return { success: false, error: 'sold_out' };
    }

    // Check if customer already purchased this treatment before (limit_one_per_customer)
    if (treatmentData?.limit_one_per_customer) {
      const { data: existingOrder } = await supabase
        .from('order_items')
        .select('id')
        .eq('member_id', user.id)
        .eq('treatment_id', treatmentId)
        .limit(1);
      
      if (existingOrder && existingOrder.length > 0) {
        return { success: false, error: 'already_purchased' };
      }
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        member_id: user.id,
        treatment_id: treatmentId,
        quantity: 1,
        salon_profile_id: salonProfileId || null,
      })
      .select(`
        *,
        treatment:treatments(id, name, image_url, original_price, promo_price, promo_expiry, limited_quantity, limit_one_per_customer, status, salon_profile_id, redeem_start_date, redeem_end_date)
      `)
      .single();

    if (!error && data) {
      // Fetch salon name
      const profileId = salonProfileId || (data as any).treatment?.salon_profile_id;
      let salonName: string | null = null;
      if (profileId) {
        const { data: salonData } = await supabase
          .from('salon_profiles')
          .select('name')
          .eq('id', profileId)
          .single();
        salonName = salonData?.name || null;
      }
      setItems(prev => [{ ...(data as CartItem), salon_name: salonName }, ...prev]);
      return { success: true };
    }

    return { success: false, error: error?.message || 'Unknown error' };
  };

  const removeFromCart = async (cartItemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (!error) {
      setItems(prev => prev.filter(item => item.id !== cartItemId));
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    // Enforce limited_quantity cap
    const cartItem = items.find(item => item.id === cartItemId);
    if (cartItem?.treatment?.limited_quantity != null) {
      const maxQty = cartItem.treatment.limited_quantity;
      if (quantity > maxQty) {
        return; // Don't allow exceeding the limit
      }
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', cartItemId);

    if (!error) {
      setItems(prev =>
        prev.map(item =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('member_id', user.id);

    if (!error) {
      setItems([]);
    }
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const price = item.treatment?.promo_price || item.treatment?.original_price || 0;
      return total + Number(price) * item.quantity;
    }, 0);
  };

  const isInCart = (treatmentId: string) => {
    return items.some(item => item.treatment_id === treatmentId);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        isInCart,
        getRemainingStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
