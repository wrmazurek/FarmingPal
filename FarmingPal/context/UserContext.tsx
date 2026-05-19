import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Country, OperatorRegistration, ServiceBooking, UserProfile } from '@/types';

const STORAGE_KEY = '@farmingpal:user_profile';
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
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [storedProfile, storedOnboarding] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);
      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedOnboarding === 'true') setOnboardingComplete(true);
      setIsLoading(false);
    })();
  }, []);

  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
  }, []);

  const updateRegion = useCallback(async (country: Country, regionCode: string, districtCode: string) => {
    const updated = profile
      ? { ...profile, country, regionCode, districtCode }
      : { id: '', email: '', country, regionCode, districtCode };
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [profile]);

  // Switch country and clear region/district so the picker shows the right list
  const setCountry = useCallback(async (country: Country) => {
    const updated = profile
      ? { ...profile, country, regionCode: '', districtCode: '' }
      : { id: '', email: '', country, regionCode: '', districtCode: '' };
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [profile]);

  const completeOnboarding = useCallback(async () => {
    setOnboardingComplete(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  }, []);

  const saveFarmDetails = useCallback(async (details: Partial<UserProfile>) => {
    const updated = { ...(profile ?? { id: '', email: '', country: 'CA' as Country, regionCode: '', districtCode: '' }), ...details };
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [profile]);

  const addServiceBooking = useCallback(async (booking: ServiceBooking) => {
    const base = profile ?? { id: '', email: '', country: 'CA' as Country, regionCode: '', districtCode: '' };
    const updated = { ...base, serviceBookings: [...(base.serviceBookings ?? []), booking] };
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [profile]);

  const updateServiceBooking = useCallback(async (id: string, booking: ServiceBooking) => {
    const base = profile ?? { id: '', email: '', country: 'CA' as Country, regionCode: '', districtCode: '' };
    const updated = { ...base, serviceBookings: (base.serviceBookings ?? []).map(b => b.id === id ? booking : b) };
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [profile]);

  const addOperatorEquipment = useCallback(async (equipment: OperatorRegistration) => {
    const base = profile ?? { id: '', email: '', country: 'CA' as Country, regionCode: '', districtCode: '' };
    const updated = { ...base, operatorEquipment: [...(base.operatorEquipment ?? []), equipment] };
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [profile]);

  const updateOperatorEquipment = useCallback(async (id: string, equipment: OperatorRegistration) => {
    const base = profile ?? { id: '', email: '', country: 'CA' as Country, regionCode: '', districtCode: '' };
    const updated = { ...base, operatorEquipment: (base.operatorEquipment ?? []).map(e => e.id === id ? equipment : e) };
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [profile]);

  return (
    <UserContext.Provider value={{ profile, onboardingComplete, saveProfile, updateRegion, setCountry, completeOnboarding, saveFarmDetails, addServiceBooking, updateServiceBooking, addOperatorEquipment, updateOperatorEquipment, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
