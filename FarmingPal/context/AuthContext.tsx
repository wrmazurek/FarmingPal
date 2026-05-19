import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types';

const SESSION_KEY = '@farmingpal:session';

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored));
      setIsLoading(false);
    })();
  }, []);

  // Placeholder auth — swap with real API calls when backend is ready
  const signIn = useCallback(async (email: string, _password: string) => {
    const mockUser: UserProfile = { id: email, email, country: 'CA', regionCode: '', districtCode: '' };
    setUser(mockUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
  }, []);

  const signUp = useCallback(async (email: string, _password: string) => {
    const mockUser: UserProfile = { id: email, email, country: 'CA', regionCode: '', districtCode: '' };
    setUser(mockUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
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
