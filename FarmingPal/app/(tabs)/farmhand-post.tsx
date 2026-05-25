import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Switch, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import AppHeader from '@/components/AppHeader';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { REGIONS, DISTRICTS } from '@/constants/regions';
import type { FarmhandJobType, FarmhandPayType, Country } from '@/types';

const JOB_TYPES: FarmhandJobType[] = ['Full-Time', 'Part-Time', 'Seasonal', 'Casual / Day Labour'];
const PAY_TYPES: FarmhandPayType[] = ['Hourly', 'Salary', 'Piece-Rate', 'Negotiable'];
const COUNTRIES: { code: Country; name: string }[] = [
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'United States' },
];

export default function FarmhandPostScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUser();

  const [title,           setTitle]           = useState('');
  const [jobType,         setJobType]         = useState<FarmhandJobType>('Seasonal');
  const [description,     setDescription]     = useState('');
  const [requirements,    setRequirements]    = useState('');
  const [payRate,         setPayRate]         = useState('');
  const [payType,         setPayType]         = useState<FarmhandPayType>('Hourly');
  const [housingProvided, setHousingProvided] = useState(false);
  const [mealsProvided,   setMealsProvided]   = useState(false);
  const [startDate,       setStartDate]       = useState('');
  const [endDate,         setEndDate]         = useState('');
  const [country,         setCountry]         = useState<Country>(profile?.country ?? 'CA');
  const [regionCode,      setRegionCode]      = useState(profile?.regionCode ?? '');
  const [districtCode,    setDistrictCode]    = useState(profile?.districtCode ?? '');
  const [countryOpen,     setCountryOpen]     = useState(false);
  const [regionOpen,      setRegionOpen]      = useState(false);
  const [districtOpen,    setDistrictOpen]    = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState('');

  const regionList   = REGIONS.filter(r => r.country === country);
  const districtList = DISTRICTS.filter(d => d.regionCode === regionCode);
  const regionName   = REGIONS.find(r => r.code === regionCode)?.name ?? '';
  const districtName = DISTRICTS.find(d => d.code === districtCode)?.name ?? '';

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Job title is required.'); return; }
    if (!regionCode)    { setError('Please select a province / state.'); return; }
    setError('');
    setSaving(true);
    try {
      const { error: err } = await supabase.from('farmhand_postings').insert({
        employer_id:      user?.id ?? null,
        employer_name:    profile?.contactName || profile?.farmName || 'Anonymous',
        title:            title.trim(),
        job_type:         jobType,
        description:      description.trim(),
        requirements:     requirements.trim(),
        pay_rate:         payRate.trim(),
        pay_type:         payType,
        housing_provided: housingProvided,
        meals_provided:   mealsProvided,
        start_date:       startDate.trim(),
        end_date:         endDate.trim(),
        district_code:    districtCode,
        region_code:      regionCode,
        country,
        status:           'open',
      });
      if (err) throw err;
      router.replace('/(tabs)/farmhands' as any);
    } catch {
      setError('Could not post the job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.pageTitle}>Post a Farm Job</Text>

        {/* Job Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Harvest Operator" placeholderTextColor="#bbb" />
          </View>

          {/* Job Type */}
          <View style={styles.field}>
            <Text style={styles.label}>Job Type</Text>
            <View style={styles.chipRow}>
              {JOB_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, jobType === t && styles.chipActive]}
                  onPress={() => setJobType(t)}
                >
                  <Text style={[styles.chipText, jobType === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Describe the role, duties, and what a typical day looks like..." placeholderTextColor="#bbb" multiline numberOfLines={4} />
          </View>

          <View style={[styles.field, styles.fieldLast]}>
            <Text style={styles.label}>Requirements</Text>
            <TextInput style={[styles.input, styles.textArea]} value={requirements} onChangeText={setRequirements} placeholder="Experience, licences, physical requirements..." placeholderTextColor="#bbb" multiline numberOfLines={3} />
          </View>
        </View>

        {/* Pay & Perks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pay & Perks</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Pay Type</Text>
            <View style={styles.chipRow}>
              {PAY_TYPES.map(t => (
                <TouchableOpacity key={t} style={[styles.chip, payType === t && styles.chipActive]} onPress={() => setPayType(t)}>
                  <Text style={[styles.chipText, payType === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Pay Rate</Text>
            <TextInput style={styles.input} value={payRate} onChangeText={setPayRate} placeholder="e.g. $22/hr or $65,000/yr" placeholderTextColor="#bbb" />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Text style={styles.switchLabel}>Housing Provided</Text>
              <Text style={styles.switchHint}>On-site accommodation included</Text>
            </View>
            <Switch value={housingProvided} onValueChange={setHousingProvided} trackColor={{ false: '#e0e0e0', true: '#2d6a2d' }} thumbColor="#fff" />
          </View>

          <View style={[styles.switchRow, styles.fieldLast]}>
            <View style={styles.switchLeft}>
              <Text style={styles.switchLabel}>Meals Provided</Text>
              <Text style={styles.switchHint}>Meals included during shift</Text>
            </View>
            <Switch value={mealsProvided} onValueChange={setMealsProvided} trackColor={{ false: '#e0e0e0', true: '#2d6a2d' }} thumbColor="#fff" />
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          <View style={styles.twoCol}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" placeholderTextColor="#bbb" />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>End Date</Text>
              <TextInput style={[styles.input, styles.fieldLast]} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" placeholderTextColor="#bbb" />
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          {/* Country */}
          <View style={styles.field}>
            <Text style={styles.label}>Country</Text>
            <TouchableOpacity style={[styles.ddBtn, countryOpen && styles.ddBtnActive]} onPress={() => { setCountryOpen(o => !o); setRegionOpen(false); setDistrictOpen(false); }}>
              <Text style={styles.ddBtnText}>{COUNTRIES.find(c => c.code === country)?.name ?? 'Select ▾'}</Text>
            </TouchableOpacity>
            {countryOpen && (
              <View style={styles.ddList}>
                {COUNTRIES.map(c => (
                  <TouchableOpacity key={c.code} style={[styles.ddItem, country === c.code && styles.ddItemActive]}
                    onPress={() => { setCountry(c.code); setRegionCode(''); setDistrictCode(''); setCountryOpen(false); }}>
                    <Text style={[styles.ddItemText, country === c.code && styles.ddItemTextActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Province / State */}
          <View style={styles.field}>
            <Text style={styles.label}>Province / State *</Text>
            <TouchableOpacity style={[styles.ddBtn, regionOpen && styles.ddBtnActive]} onPress={() => { setRegionOpen(o => !o); setCountryOpen(false); setDistrictOpen(false); }}>
              <Text style={[styles.ddBtnText, !regionCode && styles.ddPlaceholder]}>{regionName || 'Select ▾'}</Text>
            </TouchableOpacity>
            {regionOpen && (
              <ScrollView style={styles.ddList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                {regionList.map(r => (
                  <TouchableOpacity key={r.code} style={[styles.ddItem, regionCode === r.code && styles.ddItemActive]}
                    onPress={() => { setRegionCode(r.code); setDistrictCode(''); setRegionOpen(false); }}>
                    <Text style={[styles.ddItemText, regionCode === r.code && styles.ddItemTextActive]}>{r.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* District */}
          {regionCode !== '' && (
            <View style={[styles.field, styles.fieldLast]}>
              <Text style={styles.label}>District</Text>
              <TouchableOpacity style={[styles.ddBtn, districtOpen && styles.ddBtnActive]} onPress={() => { setDistrictOpen(o => !o); setCountryOpen(false); setRegionOpen(false); }}>
                <Text style={[styles.ddBtnText, !districtCode && styles.ddPlaceholder]}>{districtName || 'Select ▾'}</Text>
              </TouchableOpacity>
              {districtOpen && (
                <ScrollView style={styles.ddList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {districtList.map(d => (
                    <TouchableOpacity key={d.code} style={[styles.ddItem, districtCode === d.code && styles.ddItemActive]}
                      onPress={() => { setDistrictCode(d.code); setDistrictOpen(false); }}>
                      <Text style={[styles.ddItemText, districtCode === d.code && styles.ddItemTextActive]}>{d.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <TouchableOpacity style={[styles.submitBtn, saving && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={saving}>
          <Text style={styles.submitBtnText}>{saving ? 'Posting...' : 'Post Job'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f4' },
  content:   { padding: 16, paddingBottom: 48 },

  pageTitle: { fontSize: 22, fontWeight: '900', color: '#1a3c1a', marginBottom: 16 },

  section:      { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#c8931a', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 },

  field:     { marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 14 },
  fieldLast: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
  label:     { fontSize: 13, fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  input:     { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 12, fontSize: 15, color: '#1a3c1a' },
  textArea:  { minHeight: 90, textAlignVertical: 'top' },

  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:          { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#f4f8f4', borderWidth: 1.5, borderColor: '#d0e8d0' },
  chipActive:    { backgroundColor: '#7a5230', borderColor: '#7a5230' },
  chipText:      { fontSize: 13, fontWeight: '600', color: '#555' },
  chipTextActive:{ color: '#fff' },

  switchRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  switchLeft: { flex: 1, marginRight: 12 },
  switchLabel:{ fontSize: 15, color: '#1a3c1a', fontWeight: '500' },
  switchHint: { fontSize: 12, color: '#aaa', marginTop: 2 },

  twoCol:    { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },

  ddBtn:         { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 12, marginBottom: 4 },
  ddBtnActive:   { borderColor: '#2d6a2d' },
  ddBtnText:     { fontSize: 15, color: '#1a3c1a' },
  ddPlaceholder: { color: '#bbb' },
  ddList:        { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#2d6a2d', marginBottom: 8, overflow: 'hidden', maxHeight: 200 },
  ddItem:        { paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  ddItemActive:  { backgroundColor: '#2d6a2d' },
  ddItemText:    { fontSize: 14, color: '#1a3c1a' },
  ddItemTextActive: { color: '#fff', fontWeight: '700' },

  errorBox:  { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginBottom: 10 },
  errorText: { fontSize: 14, color: '#c0392b', fontWeight: '600' },

  submitBtn:         { backgroundColor: '#7a5230', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 10 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText:     { color: '#fff', fontSize: 17, fontWeight: '700' },
  cancelBtn:         { borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fff' },
  cancelBtnText:     { color: '#888', fontWeight: '600', fontSize: 15 },
});
