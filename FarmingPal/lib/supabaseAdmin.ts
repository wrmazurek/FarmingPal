import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON } from './supabase';

// Separate storage key keeps admin sessions completely isolated from the main
// app's AuthContext — admin sign-in won't trigger onAuthStateChange in UserContext.
const STORAGE_KEY = 'farmingpal-admin-auth';

const isSSR = typeof window === 'undefined';

const storage = isSSR
  ? {
      getItem:    (_key: string) => Promise.resolve(null),
      setItem:    (_key: string, _value: string) => Promise.resolve(),
      removeItem: (_key: string) => Promise.resolve(),
    }
  : Platform.OS === 'web'
    ? {
        getItem:    (key: string) => Promise.resolve(localStorage.getItem(key)),
        setItem:    (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
        removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
      }
    : AsyncStorage;

function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const ctrl = new AbortController();
  const id   = setTimeout(() => ctrl.abort(), 15_000);
  return fetch(input, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage,
    storageKey:         STORAGE_KEY,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
    flowType:           'implicit',
  },
  global: { fetch: fetchWithTimeout },
});
