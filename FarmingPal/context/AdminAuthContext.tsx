import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface AdminAuthContextValue {
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  adminSignIn: (email: string, password: string) => Promise<boolean>;
  adminSignOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabaseAdmin.auth.getSession().then(({ data }) => {
      setIsAdminAuthenticated(!!data.session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange((_event, session) => {
      setIsAdminAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const adminSignIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.session) {
      return false;
    }

    // Verify this Supabase user is listed in admin_users
    const { data: adminRow } = await supabaseAdmin
      .from('admin_users')
      .select('email')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (!adminRow) {
      await supabaseAdmin.auth.signOut();
      return false;
    }

    return true;
  }, []);

  const adminSignOut = useCallback(async () => {
    await supabaseAdmin.auth.signOut();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, isLoading, adminSignIn, adminSignOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}
