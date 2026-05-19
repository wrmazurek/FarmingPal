import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import type { ServiceBooking, OperatorRegistration, Country } from '@/types';

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
}

function Field({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, subtitle, isLast }: FieldProps) {
  return (
    <View style={[styles.field, isLast && styles.fieldLast]}>
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
  const { profile, saveFarmDetails } = useUser();

  const [farmName,     setFarmName]     = useState(profile?.farmName     ?? '');
  const [contactName,  setContactName]  = useState(profile?.contactName  ?? '');
  const [email,        setEmail]        = useState(profile?.email        ?? user?.email ?? '');
  const [ruralAddress, setRuralAddress] = useState(profile?.ruralAddress ?? '');
  const [city,         setCity]         = useState(profile?.city         ?? '');
  const [postalCode,   setPostalCode]   = useState(profile?.postalCode   ?? '');
  const [acres,            setAcres]           = useState(profile?.acres        ?? '');
  const [selectedCountry,  setSelectedCountry]  = useState<Country>(profile?.country ?? 'CA');
  const [regionCode,       setRegionCode]       = useState(profile?.regionCode   ?? '');
  const [districtCode,     setDistrictCode]     = useState(profile?.districtCode ?? '');
  const [countryOpen,      setCountryOpen]      = useState(false);
  const [regionOpen,       setRegionOpen]       = useState(false);
  const [districtOpen,     setDistrictOpen]     = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [activeTab,        setActiveTab]        = useState<'bookings' | 'equipment'>('bookings');

  const equipCount = profile?.operatorEquipment?.length ?? 0;
  const bookCount  = profile?.serviceBookings?.length  ?? 0;
  const prevEquip  = useRef(equipCount);
  const prevBook   = useRef(bookCount);

  useEffect(() => {
    if (equipCount > prevEquip.current) setActiveTab('equipment');
    prevEquip.current = equipCount;
  }, [equipCount]);

  useEffect(() => {
    if (bookCount > prevBook.current) setActiveTab('bookings');
    prevBook.current = bookCount;
  }, [bookCount]);

  const regionList   = REGIONS.filter(r => r.country === selectedCountry);
  const districtList = DISTRICTS.filter(d => d.regionCode === regionCode);
  const countryName  = COUNTRIES.find(c => c.code === selectedCountry)?.name ?? '';
  const regionName   = REGIONS.find(r => r.code === regionCode)?.name ?? '';
  const districtName = DISTRICTS.find(d => d.code === districtCode)?.name ?? '';

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFarmDetails({ farmName, contactName, email, ruralAddress, city, postalCode, acres, country: selectedCountry, regionCode, districtCode });
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Error', 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Profile</Text>

          <Field
            label="Farm Name"
            value={farmName}
            onChangeText={setFarmName}
            placeholder="e.g. Sunrise Grain Farm"
          />
          <Field
            label="Contact"
            value={contactName}
            onChangeText={setContactName}
            placeholder="Full name"
            autoCapitalize="words"
          />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="contact@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Farm Location"
            value={ruralAddress}
            onChangeText={setRuralAddress}
            placeholder="e.g. RR 2 Box 14, Hwy 16 W"
            subtitle="Rural information only"
          />
          <Field
            label="City / Town"
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Yorkton"
            autoCapitalize="words"
          />
          <Field
            label="Postal / ZIP Code"
            value={postalCode}
            onChangeText={setPostalCode}
            placeholder="e.g. S3N 2K4"
            autoCapitalize="characters"
          />

          {/* Country dropdown */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Country</Text>
            <TouchableOpacity
              style={[styles.ddBtn, countryOpen && styles.ddBtnActive]}
              onPress={() => { setCountryOpen(o => !o); setRegionOpen(false); setDistrictOpen(false); }}
            >
              <Text style={[styles.ddBtnText, !selectedCountry && styles.ddPlaceholder]}>
                {COUNTRIES.find(c => c.code === selectedCountry)?.flag}{'  '}{countryName || 'Select country ▾'}
              </Text>
            </TouchableOpacity>
            {countryOpen && (
              <View style={styles.ddList}>
                {COUNTRIES.map(c => (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.ddItem, selectedCountry === c.code && styles.ddItemActive]}
                    onPress={() => {
                      setSelectedCountry(c.code);
                      setRegionCode('');
                      setDistrictCode('');
                      setCountryOpen(false);
                    }}
                  >
                    <Text style={[styles.ddItemText, selectedCountry === c.code && styles.ddItemTextActive]}>
                      {c.flag}{'  '}{c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Province / State dropdown */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              {selectedCountry === 'CA' ? 'Province' : 'State'}
            </Text>
            <TouchableOpacity
              style={[styles.ddBtn, regionOpen && styles.ddBtnActive]}
              onPress={() => { setRegionOpen(o => !o); setCountryOpen(false); setDistrictOpen(false); }}
            >
              <Text style={[styles.ddBtnText, !regionCode && styles.ddPlaceholder]}>
                {regionName || (selectedCountry === 'CA' ? 'Select province ▾' : 'Select state ▾')}
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
                    <Text style={[styles.ddItemText, regionCode === r.code && styles.ddItemTextActive]}>
                      {r.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* District dropdown — appears once a province/state is selected */}
          {regionCode !== '' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>District</Text>
              <TouchableOpacity
                style={[styles.ddBtn, districtOpen && styles.ddBtnActive]}
                onPress={() => { setDistrictOpen(o => !o); setCountryOpen(false); setRegionOpen(false); }}
              >
                <Text style={[styles.ddBtnText, !districtCode && styles.ddPlaceholder]}>
                  {districtName || 'Select district ▾'}
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
                      <Text style={[styles.ddItemText, districtCode === d.code && styles.ddItemTextActive]}>
                        {d.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          <Field
            label="# of Acres"
            value={acres}
            onChangeText={setAcres}
            placeholder="e.g. 2400"
            keyboardType="number-pad"
            isLast
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
        </TouchableOpacity>

        {/* Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'bookings' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('bookings')}
          >
            <Text style={[styles.toggleBtnText, activeTab === 'bookings' && styles.toggleBtnTextActive]}>
              📋 My Bookings{bookCount > 0 ? ` (${bookCount})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'equipment' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('equipment')}
          >
            <Text style={[styles.toggleBtnText, activeTab === 'equipment' && styles.toggleBtnTextActive]}>
              🚜 My Equipment{equipCount > 0 ? ` (${equipCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bookings table */}
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
                    {/* Header row */}
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

        {/* Equipment table */}
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
                    {/* Header row */}
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

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f4f8f4' },
  content:           { padding: 16, paddingBottom: 48 },

  section:           { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16 },
  sectionTitle:      { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16 },

  field:             { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 16 },
  fieldLast:         { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
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

  saveButton:        { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 12 },
  saveButtonDisabled:{ opacity: 0.6 },
  saveButtonText:    { color: '#fff', fontSize: 17, fontWeight: '700' },

  signOutButton:     { borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fff' },
  signOutText:       { color: '#c0392b', fontWeight: '700', fontSize: 15 },

  guestBox:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  guestNote:         { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 24 },
  signInButton:      { backgroundColor: '#2d6a2d', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 },
  signInText:        { color: '#fff', fontWeight: '700', fontSize: 15 },

  /* Toggle */
  toggleRow:         { flexDirection: 'row', backgroundColor: '#e8f5e8', borderRadius: 12, padding: 4, marginBottom: 12 },
  toggleBtn:         { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  toggleBtnActive:   { backgroundColor: '#2d6a2d' },
  toggleBtnText:     { fontSize: 13, fontWeight: '700', color: '#2d6a2d' },
  toggleBtnTextActive:{ color: '#fff' },

  /* Table card */
  tableCard:         { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  tableHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tableTitle:        { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.6 },
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
