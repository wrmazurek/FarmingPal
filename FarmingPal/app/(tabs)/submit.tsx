import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import SuccessToast from '@/components/SuccessToast';
import AppHeader from '@/components/AppHeader';
import { NON_WHEAT_CROPS, WHEAT_CROPS } from '@/constants/crops';
import { DISTRICTS, REGIONS, getDistrictsByRegion } from '@/constants/regions';
import { Crop, PriceSubmission } from '@/types';

const GRADES = [
  'No. 1',
  'No. 2',
  'No. 3',
  'No. 4',
  'No. 5',
  'Grade A (Premium)',
  'Grade B (Standard)',
  'Grade C (Commercial)',
  'Split vs Broken',
  'Organic vs Conventional',
];

export default function SubmitScreen() {
  const router = useRouter();
  const { profile } = useUser();

  const regionName = REGIONS.find(r => r.code === profile?.regionCode)?.name;
  const countryLabel = profile?.country === 'US' ? 'United States' : 'Canada';

  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [wheatOpen, setWheatOpen] = useState(false);
  const [grade, setGrade] = useState('');
  const [gradeOpen, setGradeOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [basis, setBasis] = useState('');
  const [elevatorName, setElevatorName] = useState('');
  const [districtCode,  setDistrictCode]  = useState(profile?.districtCode ?? '');
  const [districtOpen,  setDistrictOpen]  = useState(false);
  const [toastVisible,  setToastVisible]  = useState(false);
  const [submitError,   setSubmitError]   = useState('');

  const districts = profile?.regionCode ? getDistrictsByRegion(profile.regionCode) : [];
  const currency = profile?.country === 'US' ? 'USD' : 'CAD';

  const handleSubmit = async () => {
    setSubmitError('');
    if (!selectedCrop || !price || !elevatorName || !districtCode) {
      setSubmitError('Please fill in all fields before submitting.');
      return;
    }
    const { error } = await supabase.from('price_submissions').insert({
      crop_id:       selectedCrop.id,
      grade:         grade || null,
      price:         parseFloat(price),
      currency,
      elevator_name: elevatorName,
      district_code: districtCode,
      region_code:   profile?.regionCode ?? '',
      country:       profile?.country ?? 'CA',
    });
    if (error) {
      setSubmitError(error.message);
      return;
    }
    setToastVisible(true);
    setSelectedCrop(null);
    setPrice('');
    setBasis('');
    setElevatorName('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />
      <ScrollView style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Crop Prices</Text>
          <Text style={styles.heroSub}>Cash Price (Bid/Spot) · Corn, Wheat, Canola & more</Text>
        </View>
        <View style={styles.content}>

        <View style={styles.locationBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/pricing')}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.locationText}>
            📍 {countryLabel}{regionName ? ` · ${regionName}` : ''}
          </Text>
        </View>

        <Text style={styles.label}>Crop</Text>

        {/* Primary crop chips */}
        <View style={styles.chipRow}>
          {NON_WHEAT_CROPS.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={[styles.cropChip, selectedCrop?.id === crop.id && styles.cropChipSelected]}
              onPress={() => { setSelectedCrop(crop); setWheatOpen(false); }}
            >
              <Text style={[styles.cropChipText, selectedCrop?.id === crop.id && styles.cropChipTextSelected]}>
                {crop.name}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Wheat dropdown trigger */}
          <TouchableOpacity
            style={[styles.cropChip, (selectedCrop?.id.startsWith('wheat-') || wheatOpen) && styles.cropChipSelected]}
            onPress={() => setWheatOpen(!wheatOpen)}
          >
            <Text style={[styles.cropChipText, (selectedCrop?.id.startsWith('wheat-') || wheatOpen) && styles.cropChipTextSelected]}>
              Wheat {wheatOpen ? '▲' : '▾'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Wheat variety sub-row */}
        {wheatOpen && (
          <View style={styles.wheatRow}>
            {WHEAT_CROPS.map((crop) => (
              <TouchableOpacity
                key={crop.id}
                style={[styles.cropChip, styles.wheatChip, selectedCrop?.id === crop.id && styles.cropChipSelected]}
                onPress={() => { setSelectedCrop(crop); setWheatOpen(false); }}
              >
                <Text style={[styles.cropChipText, selectedCrop?.id === crop.id && styles.cropChipTextSelected]}>
                  {crop.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Grade</Text>
        <TouchableOpacity
          style={[styles.ddTrigger, gradeOpen && styles.ddTriggerOpen]}
          onPress={() => setGradeOpen(!gradeOpen)}
          activeOpacity={0.75}
        >
          <Text style={[styles.ddTriggerText, !grade && styles.ddPlaceholder]}>
            {grade || 'Select a grade…'}
          </Text>
          <Text style={styles.ddArrow}>{gradeOpen ? '▲' : '▾'}</Text>
        </TouchableOpacity>

        {gradeOpen && (
          <View style={styles.ddList}>
            <ScrollView nestedScrollEnabled style={styles.ddScroll}>
              {GRADES.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.ddItem, grade === g && styles.ddItemActive]}
                  onPress={() => { setGrade(g); setGradeOpen(false); }}
                >
                  <Text style={[styles.ddItemText, grade === g && styles.ddItemTextActive]}>{g}</Text>
                  {grade === g && <Text style={styles.ddCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.label}>
          Cash (Bid/Spot) Price ({currency}/{selectedCrop?.unit ?? 'unit'})
        </Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          onBlur={() => { const n = parseFloat(price); if (!isNaN(n)) setPrice(n.toFixed(2)); }}
          placeholder="e.g. 8.45"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>
          Basis ({currency}/{selectedCrop?.unit ?? 'unit'})
        </Text>
        <TextInput
          style={styles.input}
          value={basis}
          onChangeText={setBasis}
          onBlur={() => { const n = parseFloat(basis); if (!isNaN(n)) setBasis(n.toFixed(2)); }}
          placeholder="e.g. -0.55"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Elevator / Buyer Name</Text>
        <TextInput
          style={styles.input}
          value={elevatorName}
          onChangeText={setElevatorName}
          placeholder="e.g. Richardson Pioneer"
        />

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
          <Text style={styles.submitButtonText}>Submit Price</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
      <SuccessToast visible={toastVisible} message="Price submitted — thank you!" onHide={() => setToastVisible(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f4f8f4' },
  hero:                { backgroundColor: '#6B7A2A', paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20, alignItems: 'center' },
  heroTitle:           { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 10 },
  heroSub:             { fontSize: 14, color: '#d8e4a0', textAlign: 'center', lineHeight: 22 },
  content:             { paddingLeft: 12, paddingRight: 24, paddingTop: 24, paddingBottom: 24 },
  pageTitle:           { fontSize: 26, fontWeight: '800', color: '#1a3c1a', marginBottom: 10 },
  locationBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn:             { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e8f4e8', borderWidth: 1, borderColor: '#d0e8d0' },
  backBtnText:         { fontSize: 13, fontWeight: '700', color: '#2d6a2d' },
  locationText:        { fontSize: 13, color: '#666', fontWeight: '500' },
  label:               { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:               { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, fontSize: 16, marginBottom: 20 },
  chipRow:             { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 12 },
  wheatRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
  cropChip:            { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#d0e8d0', backgroundColor: '#fff' },
  wheatChip:           { borderColor: '#b8dbb8' },
  cropChipSelected:    { backgroundColor: '#2d6a2d', borderColor: '#2d6a2d' },
  cropChipText:        { fontSize: 13, color: '#2d6a2d', fontWeight: '600' },
  cropChipTextSelected:{ color: '#fff' },
  ddTrigger:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, marginBottom: 4 },
  ddTriggerOpen:       { borderColor: '#2d6a2d', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  ddTriggerText:       { fontSize: 16, color: '#1a3c1a', fontWeight: '500' },
  ddPlaceholder:       { color: '#bbb' },
  ddArrow:             { fontSize: 13, color: '#2d6a2d', fontWeight: '700' },
  ddList:              { backgroundColor: '#fff', borderWidth: 1.5, borderTopWidth: 0, borderColor: '#2d6a2d', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, marginBottom: 20, overflow: 'hidden' },
  ddScroll:            { maxHeight: 220 },
  ddItem:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  ddItemActive:        { backgroundColor: '#f0f8f0' },
  ddItemText:          { fontSize: 15, color: '#444' },
  ddItemTextActive:    { color: '#2d6a2d', fontWeight: '700' },
  ddCheck:             { color: '#2d6a2d', fontWeight: '700', fontSize: 15 },
  ddEmpty:             { padding: 16, color: '#999', fontSize: 14, textAlign: 'center' },
  submitButton:        { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
  submitButtonText:    { color: '#fff', fontSize: 17, fontWeight: '700' },

  errorBox:            { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginBottom: 8 },
  errorText:           { fontSize: 14, color: '#c0392b', fontWeight: '600', lineHeight: 20 },
});
