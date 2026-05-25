import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Switch, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import SuccessToast from '@/components/SuccessToast';
import * as ImagePicker from 'expo-image-picker';
import type { ServiceBooking, OperatorRegistration, Country, EmailNotificationPrefs } from '@/types';
import { supabase } from '@/lib/supabase';

const COUNTRIES: { code: Country; name: string; flag: string }[] = [
  { code: 'CA', name: 'Canada',        flag: '🇨🇦' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
];

function equipSummary(reg: OperatorRegistration): string {
  const d = reg.equipment;
  if (!d) return '—';
  return [d.year, d.make, d.model].filter(Boolean).join(' ') || '—';
}

function isBookingEditable(b: ServiceBooking): boolean {
  if (!b.endDate) return true;
  const end = new Date(b.endDate);
  if (isNaN(end.getTime())) return true;
  end.setHours(23, 59, 59, 999);
  return new Date() <= end;
}
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import AppHeader from '@/components/AppHeader';
import { REGIONS, DISTRICTS } from '@/constants/regions';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  subtitle?: string;
  isLast?: boolean;
  half?: boolean;
}

function Field({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, subtitle, isLast, half }: FieldProps) {
  return (
    <View style={[styles.field, isLast && styles.fieldLast, half && styles.fieldHalf]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {subtitle && <Text style={styles.fieldSubtitle}>{subtitle}</Text>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const { profile, saveFarmDetails, pendingProfileTab, clearPendingProfileTab } = useUser();

  const [contactName,  setContactName]  = useState(profile?.contactName  ?? '');
  const [phone,        setPhone]        = useState(profile?.phone        ?? '');
  const [email,        setEmail]        = useState(profile?.email        ?? user?.email ?? '');
  const [ruralAddress, setRuralAddress] = useState(profile?.ruralAddress ?? '');
  const [city,         setCity]         = useState(profile?.city         ?? '');
  const [postalCode,   setPostalCode]   = useState(profile?.postalCode   ?? '');
  const [farmName,     setFarmName]     = useState(profile?.farmName     ?? '');
  const [acres,            setAcres]           = useState(profile?.acres        ?? '');
  const [selectedCountry,  setSelectedCountry]  = useState<Country>(profile?.country ?? 'CA');
  const [regionCode,       setRegionCode]       = useState(profile?.regionCode   ?? '');
  const [districtCode,     setDistrictCode]     = useState(profile?.districtCode ?? '');
  const [countryOpen,      setCountryOpen]      = useState(false);
  const [regionOpen,       setRegionOpen]       = useState(false);
  const [districtOpen,     setDistrictOpen]     = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [toastVisible,     setToastVisible]     = useState(false);
  const [profileTab,       setProfileTab]       = useState<'business' | 'farmhand'>('business');
  const [activeTab,        setActiveTab]        = useState<'bookings' | 'equipment'>('bookings');
  const [saveError,        setSaveError]        = useState('');
  const [emailNotifs,      setEmailNotifs]      = useState<EmailNotificationPrefs>(
    profile?.emailNotifications ?? { customFarmingJobs: false, equipmentForSale: false, landForSale: false }
  );
  const JOB_TYPE_OPTS = ['Full-Time', 'Part-Time', 'Seasonal', 'Casual / Day Labour'] as const;
  const savedPrefs = (profile?.farmhandJobPrefs ?? '').split(',').map(s => s.trim()).filter(Boolean);
  const [fhSeeking,    setFhSeeking]    = useState(profile?.farmhandSeeking ?? false);
  const [fhJobPrefs,   setFhJobPrefs]   = useState<string[]>(savedPrefs);
  const [fhBio,        setFhBio]        = useState(profile?.farmhandBio        ?? '');
  const [fhExperience, setFhExperience] = useState(profile?.farmhandExperience ?? '');
  const [fhSkills,     setFhSkills]     = useState(profile?.farmhandSkills     ?? '');
  const [fhResumeUri,  setFhResumeUri]  = useState<string | null>(null);
  const [fhResumeName, setFhResumeName] = useState<string | null>(profile?.farmhandResumeName ?? null);
  const [fhResumeUrl,  setFhResumeUrl]  = useState<string | null>(profile?.farmhandResumeUrl  ?? null);
  const [fhUploading,  setFhUploading]  = useState(false);

  const equipCount      = profile?.operatorEquipment?.length ?? 0;
  const bookCount       = profile?.serviceBookings?.length  ?? 0;
  const uniqueServices  = Array.from(new Set(
    (profile?.operatorEquipment ?? []).map(e => e.service).filter(Boolean)
  ));

  useEffect(() => {
    if (pendingProfileTab) {
      setActiveTab(pendingProfileTab);
      clearPendingProfileTab();
    }
  }, [pendingProfileTab]);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('@farmingpal:pendingTab').then(tab => {
      if (tab === 'equipment' || tab === 'bookings') {
        setActiveTab(tab as 'equipment' | 'bookings');
        AsyncStorage.removeItem('@farmingpal:pendingTab');
      }
    });
  }, []));

  const regionList   = REGIONS.filter(r => r.country === selectedCountry);
  const districtList = DISTRICTS.filter(d => d.regionCode === regionCode);
  const countryName  = COUNTRIES.find(c => c.code === selectedCountry)?.name ?? '';
  const regionName   = REGIONS.find(r => r.code === regionCode)?.name ?? '';
  const districtName = DISTRICTS.find(d => d.code === districtCode)?.name ?? '';

  const pickResume = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (!result.canceled && result.assets?.[0]) {
      setFhResumeUri(result.assets[0].uri);
      setFhResumeName(result.assets[0].fileName ?? 'resume');
    }
  };

  const uploadResume = async (): Promise<{ url: string; name: string } | null> => {
    if (!fhResumeUri || !user?.id) return null;
    setFhUploading(true);
    try {
      const resp = await fetch(fhResumeUri);
      const blob = await resp.blob();
      const ext  = fhResumeName?.split('.').pop() ?? 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('farmhand-resumes').upload(path, blob);
      if (upErr) return null;
      const { data } = supabase.storage.from('farmhand-resumes').getPublicUrl(path);
      return { url: data.publicUrl, name: fhResumeName ?? 'resume' };
    } catch {
      return null;
    } finally {
      setFhUploading(false);
    }
  };

  const handleSave = async () => {
    setSaveError('');
    setSaving(true);
    try {
      let resumeUrl  = fhResumeUrl;
      let resumeName = fhResumeName;
      if (fhResumeUri) {
        const uploaded = await uploadResume();
        if (uploaded) { resumeUrl = uploaded.url; resumeName = uploaded.name; setFhResumeUri(null); setFhResumeUrl(uploaded.url); setFhResumeName(uploaded.name); }
      }
      await saveFarmDetails({
        contactName, phone, email, ruralAddress, city, postalCode,
        farmName, acres, country: selectedCountry, regionCode, districtCode,
        emailNotifications: emailNotifs,
        farmhandSeeking: fhSeeking, farmhandJobPrefs: fhJobPrefs.join(','),
        farmhandBio: fhBio, farmhandExperience: fhExperience, farmhandSkills: fhSkills,
        farmhandResumeUrl: resumeUrl ?? undefined, farmhandResumeName: resumeName ?? undefined,
      });
      setToastVisible(true);
    } catch {
      setSaveError('Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.guestBox}>
          <Text style={styles.guestNote}>Sign in to view and edit your profile.</Text>
          <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Identity section — always visible */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Information</Text>

          <View style={styles.twoColRow}>
            <Field label="Full Name" value={contactName} onChangeText={setContactName} placeholder="First and last name" autoCapitalize="words" half />
            <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="e.g. 306-555-1234" keyboardType="default" half />
          </View>

          <View style={styles.twoColRow}>
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="contact@example.com" keyboardType="email-address" autoCapitalize="none" half />
            <Field label="Farm Location (Rural only)" value={ruralAddress} onChangeText={setRuralAddress} placeholder="RR 2, Hwy 16 W" half />
          </View>

          <View style={[styles.twoColRow, styles.twoColRowLast]}>
            <Field label="City / Town" value={city} onChangeText={setCity} placeholder="e.g. Yorkton" autoCapitalize="words" half />
            <Field label="Postal / ZIP" value={postalCode} onChangeText={setPostalCode} placeholder="e.g. S3N 2K4" autoCapitalize="characters" half isLast />
          </View>
        </View>

        {/* Top-level Business / Farmhand toggle */}
        <View style={styles.profileToggleRow}>
          <TouchableOpacity
            style={[styles.profileToggleBtn, profileTab === 'business' && styles.profileToggleBtnActive]}
            onPress={() => setProfileTab('business')}
          >
            <Text style={[styles.profileToggleBtnText, profileTab === 'business' && styles.profileToggleBtnTextActive]}>
              Business
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.profileToggleBtn, profileTab === 'farmhand' && styles.profileToggleBtnActive]}
            onPress={() => setProfileTab('farmhand')}
          >
            <Text style={[styles.profileToggleBtnText, profileTab === 'farmhand' && styles.profileToggleBtnTextActive]}>
              Farmhand
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── BUSINESS TAB ── */}
        {profileTab === 'business' && <>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Profile</Text>

          {/* Row 1: Farm Name (full width) */}
          <View style={styles.twoColRow}>
            <Field label="Farm Name" value={farmName} onChangeText={setFarmName} placeholder="e.g. Sunrise Grain Farm" half />
            <Field label="# of Acres" value={acres} onChangeText={setAcres} placeholder="e.g. 2400" keyboardType="number-pad" half />
          </View>

          {/* Row 2: Country | Province / State */}
          <View style={styles.twoColRow}>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={styles.fieldLabel}>Country</Text>
              <TouchableOpacity
                style={[styles.ddBtn, countryOpen && styles.ddBtnActive]}
                onPress={() => { setCountryOpen(o => !o); setRegionOpen(false); setDistrictOpen(false); }}
              >
                <Text style={[styles.ddBtnText, !selectedCountry && styles.ddPlaceholder]}>
                  {countryName || 'Select ▾'}
                </Text>
              </TouchableOpacity>
              {countryOpen && (
                <View style={styles.ddList}>
                  {COUNTRIES.map(c => (
                    <TouchableOpacity
                      key={c.code}
                      style={[styles.ddItem, selectedCountry === c.code && styles.ddItemActive]}
                      onPress={() => { setSelectedCountry(c.code); setRegionCode(''); setDistrictCode(''); setCountryOpen(false); }}
                    >
                      <Text style={[styles.ddItemText, selectedCountry === c.code && styles.ddItemTextActive]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={styles.fieldLabel}>Province / State</Text>
              <TouchableOpacity
                style={[styles.ddBtn, regionOpen && styles.ddBtnActive]}
                onPress={() => { setRegionOpen(o => !o); setCountryOpen(false); setDistrictOpen(false); }}
              >
                <Text style={[styles.ddBtnText, !regionCode && styles.ddPlaceholder]}>
                  {regionName || 'Select ▾'}
                </Text>
              </TouchableOpacity>
              {regionOpen && (
                <ScrollView style={styles.ddList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {regionList.map(r => (
                    <TouchableOpacity
                      key={r.code}
                      style={[styles.ddItem, regionCode === r.code && styles.ddItemActive]}
                      onPress={() => { setRegionCode(r.code); setDistrictCode(''); setRegionOpen(false); }}
                    >
                      <Text style={[styles.ddItemText, regionCode === r.code && styles.ddItemTextActive]}>{r.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          {/* Row 3: District (conditional) */}
          {regionCode !== '' && (
            <View style={[styles.twoColRow, styles.twoColRowLast]}>
              <View style={[styles.field, styles.fieldHalf]}>
                <Text style={styles.fieldLabel}>District</Text>
                <TouchableOpacity
                  style={[styles.ddBtn, districtOpen && styles.ddBtnActive]}
                  onPress={() => { setDistrictOpen(o => !o); setCountryOpen(false); setRegionOpen(false); }}
                >
                  <Text style={[styles.ddBtnText, !districtCode && styles.ddPlaceholder]}>
                    {districtName || 'Select ▾'}
                  </Text>
                </TouchableOpacity>
                {districtOpen && (
                  <ScrollView style={styles.ddList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {districtList.map(d => (
                      <TouchableOpacity
                        key={d.code}
                        style={[styles.ddItem, districtCode === d.code && styles.ddItemActive]}
                        onPress={() => { setDistrictCode(d.code); setDistrictOpen(false); }}
                      >
                        <Text style={[styles.ddItemText, districtCode === d.code && styles.ddItemTextActive]}>{d.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
              <View style={styles.fieldHalf} />
            </View>
          )}
        </View>

        {saveError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{saveError}</Text>
          </View>
        ) : null}

        {/* Email Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>

          <View style={styles.notifRow}>
            <View style={styles.notifRowLeft}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <Text style={styles.notifLabel}>Custom Farming Jobs </Text>
                {uniqueServices.length === 0 && (
                  <Text style={styles.notifGroupNote}>(Register equipment under "My Equipment" to receive job match notifications.)</Text>
                )}
              </View>
              <Text style={styles.notifSubHint}>District only</Text>
            </View>
            <Switch
              value={!!emailNotifs.customFarmingJobs}
              onValueChange={v => setEmailNotifs(prev => ({ ...prev, customFarmingJobs: v }))}
              trackColor={{ false: '#e0e0e0', true: '#2d6a2d' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.notifRow}>
            <View style={styles.notifRowLeft}>
              <Text style={styles.notifLabel}>Equipment for Sale</Text>
              <Text style={styles.notifSubHint}>District only</Text>
            </View>
            <Switch
              value={emailNotifs.equipmentForSale}
              onValueChange={v => setEmailNotifs(prev => ({ ...prev, equipmentForSale: v }))}
              trackColor={{ false: '#e0e0e0', true: '#2d6a2d' }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.notifRow, styles.notifRowLast]}>
            <View style={styles.notifRowLeft}>
              <Text style={styles.notifLabel}>Land for Sale</Text>
              <Text style={styles.notifSubHint}>District only</Text>
            </View>
            <Switch
              value={emailNotifs.landForSale}
              onValueChange={v => setEmailNotifs(prev => ({ ...prev, landForSale: v }))}
              trackColor={{ false: '#e0e0e0', true: '#2d6a2d' }}
              thumbColor="#fff"
            />
          </View>

          <Text style={styles.notifSaveHint}>Tap Save Profile below to apply notification changes.</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
        </TouchableOpacity>

        {/* My Bookings / My Equipment sub-toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'bookings' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('bookings')}
          >
            <Text style={[styles.toggleBtnText, activeTab === 'bookings' && styles.toggleBtnTextActive]}>
              My Bookings{bookCount > 0 ? ` (${bookCount})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'equipment' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('equipment')}
          >
            <Text style={[styles.toggleBtnText, activeTab === 'equipment' && styles.toggleBtnTextActive]}>
              My Equipment{equipCount > 0 ? ` (${equipCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'bookings' && (() => {
          const bookings: ServiceBooking[] = profile?.serviceBookings ?? [];
          return (
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableTitle}>Service Bookings</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/service-booking' as any)}>
                  <Text style={styles.addLink}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {bookings.length === 0 ? (
                <Text style={styles.emptyText}>No bookings yet. Tap + Add to request custom services.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <View>
                    <View style={[styles.tRow, styles.tHeadRow]}>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colNum]}>#</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colServices]}>Services</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colAcres]}>Acres</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colDates]}>Start</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colDates]}>End</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colCrop]}>Crop</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colTerrain]}>Terrain</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colAction]}></Text>
                    </View>
                    {bookings.map((b, i) => {
                      const editable = isBookingEditable(b);
                      return (
                        <View key={b.id} style={[styles.tRow, i % 2 === 1 && styles.tRowAlt]}>
                          <Text style={[styles.tCell, styles.colNum]}>{i + 1}</Text>
                          <Text style={[styles.tCell, styles.colServices]} numberOfLines={2}>{b.services.join(', ')}</Text>
                          <Text style={[styles.tCell, styles.colAcres]}>{b.acres}</Text>
                          <Text style={[styles.tCell, styles.colDates]}>{b.startDate || '—'}</Text>
                          <Text style={[styles.tCell, styles.colDates]}>{b.endDate || '—'}</Text>
                          <Text style={[styles.tCell, styles.colCrop]}>{b.crop || '—'}</Text>
                          <Text style={[styles.tCell, styles.colTerrain]}>{b.terrain || '—'}</Text>
                          {editable ? (
                            <TouchableOpacity
                              style={[styles.tCell, styles.colAction]}
                              onPress={() => router.push({ pathname: '/(tabs)/service-booking', params: { editId: b.id } } as any)}
                            >
                              <Text style={styles.editLink}>Edit</Text>
                            </TouchableOpacity>
                          ) : (
                            <Text style={[styles.tCell, styles.colAction, styles.doneText]}>Done</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>
          );
        })()}

        {activeTab === 'equipment' && (() => {
          const equipment: OperatorRegistration[] = profile?.operatorEquipment ?? [];
          return (
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableTitle}>Operator Equipment</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/service-register' as any)}>
                  <Text style={styles.addLink}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {equipment.length === 0 ? (
                <Text style={styles.emptyText}>No equipment listed yet. Tap + Add to register as an operator.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <View>
                    <View style={[styles.tRow, styles.tHeadRow]}>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colNum]}>#</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colBusiness]}>Business</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colEquip]}>Equipment</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colServices]}>Service</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colRate]}>Rate/ac</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colRate]}>Labour</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colArea]}>Area</Text>
                      <Text style={[styles.tCell, styles.tHeadCell, styles.colAction]}></Text>
                    </View>
                    {equipment.map((e, i) => (
                      <View key={e.id} style={[styles.tRow, i % 2 === 1 && styles.tRowAlt]}>
                        <Text style={[styles.tCell, styles.colNum]}>{i + 1}</Text>
                        <Text style={[styles.tCell, styles.colBusiness]} numberOfLines={2}>{e.businessName}</Text>
                        <Text style={[styles.tCell, styles.colEquip]} numberOfLines={2}>{equipSummary(e)}</Text>
                        <Text style={[styles.tCell, styles.colServices]} numberOfLines={2}>{e.service || '—'}</Text>
                        <Text style={[styles.tCell, styles.colRate]}>{e.ratePerAcre || '—'}</Text>
                        <Text style={[styles.tCell, styles.colRate]}>{e.labourRate || '—'}</Text>
                        <Text style={[styles.tCell, styles.colArea]}>{e.serviceArea || '—'}</Text>
                        <TouchableOpacity
                          style={[styles.tCell, styles.colAction]}
                          onPress={() => router.push({ pathname: '/(tabs)/service-register', params: { editId: e.id } } as any)}
                        >
                          <Text style={styles.editLink}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          );
        })()}

        </>}

        {/* ── FARMHAND TAB ── */}
        {profileTab === 'farmhand' && <>

        {/* Farmhand Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farmhand Settings</Text>

          <View style={styles.notifRow}>
            <View style={styles.notifRowLeft}>
              <Text style={styles.notifLabel}>Actively Seeking Farm Work</Text>
              <Text style={styles.notifSubHint}>Marks you as available to employers on the Job Board</Text>
            </View>
            <Switch
              value={fhSeeking}
              onValueChange={setFhSeeking}
              trackColor={{ false: '#e0e0e0', true: '#7a5230' }}
              thumbColor="#fff"
            />
          </View>

          {fhSeeking && (
            <>
              <Text style={styles.fhPrefLabel}>Preferred Job Types</Text>
              <Text style={styles.fhPrefHint}>Pre-selects these filters when you open the Job Board</Text>
              <View style={styles.fhPrefGrid}>
                {JOB_TYPE_OPTS.map(t => {
                  const on = fhJobPrefs.includes(t);
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.fhPrefChip, on && styles.fhPrefChipActive]}
                      onPress={() => setFhJobPrefs(prev => on ? prev.filter(x => x !== t) : [...prev, t])}
                    >
                      <Text style={[styles.fhPrefChipText, on && styles.fhPrefChipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Farmhand Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farmhand Profile</Text>
          <Text style={styles.fhIntro}>Save your work history and resume so you can apply to farm jobs with one tap.</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>About Me</Text>
            <TextInput
              style={[styles.input, styles.fhTextArea]}
              value={fhBio}
              onChangeText={setFhBio}
              placeholder="Brief introduction — who you are, where you're from, what you're looking for..."
              placeholderTextColor="#bbb"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Experience</Text>
            <TextInput
              style={[styles.input, styles.fhTextArea]}
              value={fhExperience}
              onChangeText={setFhExperience}
              placeholder="Years worked, equipment operated, crops grown, certifications..."
              placeholderTextColor="#bbb"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Skills</Text>
            <TextInput
              style={styles.input}
              value={fhSkills}
              onChangeText={setFhSkills}
              placeholder="e.g. GPS guidance, grain cart, chemical handling, CDL"
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={[styles.field, styles.fieldLast]}>
            <Text style={styles.fieldLabel}>Resume</Text>
            {fhResumeUrl && !fhResumeUri ? (
              <View style={styles.fhResumeRow}>
                <Text style={styles.fhResumeSaved}>✓ {fhResumeName ?? 'Resume saved'}</Text>
                <TouchableOpacity onPress={pickResume}><Text style={styles.fhResumeChange}>Replace</Text></TouchableOpacity>
              </View>
            ) : fhResumeUri ? (
              <View style={styles.fhResumeRow}>
                <Text style={styles.fhResumeSaved}>📎 {fhResumeName}</Text>
                <TouchableOpacity onPress={() => { setFhResumeUri(null); setFhResumeName(profile?.farmhandResumeName ?? null); }}>
                  <Text style={styles.fhResumeChange}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <TouchableOpacity style={styles.fhUploadBtn} onPress={pickResume} disabled={fhUploading}>
              <Text style={styles.fhUploadBtnText}>{fhUploading ? 'Uploading...' : fhResumeUrl ? 'Upload New Resume' : '+ Upload Resume'}</Text>
            </TouchableOpacity>
            <Text style={styles.fhUploadHint}>PDF, Word, or image • Saved to your profile • Used when applying to Farmhand jobs</Text>
          </View>
        </View>

        {saveError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{saveError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.saveButton, styles.saveButtonFarmhand, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
        </TouchableOpacity>

        </>}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
      <SuccessToast visible={toastVisible} message="Profile saved successfully!" onHide={() => setToastVisible(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f4f8f4' },
  content:           { padding: 16, paddingBottom: 48 },

  section:           { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16 },
  sectionTitle:      { fontSize: 13, fontWeight: '700', color: '#c8931a', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16 },

  twoColRow:         { flexDirection: 'row', gap: 10, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 16 },
  twoColRowLast:     { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },

  field:             { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 16 },
  fieldLast:         { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
  fieldHalf:         { flex: 1, marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0 },
  fieldLabel:        { fontSize: 13, fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  fieldSubtitle:     { fontSize: 12, color: '#999', marginBottom: 6 },
  input:             { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 12, fontSize: 16, color: '#1a3c1a' },

  /* Dropdown */
  ddBtn:             { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 12, marginBottom: 4 },
  ddBtnActive:       { borderColor: '#2d6a2d', backgroundColor: '#f0f8f0' },
  ddBtnText:         { fontSize: 16, color: '#1a3c1a' },
  ddPlaceholder:     { color: '#bbb' },
  ddList:            { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#2d6a2d', marginBottom: 8, overflow: 'hidden', maxHeight: 220 },
  ddItem:            { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  ddItemActive:      { backgroundColor: '#2d6a2d' },
  ddItemText:        { fontSize: 15, color: '#1a3c1a' },
  ddItemTextActive:  { color: '#fff', fontWeight: '700' },

  /* Top-level profile toggle */
  profileToggleRow:           { flexDirection: 'row', backgroundColor: '#e8f5e8', borderRadius: 14, padding: 4, marginBottom: 16 },
  profileToggleBtn:           { flex: 1, paddingVertical: 13, alignItems: 'center', borderRadius: 11 },
  profileToggleBtnActive:     { backgroundColor: '#2d6a2d' },
  profileToggleBtnText:       { fontSize: 15, fontWeight: '700', color: '#2d6a2d' },
  profileToggleBtnTextActive: { color: '#fff' },

  saveButton:        { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 12 },
  saveButtonFarmhand:{ backgroundColor: '#7a5230' },
  saveButtonDisabled:{ opacity: 0.6 },
  saveButtonText:    { color: '#fff', fontSize: 17, fontWeight: '700' },

  errorBox:          { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginBottom: 8 },
  errorText:         { fontSize: 14, color: '#c0392b', fontWeight: '600', lineHeight: 20 },

  signOutButton:     { borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fff' },
  signOutText:       { color: '#c0392b', fontWeight: '700', fontSize: 15 },

  guestBox:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  guestNote:         { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 24 },
  signInButton:      { backgroundColor: '#2d6a2d', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 },
  signInText:        { color: '#fff', fontWeight: '700', fontSize: 15 },

  /* Farmhand Settings */
  fhPrefLabel:        { fontSize: 13, fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 14, marginBottom: 4 },
  fhPrefHint:         { fontSize: 12, color: '#aaa', marginBottom: 10 },
  fhPrefGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fhPrefChip:         { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#f4f8f4', borderWidth: 1.5, borderColor: '#d0e8d0' },
  fhPrefChipActive:   { backgroundColor: '#7a5230', borderColor: '#7a5230' },
  fhPrefChipText:     { fontSize: 13, fontWeight: '600', color: '#555' },
  fhPrefChipTextActive: { color: '#fff' },

  /* Farmhand Profile */
  fhIntro:        { fontSize: 13, color: '#888', marginBottom: 14, lineHeight: 19 },
  fhTextArea:     { minHeight: 80, textAlignVertical: 'top' },
  fhResumeRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  fhResumeSaved:  { fontSize: 13, color: '#2d6a2d', fontWeight: '600', flex: 1 },
  fhResumeChange: { fontSize: 13, color: '#c8931a', fontWeight: '700' },
  fhUploadBtn:    { backgroundColor: '#f0f8f0', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 12, alignItems: 'center', marginTop: 4 },
  fhUploadBtnText:{ fontSize: 14, fontWeight: '700', color: '#2d6a2d' },
  fhUploadHint:   { fontSize: 11, color: '#bbb', marginTop: 6, textAlign: 'center', lineHeight: 16 },

  /* Email Notifications */
  notifGroupLabel:   { fontSize: 13, fontWeight: '700', color: '#1a3c1a', marginBottom: 3, flexShrink: 1 },
  notifGroupNote:    { fontSize: 11, fontWeight: '400', color: '#aaa', fontStyle: 'italic' },
  notifGroupHint:    { fontSize: 12, color: '#999', lineHeight: 17, marginBottom: 12 },
  notifEmpty:        { fontSize: 13, color: '#bbb', fontStyle: 'italic', marginBottom: 12 },
  notifRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  notifRowLast:      { borderBottomWidth: 0 },
  notifRowLeft:      { flex: 1, marginRight: 12 },
  notifLabel:        { fontSize: 15, color: '#1a3c1a', fontWeight: '500' },
  notifSubHint:      { fontSize: 12, color: '#aaa', marginTop: 1 },
  notifDivider:      { height: 1, backgroundColor: '#e8f0e8', marginVertical: 14 },
  notifSaveHint:     { fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 14, fontStyle: 'italic' },

  /* Toggle */
  toggleRow:         { flexDirection: 'row', backgroundColor: '#e8f5e8', borderRadius: 12, padding: 4, marginBottom: 12 },
  toggleBtn:         { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  toggleBtnActive:   { backgroundColor: '#2d6a2d' },
  toggleBtnText:     { fontSize: 13, fontWeight: '700', color: '#2d6a2d' },
  toggleBtnTextActive:{ color: '#fff' },

  /* Table card */
  tableCard:         { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  tableHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tableTitle:        { fontSize: 13, fontWeight: '700', color: '#c8931a', textTransform: 'uppercase', letterSpacing: 0.6 },
  addLink:           { fontSize: 13, fontWeight: '700', color: '#2d6a2d' },
  emptyText:         { fontSize: 13, color: '#999', textAlign: 'center', paddingVertical: 16 },

  /* Table rows */
  tRow:              { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tRowAlt:           { backgroundColor: '#f9fdf9' },
  tHeadRow:          { backgroundColor: '#e8f5e8' },
  tCell:             { paddingVertical: 9, paddingHorizontal: 8, fontSize: 13, color: '#333' },
  tHeadCell:         { fontWeight: '700', color: '#1a3c1a', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 },

  /* Column widths */
  colNum:            { width: 28 },
  colServices:       { width: 160 },
  colAcres:          { width: 60 },
  colDates:          { width: 96 },
  colCrop:           { width: 110 },
  colTerrain:        { width: 110 },
  colBusiness:       { width: 140 },
  colEquip:          { width: 180 },
  colRate:           { width: 90 },
  colArea:           { width: 130 },
  colAction:         { width: 48, justifyContent: 'center' },

  editLink:          { fontSize: 12, fontWeight: '700', color: '#2d6a2d' },
  doneText:          { fontSize: 12, color: '#bbb' },
});
