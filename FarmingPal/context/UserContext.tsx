import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { registerPushToken } from '@/lib/notifications';
import { Country, EmailNotificationPrefs, OperatorRegistration, ServiceBooking, UserProfile } from '@/types';

const STORAGE_KEY    = '@farmingpal:user_profile';
const ONBOARDING_KEY = '@farmingpal:onboarding_complete';

interface UserContextValue {
  profile: UserProfile | null;
  onboardingComplete: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
  updateRegion: (country: Country, regionCode: string, districtCode: string) => Promise<void>;
  setCountry: (country: Country) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  saveFarmDetails: (details: Partial<UserProfile>) => Promise<void>;
  addServiceBooking: (booking: ServiceBooking) => Promise<void>;
  updateServiceBooking: (id: string, booking: ServiceBooking) => Promise<void>;
  addOperatorEquipment: (equipment: OperatorRegistration) => Promise<void>;
  updateOperatorEquipment: (id: string, equipment: OperatorRegistration) => Promise<void>;
  pendingProfileTab: 'bookings' | 'equipment' | null;
  setPendingProfileTab: (tab: 'bookings' | 'equipment') => void;
  clearPendingProfileTab: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

function dbRowToProfile(row: Record<string, any>, fallback: Partial<UserProfile> = {}): UserProfile {
  return {
    id:           row.id,
    email:        row.email          ?? fallback.email          ?? '',
    country:      (row.country       ?? fallback.country        ?? 'CA') as Country,
    regionCode:   row.region_code    ?? fallback.regionCode     ?? '',
    districtCode: row.district_code  ?? fallback.districtCode   ?? '',
    contactName:  row.contact_name   ?? fallback.contactName,
    phone:        row.phone          ?? fallback.phone,
    farmName:     row.farm_name      ?? fallback.farmName,
    ruralAddress: row.rural_address  ?? fallback.ruralAddress,
    city:         row.city           ?? fallback.city,
    postalCode:   row.postal_code    ?? fallback.postalCode,
    acres:        row.acres          ?? fallback.acres,
    serviceBookings:    fallback.serviceBookings,
    operatorEquipment:  fallback.operatorEquipment,
    emailNotifications: (row.email_notifications as EmailNotificationPrefs | null) ?? fallback.emailNotifications,
    farmhandBio:        row.farmhand_bio         ?? fallback.farmhandBio,
    farmhandResumeUrl:  row.farmhand_resume_url  ?? fallback.farmhandResumeUrl,
    farmhandResumeName: row.farmhand_resume_name ?? fallback.farmhandResumeName,
    farmhandExperience: row.farmhand_experience  ?? fallback.farmhandExperience,
    farmhandSkills:     row.farmhand_skills      ?? fallback.farmhandSkills,
    farmhandSeeking:    row.farmhand_seeking     ?? fallback.farmhandSeeking ?? false,
    farmhandJobPrefs:   row.farmhand_job_prefs   ?? fallback.farmhandJobPrefs ?? '',
  };
}

function dbRowToBooking(row: Record<string, any>): ServiceBooking {
  return {
    id:          row.id,
    services:    row.services    ?? [],
    acres:       row.acres       ?? '',
    startDate:   row.start_date  ?? '',
    endDate:     row.end_date    ?? '',
    crop:        row.crop        ?? '',
    terrain:     row.terrain     ?? '',
    notes:       row.notes       ?? '',
    submittedAt: row.submitted_at ?? new Date().toISOString(),
  };
}

function dbRowToEquipment(row: Record<string, any>): OperatorRegistration {
  return {
    id:           row.id,
    businessName: row.business_name  ?? '',
    service:      row.service        ?? '',
    equipment: {
      year:     row.equipment_year  ?? '',
      make:     row.equipment_make  ?? '',
      model:    row.equipment_model ?? '',
      size:     row.equipment_size  ?? '',
      engineHp: row.engine_hp       ?? '',
    },
    ratePerAcre:  row.rate_per_acre  ?? '',
    labourRate:   row.labour_rate    ?? '',
    serviceArea:  row.service_area   ?? '',
    startDate:    row.start_date     ?? '',
    endDate:      row.end_date       ?? '',
    notes:        row.notes          ?? '',
    registeredAt: row.registered_at  ?? new Date().toISOString(),
  };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile]                     = useState<UserProfile | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading]                 = useState(true);
  const [pendingProfileTab, setPendingProfileTabState] = useState<'bookings' | 'equipment' | null>(null);

  const sessionRef = useRef<Session | null>(null);
  const profileRef = useRef<UserProfile | null>(null);

  // Keep profileRef in sync so auth callbacks see the latest local profile
  useEffect(() => { profileRef.current = profile; }, [profile]);

  const setPendingProfileTab  = useCallback((tab: 'bookings' | 'equipment') => setPendingProfileTabState(tab), []);
  const clearPendingProfileTab = useCallback(() => setPendingProfileTabState(null), []);

  // Write to AsyncStorage and, when authenticated, upsert to Supabase profiles table
  const persist = useCallback(async (p: UserProfile) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p));

    const sess = sessionRef.current;
    if (!sess) return;

    const id    = p.id    || sess.user.id;
    const email = p.email || sess.user.email || '';

    await supabase.from('profiles').upsert({
      id,
      email,
      country:       p.country,
      region_code:   p.regionCode,
      district_code: p.districtCode,
      contact_name:  p.contactName  ?? null,
      phone:         p.phone        ?? null,
      farm_name:     p.farmName     ?? null,
      rural_address: p.ruralAddress ?? null,
      city:          p.city         ?? null,
      postal_code:   p.postalCode   ?? null,
      acres:               p.acres               ?? null,
      email_notifications: p.emailNotifications   ?? null,
      farmhand_bio:         p.farmhandBio         ?? null,
      farmhand_resume_url:  p.farmhandResumeUrl   ?? null,
      farmhand_resume_name: p.farmhandResumeName  ?? null,
      farmhand_experience:  p.farmhandExperience  ?? null,
      farmhand_skills:      p.farmhandSkills      ?? null,
      farmhand_seeking:     p.farmhandSeeking     ?? false,
      farmhand_job_prefs:   p.farmhandJobPrefs    ?? '',
    });
  }, []);

  useEffect(() => {
    // Load local cache first — works for guests and gives instant startup
    (async () => {
      const [storedProfile, storedOnboarding] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);
      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedOnboarding === 'true') setOnboardingComplete(true);
      setIsLoading(false);
    })();

    // Subscribe to Supabase auth — fetch/sync profile whenever the user signs in.
    // All DB calls are raced against a 10s timeout so a paused/slow database
    // never blocks the UI.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      sessionRef.current = sess;
      if (!sess) return;

      const dbTimeout = <T,>(promise: Promise<T>): Promise<T | null> =>
        Promise.race([
          promise,
          new Promise<null>(resolve => setTimeout(() => resolve(null), 10_000)),
        ]);

      const [profileResult, bookingsResult, equipmentResult] = await Promise.all([
        dbTimeout(supabase.from('profiles').select('*').eq('id', sess.user.id).single()),
        dbTimeout(supabase.from('service_bookings').select('*').eq('user_id', sess.user.id).order('submitted_at')),
        dbTimeout(supabase.from('operator_registrations').select('*').eq('user_id', sess.user.id).order('registered_at')),
      ]);

      const local = profileRef.current;

      // Resolve bookings: DB → migrate local → keep local
      let resolvedBookings: ServiceBooking[] | undefined = local?.serviceBookings;
      if (bookingsResult && !bookingsResult.error && bookingsResult.data) {
        if (bookingsResult.data.length > 0) {
          resolvedBookings = bookingsResult.data.map(dbRowToBooking);
        } else if (local?.serviceBookings?.length) {
          // Migrate local-only bookings up to Supabase (fire-and-forget)
          supabase.from('service_bookings').insert(
            local.serviceBookings.map(b => ({
              user_id: sess.user.id, services: b.services, acres: b.acres,
              start_date: b.startDate, end_date: b.endDate, crop: b.crop,
              terrain: b.terrain, notes: b.notes,
            }))
          ).then(({ data }) => {
            if (data) {
              // Update local IDs with Supabase UUIDs
              const migrated = local.serviceBookings!.map((b, i) => ({ ...b, id: (data as any)[i]?.id ?? b.id }));
              const p = { ...profileRef.current!, serviceBookings: migrated };
              setProfile(p);
              AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p));
            }
          });
        }
      }

      // Resolve equipment: DB → migrate local → keep local
      let resolvedEquipment: OperatorRegistration[] | undefined = local?.operatorEquipment;
      if (equipmentResult && !equipmentResult.error && equipmentResult.data) {
        if (equipmentResult.data.length > 0) {
          resolvedEquipment = equipmentResult.data.map(dbRowToEquipment);
        } else if (local?.operatorEquipment?.length) {
          supabase.from('operator_registrations').insert(
            local.operatorEquipment.map(e => ({
              user_id: sess.user.id, business_name: e.businessName, service: e.service,
              equipment_year: e.equipment.year, equipment_make: e.equipment.make,
              equipment_model: e.equipment.model, equipment_size: e.equipment.size,
              engine_hp: e.equipment.engineHp, rate_per_acre: e.ratePerAcre,
              labour_rate: e.labourRate, service_area: e.serviceArea,
              start_date: e.startDate, end_date: e.endDate, notes: e.notes,
            }))
          ).then(({ data }) => {
            if (data) {
              const migrated = local.operatorEquipment!.map((e, i) => ({ ...e, id: (data as any)[i]?.id ?? e.id }));
              const p = { ...profileRef.current!, operatorEquipment: migrated };
              setProfile(p);
              AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p));
            }
          });
        }
      }

      if (profileResult && !profileResult.error && profileResult.data) {
        const merged = dbRowToProfile(profileResult.data, {
          ...local,
          serviceBookings:   resolvedBookings,
          operatorEquipment: resolvedEquipment,
        });
        setProfile(merged);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } else {
        const fresh: UserProfile = {
          id:           sess.user.id,
          email:        sess.user.email ?? '',
          country:      local?.country      ?? 'CA',
          regionCode:   local?.regionCode   ?? '',
          districtCode: local?.districtCode ?? '',
          contactName:  local?.contactName,
          farmName:     local?.farmName,
          ruralAddress: local?.ruralAddress,
          city:         local?.city,
          postalCode:   local?.postalCode,
          acres:        local?.acres,
          serviceBookings:   resolvedBookings,
          operatorEquipment: resolvedEquipment,
        };
        setProfile(fresh);
        await dbTimeout(supabase.from('profiles').upsert({
          id:            fresh.id,
          email:         fresh.email,
          country:       fresh.country,
          region_code:   fresh.regionCode,
          district_code: fresh.districtCode,
        }));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      }

      // Register/refresh push token for this device — fire-and-forget
      registerPushToken(sess.user.id).catch(() => {});
    });

    return () => subscription.unsubscribe();
  }, []);

  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await persist(newProfile);
  }, [persist]);

  const updateRegion = useCallback(async (country: Country, regionCode: string, districtCode: string) => {
    const base = profileRef.current ?? { id: '', email: '', country, regionCode: '', districtCode: '' };
    const updated = { ...base, country, regionCode, districtCode };
    setProfile(updated);
    await persist(updated);
  }, [persist]);

  const setCountry = useCallback(async (country: Country) => {
    const base = profileRef.current ?? { id: '', email: '', country, regionCode: '', districtCode: '' };
    const updated = { ...base, country, regionCode: '', districtCode: '' };
    setProfile(updated);
    await persist(updated);
  }, [persist]);

  const completeOnboarding = useCallback(async () => {
    setOnboardingComplete(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  }, []);

  const saveFarmDetails = useCallback(async (details: Partial<UserProfile>) => {
    const base = profileRef.current ?? { id: '', email: '', country: 'CA' as Country, regionCode: '', districtCode: '' };
    const updated = { ...base, ...details };
    setProfile(updated);
    await persist(updated);
  }, [persist]);

  const addServiceBooking = useCallback(async (booking: ServiceBooking) => {
    const base = profileRef.current ?? { id: '', email: '', country: 'CA' as Country, regionCode: '', districtCode: '' };
    let finalBooking = booking;
    const sess = sessionRef.current;
    if (sess) {
      const { data } = await supabase.from('service_bookings').insert({
        user_id:    sess.user.id,
        services:   booking.services,
        acres:      booking.acres,
        start_date: booking.startDate,
        end_date:   booking.endDate,
        crop:       booking.crop,
        terrain:    booking.terrain,
        notes:      booking.notes,
      }).select('id').single();
      if (data) finalBooking = { ...booking, id: data.id };
    }
    const updated = { ...base, serviceBookings: [...(base.serviceBookings ?? []), finalBooking] };
    setProfile(updated);
    await persist(updated);
  }, [persist]);

  const updateServiceBooking = useCallback(async (id: string, booking: ServiceBooking) => {
    const base = profileRef.current ?? { id: '', email: '', country: 'CA' as Country, regionCode: '', districtCode: '' };
    if (sessionRef.current) {
      await supabase.from('service_bookings').update({
        services:   booking.services,
        acres:      booking.acres,
        start_date: booking.startDate,
        end_date:   booking.endDate,
        crop:       booking.crop,
        terrain:    booking.terrain,
        notes:      booking.notes,
      }).eq('id', id);
    }
    const updated = { ...base, serviceBookings: (base.serviceBookings ?? []).map(b => b.id === id ? booking : b) };
    setProfile(updated);
    await persist(updated);
  }, [persist]);

  const addOperatorEquipment = useCallback(async (equipment: OperatorRegistration) => {
    const base = profileRef.current ?? { id: '', email: '', country: 'CA' as Country, regionCode: '', districtCode: '' };
    let finalEquipment = equipment;
    const sess = sessionRef.current;
    if (sess) {
      const { data } = await supabase.from('operator_registrations').insert({
        user_id:         sess.user.id,
        business_name:   equipment.businessName,
        service:         equipment.service,
        equipment_year:  equipment.equipment.year,
        equipment_make:  equipment.equipment.make,
        equipment_model: equipment.equipment.model,
        equipment_size:  equipment.equipment.size,
        engine_hp:       equipment.equipment.engineHp,
        rate_per_acre:   equipment.ratePerAcre,
        labour_rate:     equipment.labourRate,
        service_area:    equipment.serviceArea,
        start_date:      equipment.startDate,
        end_date:        equipment.endDate,
        notes:           equipment.notes,
      }).select('id').single();
      if (data) finalEquipment = { ...equipment, id: data.id };
    }
    const updated = { ...base, operatorEquipment: [...(base.operatorEquipment ?? []), finalEquipment] };
    setProfile(updated);
    await persist(updated);
  }, [persist]);

  const updateOperatorEquipment = useCallback(async (id: string, equipment: OperatorRegistration) => {
    const base = profileRef.current ?? { id: '', email: '', country: 'CA' as Country, regionCode: '', districtCode: '' };
    if (sessionRef.current) {
      await supabase.from('operator_registrations').update({
        business_name:   equipment.businessName,
        service:         equipment.service,
        equipment_year:  equipment.equipment.year,
        equipment_make:  equipment.equipment.make,
        equipment_model: equipment.equipment.model,
        equipment_size:  equipment.equipment.size,
        engine_hp:       equipment.equipment.engineHp,
        rate_per_acre:   equipment.ratePerAcre,
        labour_rate:     equipment.labourRate,
        service_area:    equipment.serviceArea,
        start_date:      equipment.startDate,
        end_date:        equipment.endDate,
        notes:           equipment.notes,
      }).eq('id', id);
    }
    const updated = { ...base, operatorEquipment: (base.operatorEquipment ?? []).map(e => e.id === id ? equipment : e) };
    setProfile(updated);
    await persist(updated);
  }, [persist]);

  return (
    <UserContext.Provider value={{
      profile, onboardingComplete, saveProfile, updateRegion, setCountry,
      completeOnboarding, saveFarmDetails, addServiceBooking, updateServiceBooking,
      addOperatorEquipment, updateOperatorEquipment,
      pendingProfileTab, setPendingProfileTab, clearPendingProfileTab, isLoading,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
