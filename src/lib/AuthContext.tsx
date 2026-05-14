'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email?: string;
  role?: string;
  full_name?: string;
  user_metadata?: { full_name?: string; role?: string };
  [key: string]: unknown;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: { type: string } | null;
  appPublicSettings: null;
  logout: () => Promise<void>;
  navigateToLogin: () => void;
  checkAppState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError] = useState<{ type: string } | null>(null);

  const fetchFullUser = async (sessionUser: UserProfile | null) => {
    if (!sessionUser) { setUser(null); return; }

    const baseUser: UserProfile = {
      ...sessionUser,
      role: sessionUser.role || (sessionUser.user_metadata as any)?.role,
    };

    // Try to enrich with DB profile (role from users table)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .abortSignal(controller.signal)
        .single();

      clearTimeout(timer);

      if (profile && !error) {
        // Merge: DB profile takes priority (role, full_name, etc.)
        setUser({ ...baseUser, ...profile });
      } else {
        setUser(baseUser);
      }
    } catch (e) {
      setUser(baseUser);
    }
  };

  useEffect(() => {
    let settled = false;

    const safeFinish = () => {
      if (!settled) {
        settled = true;
        setIsLoadingAuth(false);
      }
    };

    const timeout = setTimeout(() => {
      console.warn('Auth timed out – proceeding unauthenticated');
      setUser(null);
      safeFinish();
    }, 6000);

    const getSessionWithTimeout = Promise.race([
      supabase.auth.getSession().catch((err: unknown) => {
        console.warn('getSession failed:', err);
        return { data: { session: null } } as Awaited<ReturnType<typeof supabase.auth.getSession>>;
      }),
      new Promise<Awaited<ReturnType<typeof supabase.auth.getSession>>>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } } as Awaited<ReturnType<typeof supabase.auth.getSession>>), 5000)
      ),
    ]);

    getSessionWithTimeout
      .then(({ data: { session } }) => {
        if (settled) return;
        if (!session?.user) {
          setUser(null);
          clearTimeout(timeout);
          safeFinish();
          return;
        }
        // Don't set user yet - wait for fetchFullUser to get role from DB
        fetchFullUser(session.user as unknown as UserProfile).finally(() => {
          clearTimeout(timeout);
          safeFinish();
        });
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.error('getSession error:', err);
        setUser(null);
        safeFinish();
      });

    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const result = supabase.auth.onAuthStateChange((event, session) => {
        // Skip INITIAL_SESSION - already handled by getSession() above
        if (event === 'INITIAL_SESSION') return;
        // Re-fetch full profile whenever auth state changes (e.g. after sign-in)
        setIsLoadingAuth(true);
        fetchFullUser((session?.user as UserProfile) || null).finally(() => {
          setIsLoadingAuth(false);
        });
      });
      subscription = result?.data?.subscription;
    } catch (e) {
      console.warn('onAuthStateChange setup failed:', e);
    }

    return () => {
      clearTimeout(timeout);
      try { subscription?.unsubscribe(); } catch (e) {}
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const checkAppState = () => {};

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
