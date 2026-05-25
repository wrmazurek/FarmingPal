import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import AppHeader from '@/components/AppHeader';
import SuccessToast from '@/components/SuccessToast';
import { REGIONS, getDistrictsByRegion } from '@/constants/regions';

const FUEL_TYPES = [
  { id: 'diesel-farm',  label: 'Diesel (Farm / Off-Road)' },
  { id: 'diesel-road',  label: 'Diesel (On-Road)' },
  { id: 'gasoline',     label: 'Gasoline' },
  { id: 'propane',      label: 'Propane' },
  { id: 'natural-gas',  label: 'Natural Gas' },
  { id: 'ethanol',      label: 'Ethanol' },
];

export default function SubmitFuelScreen() {
  const { profile } = useUser();
  const router = useRouter();

  const isUS        = profile?.country === 'US';
  const currency    = isUS ? 'USD' : 'CAD';
  const unit        = isUS ? 'gal' : 'L';
  const districts   = profile?.regionCode ? getDistrictsByRegion(profile.regionCode) : [];
  const regionName  = REGIONS.find(r => r.code === profile?.regionCode)?.name;

  const [fuelTypeId,    setFuelTypeId]    = useState('');
  const [price,         setPrice]         = useState('');
  const [supplierName,  setSupplierName]  = useState('');
  const [districtCode,  setDistrictCode]  = useState(profile?.districtCode ?? '');
  const [districtOpen,  setDistrictOpen]  = useState(false);
  const [toastVisible,  setToastVisible]  = useState(false);
  const [submitError,   setSubmitError]   = useState('');

  const handleSubmit = async () => {
    setSubmitError('');
    if (!fuelTypeId || !price || !supplierName || !districtCode) {
      setSubmitError('Please fill in all fields before submitting.');
      return;
    }
    const { error } = await supabase.from('fuel_submissions').insert({
      fuel_type_id:  fuelTypeId,
      price:         parseFloat(price),
      currency,
      unit,
      supplier_name: supplierName,
      district_code: districtCode,
      region_code:   profile?.regionCode ?? '',
      country:       profile?.country ?? 'CA',
    });
    if (error) {
      setSubmitError(error.message);
      return;
    }
    setToastVisible(true);
    setFuelTypeId('');
    setPrice('');
    setSupplierName('');
  };

  const selectedFuel = FUEL_TYPES.find(f => f.id === fuelTypeId);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.pageTitle}>Fuel Price Reporting</Text>

        <View style={styles.locationBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/pricing')}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.locationText}>
            📍 {profile?.country === 'US' ? 'United States' : 'Canada'}
            {regionName ? ` · ${regionName}` : ''}
          </Text>
        </View>

        {/* Fuel type */}
        <Text style={styles.label}>Fuel Type</Text>
        <View style={styles.typeGrid}>
          {FUEL_TYPES.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.typeChip, fuelTypeId === f.id && styles.typeChipSelected]}
              onPress={() => setFuelTypeId(f.id)}
            >
              <Text style={[styles.typeChipText, fuelTypeId === f.id && styles.typeChipTextSelected]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price */}
        <Text style={styles.label}>
          Price ({currency}/{unit})
        </Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          onBlur={() => { const n = parseFloat(price); if (!isNaN(n)) setPrice(n.toFixed(2)); }}
          placeholder={isUS ? 'e.g. 3.85' : 'e.g. 1.42'}
          keyboardType="decimal-pad"
        />

        {/* Supplier */}
        <Text style={styles.label}>Supplier / Station Name</Text>
        <TextInput
          style={styles.input}
          value={supplierName}
          onChangeText={setSupplierName}
          placeholder="e.g. Federated Co-op, Husky"
        />

        {/* District dropdown */}
        <Text style={styles.label}>District</Text>
        <TouchableOpacity
          style={[styles.ddTrigger, districtOpen && styles.ddTriggerOpen]}
          onPress={() => setDistrictOpen(!districtOpen)}
          activeOpacity={0.75}
        >
          <Text style={[styles.ddTriggerText, !districtCode && styles.ddPlaceholder]}>
            {districtCode
              ? districts.find(d => d.code === districtCode)?.name ?? districtCode
              : 'Select a district…'}
          </Text>
          <Text style={styles.ddArrow}>{districtOpen ? '▲' : '▾'}</Text>
        </TouchableOpacity>

        {districtOpen && (
          <View style={styles.ddList}>
            <ScrollView nestedScrollEnabled style={styles.ddScroll}>
              {districts.length === 0 ? (
                <Text style={styles.ddEmpty}>Set your region in Profile to see districts.</Text>
              ) : (
                districts.map((d) => (
                  <TouchableOpacity
                    key={d.code}
                    style={[styles.ddItem, districtCode === d.code && styles.ddItemActive]}
                    onPress={() => { setDistrictCode(d.code); setDistrictOpen(false); }}
                  >
                    <Text style={[styles.ddItemText, districtCode === d.code && styles.ddItemTextActive]}>
                      {d.name}
                    </Text>
                    {districtCode === d.code && <Text style={styles.ddCheck}>✓</Text>}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}

        {submitError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Fuel Price</Text>
        </TouchableOpacity>

      </ScrollView>
      <SuccessToast visible={toastVisible} message="Fuel price submitted — thank you!" onHide={() => setToastVisible(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#f4f8f4' },
  content:              { paddingLeft: 12, paddingRight: 24, paddingTop: 24, paddingBottom: 24 },
  pageTitle:            { fontSize: 26, fontWeight: '800', color: '#1a3c1a', marginBottom: 10 },
  locationBar:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn:              { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e8f4e8', borderWidth: 1, borderColor: '#d0e8d0' },
  backBtnText:          { fontSize: 13, fontWeight: '700', color: '#2d6a2d' },
  locationText:         { fontSize: 13, color: '#666', fontWeight: '500' },
  label:                { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:                { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, fontSize: 16, marginBottom: 20 },

  typeGrid:             { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip:             { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#d0e8d0', backgroundColor: '#fff' },
  typeChipSelected:     { backgroundColor: '#2d6a2d', borderColor: '#2d6a2d' },
  typeChipText:         { fontSize: 13, color: '#2d6a2d', fontWeight: '600' },
  typeChipTextSelected: { color: '#fff' },

  ddTrigger:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, marginBottom: 4 },
  ddTriggerOpen:        { borderColor: '#2d6a2d', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  ddTriggerText:        { fontSize: 16, color: '#1a3c1a', fontWeight: '500' },
  ddPlaceholder:        { color: '#bbb' },
  ddArrow:              { fontSize: 13, color: '#2d6a2d', fontWeight: '700' },
  ddList:               { backgroundColor: '#fff', borderWidth: 1.5, borderTopWidth: 0, borderColor: '#2d6a2d', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, marginBottom: 20, overflow: 'hidden' },
  ddScroll:             { maxHeight: 220 },
  ddItem:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  ddItemActive:         { backgroundColor: '#f0f8f0' },
  ddItemText:           { fontSize: 15, color: '#444' },
  ddItemTextActive:     { color: '#2d6a2d', fontWeight: '700' },
  ddCheck:              { color: '#2d6a2d', fontWeight: '700', fontSize: 15 },
  ddEmpty:              { padding: 16, color: '#999', fontSize: 14, textAlign: 'center' },

  submitButton:         { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
  submitButtonText:     { color: '#fff', fontSize: 17, fontWeight: '700' },

  errorBox:             { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginBottom: 8 },
  errorText:            { fontSize: 14, color: '#c0392b', fontWeight: '600', lineHeight: 20 },
});
