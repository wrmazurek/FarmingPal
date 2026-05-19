import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import type { ServiceBooking } from '@/types';
import AppHeader from '@/components/AppHeader';
import CalendarPicker from '@/components/CalendarPicker';
import { SERVICE_TYPES } from '@/constants/services';
import { REGIONS } from '@/constants/regions';

const TERRAIN_OPTIONS = [
  { label: '0–5% Slope',   desc: 'Flat'         },
  { label: '5–15% Slope',  desc: 'Rolling'      },
  { label: '15–30% Slope', desc: 'Hilly'        },
  { label: '>30% Slope',   desc: 'Steep'        },
];

function fmt(d: Date | null): string {
  if (!d) return '';
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseStored(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function AuthGate() {
  const router = useRouter();
  return (
    <View style={styles.gateBox}>
      <Text style={styles.gateIcon}>🔐</Text>
      <Text style={styles.gateTitle}>Sign in to Book Services</Text>
      <Text style={styles.gateSub}>You need a FarmingPal account to request custom farm services.</Text>
      <TouchableOpacity style={styles.gateBtn} onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.gateBtnText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
        <Text style={styles.gateLink}>Create Account →</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ServiceBookingScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = !!editId;

  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { profile, addServiceBooking, updateServiceBooking } = useUser();

  const regionName = REGIONS.find(r => r.code === profile?.regionCode)?.name;
  const existing: ServiceBooking | undefined = isEditing
    ? profile?.serviceBookings?.find(b => b.id === editId)
    : undefined;

  const [selectedServices,  setSelectedServices]  = useState<string[]>(existing?.services ?? []);
  const [acres,             setAcres]             = useState(existing?.acres ?? '');
  const [startDate,         setStartDate]         = useState<Date | null>(parseStored(existing?.startDate ?? ''));
  const [endDate,           setEndDate]           = useState<Date | null>(parseStored(existing?.endDate ?? ''));
  const [startOpen,         setStartOpen]         = useState(false);
  const [endOpen,           setEndOpen]           = useState(false);
  const [crop,              setCrop]              = useState(existing?.crop ?? '');
  const [terrain,           setTerrain]           = useState(existing?.terrain ?? '');
  const [terrainOpen,       setTerrainOpen]       = useState(false);
  const [notes,             setNotes]             = useState(existing?.notes ?? '');
  const [saving,            setSaving]            = useState(false);

  const toggleService = (label: string) =>
    setSelectedServices(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );

  const handleSubmit = async () => {
    if (selectedServices.length === 0 || !acres || !startDate) {
      Alert.alert('Missing fields', 'Select at least one service, enter acreage, and a start date.');
      return;
    }
    setSaving(true);
    try {
      const record = {
        id: isEditing ? editId! : Date.now().toString(),
        services: selectedServices, acres,
        startDate: fmt(startDate), endDate: fmt(endDate),
        crop, terrain, notes,
        submittedAt: existing?.submittedAt ?? new Date().toISOString(),
      };
      if (isEditing) {
        await updateServiceBooking(editId!, record);
        Alert.alert('Booking Updated', 'Your service request has been updated.', [
          { text: 'View Profile', onPress: () => router.replace('/(tabs)/profile' as any) },
        ]);
      } else {
        await addServiceBooking(record);
        setSelectedServices([]); setAcres(''); setStartDate(null); setEndDate(null); setCrop(''); setTerrain(''); setNotes('');
        Alert.alert('Request Saved', 'Your service request has been added to your profile.', [
          { text: 'View Profile', onPress: () => router.push('/(tabs)/profile' as any) },
          { text: 'Add Another' },
        ]);
      }
    } catch {
      Alert.alert('Error', 'Could not save your request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />
      {!isAuthenticated ? <AuthGate /> : (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

          <Text style={styles.pageTitle}>{isEditing ? 'Edit Booking' : 'Book Custom Services'}</Text>
          <Text style={styles.pageSub}>
            {isEditing
              ? 'Update the details for this service request.'
              : 'Tell us what work you need done. Operators in your area will respond with availability and rates.'}
          </Text>

          {regionName && (
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>📍 {regionName}</Text>
            </View>
          )}

          {/* Services */}
          <Text style={styles.label}>Services Needed</Text>
          <Text style={styles.hint}>Select all that apply</Text>
          <View style={styles.chipGrid}>
            {SERVICE_TYPES.map(s => (
              <TouchableOpacity
                key={s.label}
                style={[styles.chip, selectedServices.includes(s.label) && styles.chipActive]}
                onPress={() => toggleService(s.label)}
              >
                <Text style={styles.chipIcon}>{s.icon}</Text>
                <Text style={[styles.chipText, selectedServices.includes(s.label) && styles.chipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Acres */}
          <Text style={styles.label}>Estimated Acres</Text>
          <TextInput style={styles.input} value={acres} onChangeText={setAcres}
            placeholder="e.g. 640" keyboardType="number-pad" placeholderTextColor="#bbb" />

          {/* Start Date */}
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={[styles.dateBtn, startOpen && styles.dateBtnActive]}
            onPress={() => { setStartOpen(o => !o); setEndOpen(false); }}
          >
            <Text style={[styles.dateBtnText, !startDate && styles.dateBtnPlaceholder]}>
              📅  {startDate ? fmt(startDate) : 'Select start date'}
            </Text>
          </TouchableOpacity>
          {startOpen && (
            <CalendarPicker
              selected={startDate}
              onSelect={d => { setStartDate(d); if (endDate && d > endDate) setEndDate(null); setStartOpen(false); }}
            />
          )}

          {/* End Date */}
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            style={[styles.dateBtn, endOpen && styles.dateBtnActive]}
            onPress={() => { setEndOpen(o => !o); setStartOpen(false); }}
          >
            <Text style={[styles.dateBtnText, !endDate && styles.dateBtnPlaceholder]}>
              📅  {endDate ? fmt(endDate) : 'Select end date'}
            </Text>
          </TouchableOpacity>
          {endOpen && (
            <CalendarPicker
              selected={endDate}
              onSelect={d => { setEndDate(d); setEndOpen(false); }}
              minDate={startDate ?? undefined}
            />
          )}

          {/* Crop */}
          <Text style={styles.label}>Crop Type</Text>
          <TextInput style={styles.input} value={crop} onChangeText={setCrop}
            placeholder="e.g. Canola, Hard Red Spring Wheat" placeholderTextColor="#bbb" />

          {/* Terrain */}
          <Text style={styles.label}>Terrain</Text>
          <TouchableOpacity
            style={[styles.dateBtn, terrainOpen && styles.dateBtnActive]}
            onPress={() => setTerrainOpen(o => !o)}
          >
            <Text style={[styles.dateBtnText, !terrain && styles.dateBtnPlaceholder]}>
              {terrain
                ? `${terrain}  —  ${TERRAIN_OPTIONS.find(t => t.label === terrain)?.desc ?? ''}`
                : 'Select terrain type ▾'}
            </Text>
          </TouchableOpacity>
          {terrainOpen && (
            <View style={styles.dropdownList}>
              {TERRAIN_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.dropdownItem, terrain === opt.label && styles.dropdownItemActive]}
                  onPress={() => { setTerrain(opt.label); setTerrainOpen(false); }}
                >
                  <Text style={[styles.dropdownItemLabel, terrain === opt.label && styles.dropdownItemLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.dropdownItemDesc, terrain === opt.label && styles.dropdownItemDescActive]}>
                    {opt.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Notes */}
          <Text style={styles.label}>Additional Notes</Text>
          <TextInput style={[styles.input, styles.inputTall]} value={notes} onChangeText={setNotes}
            placeholder="Access info, special requirements…" placeholderTextColor="#bbb"
            multiline textAlignVertical="top" />

          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
            onPress={handleSubmit} disabled={saving}
          >
            <Text style={styles.submitBtnText}>
              {saving ? 'Saving…' : isEditing ? 'Update Booking' : 'Submit Booking Request'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f4f8f4' },
  content:         { padding: 16, paddingBottom: 48 },

  gateBox:         { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#f4f8f4' },
  gateIcon:        { fontSize: 48, marginBottom: 16 },
  gateTitle:       { fontSize: 20, fontWeight: '700', color: '#1a3c1a', textAlign: 'center', marginBottom: 10 },
  gateSub:         { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 28 },
  gateBtn:         { backgroundColor: '#2d6a2d', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48, marginBottom: 14 },
  gateBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  gateLink:        { color: '#2d6a2d', fontSize: 14, fontWeight: '600' },

  pageTitle:       { fontSize: 26, fontWeight: '800', color: '#1a3c1a', marginBottom: 6 },
  pageSub:         { fontSize: 14, color: '#666', lineHeight: 21, marginBottom: 16 },

  locationBadge:   { backgroundColor: '#e8f5e8', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, alignSelf: 'flex-start', marginBottom: 20 },
  locationText:    { fontSize: 13, color: '#2d6a2d', fontWeight: '600' },

  label:           { fontSize: 12, fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  hint:            { fontSize: 12, color: '#999', marginBottom: 10, marginTop: -4 },

  chipGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  chip:            { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#d0e8d0', backgroundColor: '#fff' },
  chipActive:      { backgroundColor: '#2d6a2d', borderColor: '#2d6a2d' },
  chipIcon:        { fontSize: 16 },
  chipText:        { fontSize: 13, fontWeight: '600', color: '#2d6a2d' },
  chipTextActive:  { color: '#fff' },

  dateBtn:              { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 12, marginBottom: 10 },
  dateBtnActive:        { borderColor: '#2d6a2d', backgroundColor: '#f0f8f0' },
  dateBtnText:          { fontSize: 15, color: '#1a3c1a', fontWeight: '500' },
  dateBtnPlaceholder:   { color: '#bbb', fontWeight: '400' },

  dropdownList:          { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#2d6a2d', marginBottom: 16, overflow: 'hidden' },
  dropdownItem:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownItemActive:    { backgroundColor: '#2d6a2d' },
  dropdownItemLabel:     { fontSize: 15, fontWeight: '600', color: '#1a3c1a' },
  dropdownItemLabelActive:{ color: '#fff' },
  dropdownItemDesc:      { fontSize: 13, color: '#999' },
  dropdownItemDescActive:{ color: 'rgba(255,255,255,0.75)' },

  input:           { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 12, fontSize: 15, color: '#1a3c1a', marginBottom: 16 },
  inputTall:       { minHeight: 80 },

  submitBtn:       { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled:{ opacity: 0.6 },
  submitBtnText:   { color: '#fff', fontSize: 17, fontWeight: '700' },
});
