import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import AppHeader from '@/components/AppHeader';
import SuccessToast from '@/components/SuccessToast';
import CalendarPicker from '@/components/CalendarPicker';
import { SERVICE_TYPES } from '@/constants/services';
import { REGIONS } from '@/constants/regions';
import type { EquipmentDetail } from '@/types';

function fmt(d: Date | null): string {
  if (!d) return '';
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseStored(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

const EMPTY_DETAIL: EquipmentDetail = { year: '', make: '', model: '', size: '', engineHp: '' };

function AuthGate() {
  const router = useRouter();
  return (
    <View style={styles.gateBox}>
      <Text style={styles.gateIcon}>🚜</Text>
      <Text style={styles.gateTitle}>Sign in to Register as an Operator</Text>
      <Text style={styles.gateSub}>You need a FarmingPal account to list your equipment and services.</Text>
      <TouchableOpacity style={styles.gateBtn} onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.gateBtnText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
        <Text style={styles.gateLink}>Create Account →</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ServiceRegisterScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = !!editId;

  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { profile, addOperatorEquipment, updateOperatorEquipment, setPendingProfileTab } = useUser();

  const regionName = REGIONS.find(r => r.code === profile?.regionCode)?.name ?? '';
  const existing = isEditing
    ? profile?.operatorEquipment?.find(e => e.id === editId)
    : undefined;

  const [businessName,    setBusinessName]    = useState(existing?.businessName ?? profile?.farmName ?? '');
  const [selectedService, setSelectedService] = useState(existing?.service ?? '');
  const [equipment,       setEquipment]       = useState<EquipmentDetail>(existing?.equipment ?? EMPTY_DETAIL);
  const [ratePerAcre,     setRatePerAcre]     = useState(existing?.ratePerAcre ?? '');
  const [labourRate,      setLabourRate]      = useState(existing?.labourRate ?? '');
  const [serviceArea,     setServiceArea]     = useState(existing?.serviceArea ?? regionName);
  const [startDate,       setStartDate]       = useState<Date | null>(parseStored(existing?.startDate ?? ''));
  const [endDate,         setEndDate]         = useState<Date | null>(parseStored(existing?.endDate ?? ''));
  const [startOpen,       setStartOpen]       = useState(false);
  const [endOpen,         setEndOpen]         = useState(false);
  const [notes,           setNotes]           = useState(existing?.notes ?? '');
  const [saving,          setSaving]          = useState(false);
  const [toastVisible,    setToastVisible]    = useState(false);
  const [savedOk,         setSavedOk]         = useState(false);
  const [savedEquipCount, setSavedEquipCount] = useState(0);
  const [formError,       setFormError]       = useState('');

  const updateField = (field: keyof EquipmentDetail, value: string) =>
    setEquipment(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setFormError('');
    if (!businessName || !selectedService || !ratePerAcre) {
      setFormError('Enter a business name, select a service, and set a rate.');
      return;
    }
    setSaving(true);
    try {
      const record = {
        id: isEditing ? editId! : Date.now().toString(),
        businessName,
        service: selectedService,
        equipment,
        ratePerAcre, labourRate, serviceArea,
        startDate: fmt(startDate), endDate: fmt(endDate), notes,
        registeredAt: existing?.registeredAt ?? new Date().toISOString(),
      };

      if (isEditing) {
        await updateOperatorEquipment(editId!, record);
        setPendingProfileTab('equipment');
        await AsyncStorage.setItem('@farmingpal:pendingTab', 'equipment');
        setToastVisible(true);
        setTimeout(() => router.replace('/(tabs)/profile' as any), 1200);
      } else {
        await addOperatorEquipment(record);
        setPendingProfileTab('equipment');
        await AsyncStorage.setItem('@farmingpal:pendingTab', 'equipment');
        setSelectedService('');
        setEquipment(EMPTY_DETAIL);
        setNotes('');
        setSavedEquipCount((profile?.operatorEquipment?.length ?? 0) + 1);
        setSavedOk(true);
      }
    } catch {
      setFormError('Could not save your listing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const svcType = SERVICE_TYPES.find(s => s.label === selectedService);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />
      {!isAuthenticated ? <AuthGate /> : savedOk ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.savedContent}>
          <View style={styles.savedBox}>
            <MaterialCommunityIcons name="check-circle" size={52} color="#2d6a2d" />
            <Text style={styles.savedTitle}>Listing Added!</Text>
            <Text style={styles.savedSub}>
              Your listing has been added to your profile. You now have {savedEquipCount} equipment listing(s).
            </Text>
            <TouchableOpacity style={styles.viewProfileBtn} onPress={() => router.push('/(tabs)/profile' as any)}>
              <Text style={styles.viewProfileBtnText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addAnotherBtn} onPress={() => setSavedOk(false)}>
              <Text style={styles.addAnotherBtnText}>Add Another Listing</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

          <Text style={styles.pageTitle}>{isEditing ? 'Edit Listing' : 'Register as Operator'}</Text>
          <Text style={styles.pageSub}>
            {isEditing
              ? 'Update the details for this service listing.'
              : 'Add one service listing at a time. You can add more after saving.'}
          </Text>

          {/* Business */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Info</Text>
            <Text style={styles.label}>Business Name</Text>
            <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName}
              placeholder="e.g. Prairie Custom Ag" placeholderTextColor="#bbb" />
          </View>

          {/* Service — single select */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Offered</Text>
            <Text style={styles.hint}>Select one service for this listing</Text>
            <View style={styles.chipGrid}>
              {SERVICE_TYPES.map(s => {
                const active = selectedService === s.label;
                return (
                  <TouchableOpacity
                    key={s.label}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => {
                      setSelectedService(active ? '' : s.label);
                      if (!active) setEquipment(EMPTY_DETAIL);
                    }}
                  >
                    <Image source={s.icon} style={styles.chipIcon} resizeMode="contain" />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Equipment — shown only when a service is selected */}
          {selectedService !== '' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Equipment Details</Text>
              <View style={styles.equipHeadingRow}>
                {svcType && <Image source={svcType.icon} style={styles.equipHeadingIcon} resizeMode="contain" />}
                <Text style={styles.equipHeading}>{selectedService}</Text>
              </View>

              {/* Year + Make */}
              <View style={styles.row}>
                <View style={styles.yearField}>
                  <Text style={styles.label}>Year</Text>
                  <TextInput style={styles.input} value={equipment.year}
                    onChangeText={v => updateField('year', v)}
                    placeholder="2022" placeholderTextColor="#bbb" keyboardType="number-pad" />
                </View>
                <View style={styles.makeField}>
                  <Text style={styles.label}>Make</Text>
                  <TextInput style={styles.input} value={equipment.make}
                    onChangeText={v => updateField('make', v)}
                    placeholder="e.g. John Deere" placeholderTextColor="#bbb" />
                </View>
              </View>

              {/* Model */}
              <Text style={styles.label}>Model</Text>
              <TextInput style={styles.input} value={equipment.model}
                onChangeText={v => updateField('model', v)}
                placeholder="e.g. S780 Combine" placeholderTextColor="#bbb" />

              {/* Size + Engine HP */}
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Size</Text>
                  <TextInput style={styles.input} value={equipment.size}
                    onChangeText={v => updateField('size', v)}
                    placeholder="e.g. 40 ft" placeholderTextColor="#bbb" />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Engine HP</Text>
                  <TextInput style={styles.input} value={equipment.engineHp}
                    onChangeText={v => updateField('engineHp', v)}
                    placeholder="e.g. 543" placeholderTextColor="#bbb" keyboardType="number-pad" />
                </View>
              </View>
            </View>
          )}

          {/* Rates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rates</Text>
            <Text style={styles.label}>Rate per Acre (incl. operator)</Text>
            <TextInput style={styles.input} value={ratePerAcre} onChangeText={setRatePerAcre}
              placeholder="e.g. $28.00 / ac" placeholderTextColor="#bbb" keyboardType="decimal-pad" />
            <Text style={styles.label}>Labour Rate (if separate)</Text>
            <TextInput style={styles.input} value={labourRate} onChangeText={setLabourRate}
              placeholder="e.g. $45.00 / hr" placeholderTextColor="#bbb" keyboardType="decimal-pad" />
          </View>

          {/* Area & Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Area & Availability</Text>
            <Text style={styles.label}>Service Area</Text>
            <TextInput style={styles.input} value={serviceArea} onChangeText={setServiceArea}
              placeholder="Province / Districts covered" placeholderTextColor="#bbb" />
            <Text style={styles.label}>Available From</Text>
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

            <Text style={styles.label}>Available To</Text>
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
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <TextInput style={[styles.input, styles.inputTall]} value={notes} onChangeText={setNotes}
              placeholder="Mobilization fees, minimum acreage, specializations…"
              placeholderTextColor="#bbb" multiline textAlignVertical="top" />
          </View>

          {formError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
            onPress={handleSave} disabled={saving}
          >
            <Text style={styles.submitBtnText}>
              {saving ? 'Saving…' : isEditing ? 'Update Listing' : 'Add to Profile'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      )}
      <SuccessToast visible={toastVisible} message="Listing updated!" onHide={() => setToastVisible(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f4f8f4' },
  content:          { padding: 16, paddingBottom: 48 },

  gateBox:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#f4f8f4' },
  gateIcon:         { fontSize: 48, marginBottom: 16 },
  gateTitle:        { fontSize: 20, fontWeight: '700', color: '#1a3c1a', textAlign: 'center', marginBottom: 10 },
  gateSub:          { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 28 },
  gateBtn:          { backgroundColor: '#2d6a2d', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48, marginBottom: 14 },
  gateBtnText:      { color: '#fff', fontSize: 16, fontWeight: '700' },
  gateLink:         { color: '#2d6a2d', fontSize: 14, fontWeight: '600' },

  pageTitle:        { fontSize: 26, fontWeight: '800', color: '#1a3c1a', marginBottom: 6 },
  pageSub:          { fontSize: 14, color: '#666', lineHeight: 21, marginBottom: 20 },

  section:          { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12 },
  sectionTitle:     { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 },

  label:            { fontSize: 12, fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  hint:             { fontSize: 12, color: '#999', marginBottom: 10, marginTop: -8 },

  chipGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip:             { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#d0e8d0', backgroundColor: '#f6fbf6' },
  chipActive:       { backgroundColor: '#2d6a2d', borderColor: '#2d6a2d' },
  chipIcon:         { width: 28, height: 28 },
  chipText:         { fontSize: 13, fontWeight: '600', color: '#2d6a2d' },
  chipTextActive:   { color: '#fff' },

  equipHeadingRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  equipHeadingIcon: { width: 28, height: 28 },
  equipHeading:     { fontSize: 15, fontWeight: '700', color: '#1a3c1a' },

  row:              { flexDirection: 'row', gap: 12 },
  yearField:        { width: 80 },
  makeField:        { flex: 1 },
  halfField:        { flex: 1 },

  dateBtn:              { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 12, marginBottom: 10 },
  dateBtnActive:        { borderColor: '#2d6a2d', backgroundColor: '#f0f8f0' },
  dateBtnText:          { fontSize: 15, color: '#1a3c1a', fontWeight: '500' },
  dateBtnPlaceholder:   { color: '#bbb', fontWeight: '400' },

  input:            { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 12, fontSize: 15, color: '#1a3c1a', marginBottom: 16 },
  inputTall:        { minHeight: 80 },

  submitBtn:        { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled:{ opacity: 0.6 },
  submitBtnText:    { color: '#fff', fontSize: 17, fontWeight: '700' },

  errorBox:         { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginBottom: 8 },
  errorText:        { fontSize: 14, color: '#c0392b', fontWeight: '600', lineHeight: 20 },

  savedContent:     { flexGrow: 1, justifyContent: 'center', padding: 24 },
  savedBox:         { backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1.5, borderColor: '#d0e8d0' },
  savedTitle:       { fontSize: 22, fontWeight: '900', color: '#1a3c1a', marginTop: 14, marginBottom: 8 },
  savedSub:         { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  viewProfileBtn:   { backgroundColor: '#2d6a2d', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center', marginBottom: 12 },
  viewProfileBtnText:{ color: '#fff', fontSize: 16, fontWeight: '700' },
  addAnotherBtn:    { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center', borderWidth: 1.5, borderColor: '#d0e8d0' },
  addAnotherBtnText:{ color: '#2d6a2d', fontSize: 15, fontWeight: '700' },
});
