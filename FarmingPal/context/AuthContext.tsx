import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, emailRedirectTo?: string) => Promise<{ confirmationRequired: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function sessionToUser(session: Session | null): UserProfile | null {
  if (!session?.user) return null;
  return {
    id:            session.user.id,
    email:         session.user.email ?? '',
    country:       'CA',
    regionCode:    '',
    districtCode:  '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from Supabase (uses AsyncStorage adapter configured in lib/supabase.ts)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(sessionToUser(session));
      setIsLoading(false);
    });

    // Keep user state in sync with Supabase auth events (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(sessionToUser(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string, emailRedirectTo?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    });
    if (error) throw error;
    // session is null when email confirmation is required; set when auto-confirmed
    return { confirmationRequired: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
