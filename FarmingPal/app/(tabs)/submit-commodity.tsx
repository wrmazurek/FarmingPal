import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import AppHeader from '@/components/AppHeader';
import SuccessToast from '@/components/SuccessToast';
import { NON_WHEAT_CROPS, WHEAT_CROPS } from '@/constants/crops';
import { LIVESTOCK_TYPES } from '@/constants/livestock';
import { REGIONS, getDistrictsByRegion } from '@/constants/regions';
import type { Crop } from '@/types';

const GRAIN_COLOR     = '#6B7A2A';
const LIVESTOCK_COLOR = '#8B2E2E';

const GRADES = [
  'No. 1', 'No. 2', 'No. 3', 'No. 4', 'No. 5',
  'Grade A (Premium)', 'Grade B (Standard)', 'Grade C (Commercial)',
  'Split vs Broken', 'Organic vs Conventional',
];

type ActiveTab = 'grain' | 'livestock';

export default function SubmitCommodityScreen() {
  const router = useRouter();
  const { profile } = useUser();

  const isUS       = profile?.country === 'US';
  const currency   = isUS ? 'USD' : 'CAD';
  const regionName = REGIONS.find(r => r.code === profile?.regionCode)?.name;
  const districts  = profile?.regionCode ? getDistrictsByRegion(profile.regionCode) : [];

  const [activeTab, setActiveTab] = useState<ActiveTab>('grain');

  // ── Grain form state ─────────────────────────────────────────────────────────
  const [selectedCrop,  setSelectedCrop]  = useState<Crop | null>(null);
  const [wheatOpen,     setWheatOpen]     = useState(false);
  const [grade,         setGrade]         = useState('');
  const [gradeOpen,     setGradeOpen]     = useState(false);
  const [grainPrice,    setGrainPrice]    = useState('');
  const [basis,         setBasis]         = useState('');
  const [elevatorName,  setElevatorName]  = useState('');
  const [grainDistrict, setGrainDistrict] = useState(profile?.districtCode ?? '');
  const [grainDistOpen, setGrainDistOpen] = useState(false);
  const [grainError,    setGrainError]    = useState('');

  // ── Livestock form state ──────────────────────────────────────────────────────
  const [livestockId,   setLivestockId]   = useState('');
  const [lsPrice,       setLsPrice]       = useState('');
  const [buyerName,     setBuyerName]     = useState('');
  const [lsDistrict,    setLsDistrict]    = useState(profile?.districtCode ?? '');
  const [lsDistOpen,    setLsDistOpen]    = useState(false);
  const [lsError,       setLsError]       = useState('');

  // ── Shared toast ─────────────────────────────────────────────────────────────
  const [toastVisible,  setToastVisible]  = useState(false);
  const [toastMessage,  setToastMessage]  = useState('');

  const showToast = (msg: string) => { setToastMessage(msg); setToastVisible(true); };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleGrainSubmit = async () => {
    setGrainError('');
    if (!selectedCrop || !grainPrice || !elevatorName || !grainDistrict) {
      setGrainError('Please fill in all fields before submitting.');
      return;
    }
    const { error } = await supabase.from('price_submissions').insert({
      crop_id:       selectedCrop.id,
      grade:         grade || null,
      price:         parseFloat(grainPrice),
      currency,
      elevator_name: elevatorName,
      district_code: grainDistrict,
      region_code:   profile?.regionCode ?? '',
      country:       profile?.country ?? 'CA',
    });
    if (error) { setGrainError(error.message); return; }
    showToast('Grain price submitted — thank you!');
    setSelectedCrop(null);
    setGrainPrice('');
    setBasis('');
    setElevatorName('');
  };

  const handleLivestockSubmit = async () => {
    setLsError('');
    if (!livestockId || !lsPrice || !buyerName || !lsDistrict) {
      setLsError('Please fill in all fields before submitting.');
      return;
    }
    const { error } = await supabase.from('livestock_submissions').insert({
      livestock_id:  livestockId,
      price:         parseFloat(lsPrice),
      currency,
      buyer_name:    buyerName,
      district_code: lsDistrict,
      region_code:   profile?.regionCode ?? '',
      country:       profile?.country ?? 'CA',
    });
    if (error) { setLsError(error.message); return; }
    showToast('Livestock price submitted — thank you!');
    setLivestockId('');
    setLsPrice('');
    setBuyerName('');
  };

  const accentColor = activeTab === 'grain' ? GRAIN_COLOR : LIVESTOCK_COLOR;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />
      <ScrollView style={styles.container}>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: accentColor }]}>
          <Text style={styles.heroTitle}>Commodity Prices</Text>
          <Text style={styles.heroSub}>
            {activeTab === 'grain'
              ? 'Cash Price (Bid/Spot) · Grain & Crops'
              : 'Beef, Hogs, Sheep, Dairy & Poultry · per cwt'}
          </Text>
        </View>

        <View style={styles.content}>

          {/* Back + location */}
          <View style={styles.locationBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/pricing')}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.locationText}>
              📍 {isUS ? 'United States' : 'Canada'}{regionName ? ` · ${regionName}` : ''}
            </Text>
          </View>

          {/* Toggle */}
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, activeTab === 'grain' && { backgroundColor: GRAIN_COLOR, borderColor: GRAIN_COLOR }]}
              onPress={() => setActiveTab('grain')}
            >
              <Text style={[styles.toggleBtnText, activeTab === 'grain' && styles.toggleBtnTextActive]}>
                🌾 Grain
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, activeTab === 'livestock' && { backgroundColor: LIVESTOCK_COLOR, borderColor: LIVESTOCK_COLOR }]}
              onPress={() => setActiveTab('livestock')}
            >
              <Text style={[styles.toggleBtnText, activeTab === 'livestock' && styles.toggleBtnTextActive]}>
                🐄 Livestock
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── GRAIN FORM ──────────────────────────────────────────────────── */}
          {activeTab === 'grain' && (
            <>
              <Text style={styles.label}>Crop</Text>
              <View style={styles.chipRow}>
                {NON_WHEAT_CROPS.map((crop) => (
                  <TouchableOpacity
                    key={crop.id}
                    style={[styles.chip, selectedCrop?.id === crop.id && styles.chipActive]}
                    onPress={() => { setSelectedCrop(crop); setWheatOpen(false); }}
                  >
                    <Text style={[styles.chipText, selectedCrop?.id === crop.id && styles.chipTextActive]}>
                      {crop.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.chip, (selectedCrop?.id.startsWith('wheat-') || wheatOpen) && styles.chipActive]}
                  onPress={() => setWheatOpen(!wheatOpen)}
                >
                  <Text style={[styles.chipText, (selectedCrop?.id.startsWith('wheat-') || wheatOpen) && styles.chipTextActive]}>
                    Wheat {wheatOpen ? '▲' : '▾'}
                  </Text>
                </TouchableOpacity>
              </View>

              {wheatOpen && (
                <View style={styles.chipRow}>
                  {WHEAT_CROPS.map((crop) => (
                    <TouchableOpacity
                      key={crop.id}
                      style={[styles.chip, styles.chipSecondary, selectedCrop?.id === crop.id && styles.chipActive]}
                      onPress={() => { setSelectedCrop(crop); setWheatOpen(false); }}
                    >
                      <Text style={[styles.chipText, selectedCrop?.id === crop.id && styles.chipTextActive]}>
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
                value={grainPrice}
                onChangeText={setGrainPrice}
                onBlur={() => { const n = parseFloat(grainPrice); if (!isNaN(n)) setGrainPrice(n.toFixed(2)); }}
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
                style={[styles.ddTrigger, grainDistOpen && styles.ddTriggerOpen]}
                onPress={() => setGrainDistOpen(!grainDistOpen)}
                activeOpacity={0.75}
              >
                <Text style={[styles.ddTriggerText, !grainDistrict && styles.ddPlaceholder]}>
                  {grainDistrict
                    ? districts.find(d => d.code === grainDistrict)?.name ?? grainDistrict
                    : 'Select a district…'}
                </Text>
                <Text style={styles.ddArrow}>{grainDistOpen ? '▲' : '▾'}</Text>
              </TouchableOpacity>
              {grainDistOpen && (
                <View style={styles.ddList}>
                  <ScrollView nestedScrollEnabled style={styles.ddScroll}>
                    {districts.length === 0 ? (
                      <Text style={styles.ddEmpty}>Set your region in Profile to see districts.</Text>
                    ) : districts.map((d) => (
                      <TouchableOpacity
                        key={d.code}
                        style={[styles.ddItem, grainDistrict === d.code && styles.ddItemActive]}
                        onPress={() => { setGrainDistrict(d.code); setGrainDistOpen(false); }}
                      >
                        <Text style={[styles.ddItemText, grainDistrict === d.code && styles.ddItemTextActive]}>
                          {d.name}
                        </Text>
                        {grainDistrict === d.code && <Text style={styles.ddCheck}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {grainError ? (
                <View style={styles.errorBox}><Text style={styles.errorText}>{grainError}</Text></View>
              ) : null}

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: GRAIN_COLOR }]} onPress={handleGrainSubmit}>
                <Text style={styles.submitBtnText}>Submit Grain Price</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── LIVESTOCK FORM ───────────────────────────────────────────────── */}
          {activeTab === 'livestock' && (
            <>
              <Text style={styles.label}>Livestock Type</Text>
              <View style={styles.chipRow}>
                {LIVESTOCK_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.chip, livestockId === t.id && styles.chipActiveLs]}
                    onPress={() => setLivestockId(t.id)}
                  >
                    <Text style={[styles.chipTextLs, livestockId === t.id && styles.chipTextActive]}>
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Price ({currency}/cwt)</Text>
              <TextInput
                style={styles.input}
                value={lsPrice}
                onChangeText={setLsPrice}
                onBlur={() => { const n = parseFloat(lsPrice); if (!isNaN(n)) setLsPrice(n.toFixed(2)); }}
                placeholder={isUS ? 'e.g. 185.00' : 'e.g. 250.00'}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Buyer / Auction Market</Text>
              <TextInput
                style={styles.input}
                value={buyerName}
                onChangeText={setBuyerName}
                placeholder="e.g. Heartland Livestock, Cargill, local auction"
              />

              <Text style={styles.label}>District</Text>
              <TouchableOpacity
                style={[styles.ddTrigger, lsDistOpen && styles.ddTriggerOpen]}
                onPress={() => setLsDistOpen(!lsDistOpen)}
                activeOpacity={0.75}
              >
                <Text style={[styles.ddTriggerText, !lsDistrict && styles.ddPlaceholder]}>
                  {lsDistrict
                    ? districts.find(d => d.code === lsDistrict)?.name ?? lsDistrict
                    : 'Select a district…'}
                </Text>
                <Text style={styles.ddArrow}>{lsDistOpen ? '▲' : '▾'}</Text>
              </TouchableOpacity>
              {lsDistOpen && (
                <View style={styles.ddList}>
                  <ScrollView nestedScrollEnabled style={styles.ddScroll}>
                    {districts.length === 0 ? (
                      <Text style={styles.ddEmpty}>Set your region in Profile to see districts.</Text>
                    ) : districts.map((d) => (
                      <TouchableOpacity
                        key={d.code}
                        style={[styles.ddItem, lsDistrict === d.code && styles.ddItemActive]}
                        onPress={() => { setLsDistrict(d.code); setLsDistOpen(false); }}
                      >
                        <Text style={[styles.ddItemText, lsDistrict === d.code && styles.ddItemTextActive]}>
                          {d.name}
                        </Text>
                        {lsDistrict === d.code && <Text style={styles.ddCheck}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {lsError ? (
                <View style={styles.errorBox}><Text style={styles.errorText}>{lsError}</Text></View>
              ) : null}

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: LIVESTOCK_COLOR }]} onPress={handleLivestockSubmit}>
                <Text style={styles.submitBtnText}>Submit Livestock Price</Text>
              </TouchableOpacity>

            </>
          )}

        </View>
      </ScrollView>
      <SuccessToast visible={toastVisible} message={toastMessage} onHide={() => setToastVisible(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f4f8f4' },
  hero:                { paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20, alignItems: 'center' },
  heroTitle:           { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 10 },
  heroSub:             { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22 },
  content:             { paddingLeft: 12, paddingRight: 24, paddingTop: 24, paddingBottom: 32 },

  locationBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn:             { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e8f4e8', borderWidth: 1, borderColor: '#d0e8d0' },
  backBtnText:         { fontSize: 13, fontWeight: '700', color: '#2d6a2d' },
  locationText:        { fontSize: 13, color: '#666', fontWeight: '500' },

  toggle:              { flexDirection: 'row', borderRadius: 12, borderWidth: 1.5, borderColor: '#d0e8d0', overflow: 'hidden', marginBottom: 28, backgroundColor: '#fff' },
  toggleBtn:           { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff', borderColor: 'transparent' },
  toggleBtnText:       { fontSize: 15, fontWeight: '700', color: '#555' },
  toggleBtnTextActive: { color: '#fff' },

  label:               { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:               { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, fontSize: 16, marginBottom: 20 },

  chipRow:             { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip:                { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#d0e8d0', backgroundColor: '#fff' },
  chipSecondary:       { borderColor: '#b8dbb8' },
  chipActive:          { backgroundColor: '#6B7A2A', borderColor: '#6B7A2A' },
  chipActiveLs:        { backgroundColor: '#8B2E2E', borderColor: '#8B2E2E' },
  chipText:            { fontSize: 13, color: '#6B7A2A', fontWeight: '600' },
  chipTextLs:          { fontSize: 13, color: '#8B2E2E', fontWeight: '600' },
  chipTextActive:      { color: '#fff' },

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

  submitBtn:           { borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
  submitBtnText:       { color: '#fff', fontSize: 17, fontWeight: '700' },

  browseLink:          { marginTop: 16, alignItems: 'center' },
  browseLinkText:      { fontSize: 14, color: '#8B2E2E', fontWeight: '600' },

  errorBox:            { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginBottom: 8 },
  errorText:           { fontSize: 14, color: '#c0392b', fontWeight: '600', lineHeight: 20 },
});
