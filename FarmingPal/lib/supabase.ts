import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Client: read from app.config.js extra (not cached by Metro's transform).
// SSR/Node: fall back to process.env which is populated by dotenv in app.config.js.
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;
export const SUPABASE_URL  = extra.supabaseUrl  || process.env.EXPO_PUBLIC_SUPABASE_URL  || '';
export const SUPABASE_ANON = extra.supabaseAnon || process.env.EXPO_PUBLIC_SUPABASE_ANON || '';

// During Expo web SSR (Node.js), window/localStorage don't exist — use a no-op adapter.
// On client-side web use localStorage; on native use AsyncStorage.
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

// Wrap fetch with a 15-second timeout so no Supabase request can hang the app
// indefinitely (e.g. exchangeCodeForSession on a stale reset link).
function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const ctrl = new AbortController();
  const id   = setTimeout(() => ctrl.abort(), 15_000);
  return fetch(input, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: Platform.OS === 'web' && !isSSR,
    flowType:           'implicit',  // token read from URL hash — no server roundtrip on reset links
  },
  global: { fetch: fetchWithTimeout },
});

// ─── Typed table helpers (matches 001_initial_schema.sql) ─────────────────────

export type DbCountry      = 'CA' | 'US';
export type DbCurrency     = 'CAD' | 'USD';
export type DbJobStatus    = 'open' | 'filled' | 'closed';
export type DbQuoteStatus  = 'pending' | 'accepted' | 'declined';

export interface DbProfile {
  id:            string;
  email:         string;
  country:       DbCountry;
  region_code:   string;
  district_code: string;
  contact_name:  string | null;
  farm_name:     string | null;
  rural_address: string | null;
  city:          string | null;
  postal_code:   string | null;
  acres:         string | null;
  created_at:    string;
  updated_at:    string;
}

export interface DbPriceSubmission {
  id:            string;
  crop_id:       string;
  grade:         string | null;
  price:         number;
  currency:      DbCurrency;
  elevator_name: string;
  district_code: string;
  region_code:   string;
  country:       DbCountry;
  submitted_by:  string | null;
  submitted_at:  string;
}

export interface DbFuelSubmission {
  id:            string;
  fuel_type_id:  string;
  price:         number;
  currency:      DbCurrency;
  unit:          string;
  supplier_name: string;
  district_code: string;
  region_code:   string;
  country:       DbCountry;
  submitted_by:  string | null;
  submitted_at:  string;
}

export interface DbFertSubmission {
  id:            string;
  fert_type_id:  string;
  price:         number;
  currency:      DbCurrency;
  unit:          string;
  supplier_name: string;
  district_code: string;
  region_code:   string;
  country:       DbCountry;
  submitted_by:  string | null;
  submitted_at:  string;
}

export interface DbChemSubmission {
  id:            string;
  category_id:   string;
  formulation:   'liquid' | 'dry';
  product_name:  string;
  price:         number;
  currency:      DbCurrency;
  unit:          string;
  supplier_name: string;
  district_code: string;
  region_code:   string;
  country:       DbCountry;
  submitted_by:  string | null;
  submitted_at:  string;
}

export interface DbServiceBooking {
  id:           string;
  user_id:      string;
  services:     string[];
  acres:        string;
  start_date:   string;
  end_date:     string;
  crop:         string;
  terrain:      string;
  notes:        string;
  submitted_at: string;
}

export interface DbOperatorRegistration {
  id:               string;
  user_id:          string;
  business_name:    string;
  service:          string;
  equipment_year:   string;
  equipment_make:   string;
  equipment_model:  string;
  equipment_size:   string;
  engine_hp:        string;
  rate_per_acre:    string;
  labour_rate:      string;
  service_area:     string;
  start_date:       string;
  end_date:         string;
  notes:            string;
  registered_at:    string;
}

export interface DbJobPosting {
  id:            string;
  farmer_id:     string;
  farmer_name:   string;
  services:      string[];
  acres:         string;
  start_date:    string;
  end_date:      string;
  crop:          string;
  terrain:       string;
  notes:         string;
  district_code: string;
  region_code:   string;
  country:       DbCountry;
  status:        DbJobStatus;
  posted_at:     string;
}

export interface DbJobQuote {
  id:            string;
  job_id:        string;
  operator_id:   string;
  operator_name: string;
  business_name: string;
  rate_per_acre: string;
  message:       string;
  status:        DbQuoteStatus;
  submitted_at:  string;
}

export interface DbJobThread {
  id:               string;
  job_id:           string;
  job_title:        string;
  farmer_id:        string;
  operator_id:      string;
  operator_name:    string;
  created_at:       string;
  last_message_at:  string;
}

export interface DbJobMessage {
  id:          string;
  thread_id:   string;
  sender_id:   string;
  sender_name: string;
  body:        string;
  sent_at:     string;
  read_at:     string | null;
}

export interface DbLivestockSubmission {
  id:            string;
  livestock_id:  string;
  price:         number;
  currency:      DbCurrency;
  buyer_name:    string;
  district_code: string;
  region_code:   string;
  country:       DbCountry;
  submitted_by:  string | null;
  submitted_at:  string;
}
