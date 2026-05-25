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

const FERT_TYPES = [
  { id: 'urea',        label: 'Urea (46-0-0)' },
  { id: 'anhydrous',   label: 'Anhydrous (82-0-0)' },
  { id: 'uan-28',      label: 'UAN 28-0-0' },
  { id: 'uan-32',      label: 'UAN 32-0-0' },
  { id: 'potash',      label: 'Potash (0-0-60)' },
  { id: 'dap',         label: 'DAP (18-46-0)' },
  { id: 'map',         label: 'MAP (11-52-0)' },
  { id: 'amm-sulph',   label: 'Ammonium Sulphate' },
  { id: 'custom',      label: 'Custom Blend' },
];

export default function SubmitFertScreen() {
  const { profile } = useUser();
  const router = useRouter();

  const isUS         = profile?.country === 'US';
  const currency     = isUS ? 'USD' : 'CAD';
  const unit         = isUS ? 'ton' : 'tonne';
  const districts    = profile?.regionCode ? getDistrictsByRegion(profile.regionCode) : [];
  const regionName   = REGIONS.find(r => r.code === profile?.regionCode)?.name;

  const [fertTypeId,    setFertTypeId]    = useState('');
  const [price,         setPrice]         = useState('');
  const [supplierName,  setSupplierName]  = useState('');
  const [districtCode,  setDistrictCode]  = useState(profile?.districtCode ?? '');
  const [districtOpen,  setDistrictOpen]  = useState(false);
  const [toastVisible,  setToastVisible]  = useState(false);
  const [submitError,   setSubmitError]   = useState('');

  const handleSubmit = async () => {
    setSubmitError('');
    if (!fertTypeId || !price || !supplierName || !districtCode) {
      setSubmitError('Please fill in all fields before submitting.');
      return;
    }
    const { error } = await supabase.from('fertilizer_submissions').insert({
      fert_type_id:  fertTypeId,
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
    setFertTypeId('');
    setPrice('');
    setSupplierName('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.pageTitle}>Fertilizer Price Reporting</Text>

        <View style={styles.locationBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/pricing')}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.locationText}>
            📍 {isUS ? 'United States' : 'Canada'}
            {regionName ? ` · ${regionName}` : ''}
          </Text>
        </View>

        {/* Product type */}
        <Text style={styles.label}>Product Type</Text>
        <View style={styles.typeGrid}>
          {FERT_TYPES.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.typeChip, fertTypeId === f.id && styles.typeChipSelected]}
              onPress={() => setFertTypeId(f.id)}
            >
              <Text style={[styles.typeChipText, fertTypeId === f.id && styles.typeChipTextSelected]}>
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
          placeholder={isUS ? 'e.g. 620.00' : 'e.g. 840.00'}
          keyboardType="decimal-pad"
        />

        {/* Supplier */}
        <Text style={styles.label}>Supplier / Retailer Name</Text>
        <TextInput
          style={styles.input}
          value={supplierName}
          onChangeText={setSupplierName}
          placeholder="e.g. Nutrien, Federated Co-op"
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
          <Text style={styles.submitButtonText}>Submit Fertilizer Price</Text>
        </TouchableOpacity>

      </ScrollView>
      <SuccessToast visible={toastVisible} message="Fertilizer price submitted — thank you!" onHide={() => setToastVisible(false)} />
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
