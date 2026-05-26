import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { REGIONS, DISTRICTS } from '@/constants/regions';
import type { FarmhandPosting, FarmhandJobType } from '@/types';

const JOB_TYPES: FarmhandJobType[] = ['Full-Time', 'Part-Time', 'Seasonal', 'Casual / Day Labour'];

function timeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? '1d ago' : `${d}d ago`;
}

function dbRowToPosting(row: any): FarmhandPosting {
  return {
    id: row.id,
    employerId: row.employer_id ?? '',
    employerName: row.employer_name,
    title: row.title,
    jobType: row.job_type,
    description: row.description ?? '',
    requirements: row.requirements ?? '',
    payRate: row.pay_rate ?? '',
    payType: row.pay_type ?? 'Negotiable',
    housingProvided: row.housing_provided ?? false,
    mealsProvided: row.meals_provided ?? false,
    startDate: row.start_date ?? '',
    endDate: row.end_date ?? '',
    districtCode: row.district_code ?? '',
    regionCode: row.region_code ?? '',
    country: row.country ?? 'CA',
    status: row.status ?? 'open',
    postedAt: row.posted_at,
  };
}

export default function FarmhandsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { profile } = useUser();

  const [postings, setPostings]           = useState<FarmhandPosting[]>([]);
  const [loading, setLoading]             = useState(true);
  const savedPrefs = (profile?.farmhandJobPrefs ?? '').split(',').map(s => s.trim()).filter(Boolean) as FarmhandJobType[];
  const [activeTypes, setActiveTypes]     = useState<FarmhandJobType[]>(savedPrefs);
  const [filterRegion, setFilterRegion]   = useState(profile?.regionCode ?? '');
  const [filterDistricts, setFilterDistricts] = useState<string[]>(
    profile?.districtCode ? [profile.districtCode] : []
  );

  const regionList   = REGIONS.filter(r => r.country === (profile?.country ?? 'CA'));
  const districtList = DISTRICTS.filter(d => d.regionCode === filterRegion);

  useEffect(() => {
    supabase
      .from('farmhand_postings')
      .select('*')
      .eq('status', 'open')
      .order('posted_at', { ascending: false })
      .then(({ data }) => {
        setPostings((data ?? []).map(dbRowToPosting));
        setLoading(false);
      });
  }, []);

  const toggleType = (t: FarmhandJobType) =>
    setActiveTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const toggleDistrict = (code: string) =>
    setFilterDistricts(prev => prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]);

  const filtered = postings
    .filter(p => activeTypes.length === 0 || activeTypes.includes(p.jobType))
    .filter(p => !filterRegion || p.regionCode === filterRegion)
    .filter(p => filterDistricts.length === 0 || filterDistricts.includes(p.districtCode));

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Farmhands — Employment Postings</Text>
          <Text style={styles.heroSub}>Post or find seasonal and full-time farm employment across your region.</Text>
          {isAuthenticated && (
            <TouchableOpacity style={styles.postBtn} onPress={() => router.push('/(tabs)/farmhand-post' as any)}>
              <Text style={styles.postBtnText}>+ Post a Job</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Job type filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow} contentContainerStyle={styles.typeRowInner}>
          {JOB_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, activeTypes.includes(t) && styles.typeChipActive]}
              onPress={() => toggleType(t)}
            >
              <Text style={[styles.typeChipText, activeTypes.includes(t) && styles.typeChipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Province filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionRow} contentContainerStyle={styles.regionRowInner}>
          <TouchableOpacity
            style={[styles.regionPill, !filterRegion && styles.regionPillActive]}
            onPress={() => { setFilterRegion(''); setFilterDistricts([]); }}
          >
            <Text style={[styles.regionPillText, !filterRegion && styles.regionPillTextActive]}>All</Text>
          </TouchableOpacity>
          {regionList.map(r => (
            <TouchableOpacity
              key={r.code}
              style={[styles.regionPill, filterRegion === r.code && styles.regionPillActive]}
              onPress={() => { setFilterRegion(r.code); setFilterDistricts([]); }}
            >
              <Text style={[styles.regionPillText, filterRegion === r.code && styles.regionPillTextActive]}>{r.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* District filter */}
        {filterRegion !== '' && (
          <View style={styles.districtWrap}>
            {districtList.map(d => (
              <TouchableOpacity
                key={d.code}
                style={[styles.districtChip, filterDistricts.includes(d.code) && styles.districtChipActive]}
                onPress={() => toggleDistrict(d.code)}
              >
                <Text style={[styles.districtChipText, filterDistricts.includes(d.code) && styles.districtChipTextActive]}>{d.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Listings */}
        {loading ? (
          <ActivityIndicator color="#2d6a2d" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="account-hard-hat-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No postings match your filters.</Text>
          </View>
        ) : (
          filtered.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/(tabs)/farmhand-detail' as any, params: { id: p.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{p.title}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: typeColor(p.jobType) + '22' }]}>
                    <Text style={[styles.typeBadgeText, { color: typeColor(p.jobType) }]}>{p.jobType}</Text>
                  </View>
                </View>
                <Text style={styles.cardEmployer}>{p.employerName}</Text>
              </View>
              <View style={styles.cardMeta}>
                {p.payRate ? (
                  <View style={styles.metaChip}>
                    <MaterialCommunityIcons name="currency-usd" size={13} color="#666" />
                    <Text style={styles.metaText}>{p.payRate} / {p.payType}</Text>
                  </View>
                ) : null}
                {(p.housingProvided || p.mealsProvided) && (
                  <View style={styles.metaChip}>
                    <MaterialCommunityIcons name="home-outline" size={13} color="#666" />
                    <Text style={styles.metaText}>
                      {[p.housingProvided && 'Housing', p.mealsProvided && 'Meals'].filter(Boolean).join(' + ')}
                    </Text>
                  </View>
                )}
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="map-marker-outline" size={13} color="#666" />
                  <Text style={styles.metaText}>
                    {DISTRICTS.find(d => d.code === p.districtCode)?.name ?? REGIONS.find(r => r.code === p.regionCode)?.name ?? p.country}
                  </Text>
                </View>
                <Text style={styles.cardAge}>{timeAgo(p.postedAt)}</Text>
              </View>
              {p.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>{p.description}</Text>
              ) : null}
            </TouchableOpacity>
          ))
        )}

        {!isAuthenticated && (
          <TouchableOpacity style={styles.signInPrompt} onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={styles.signInPromptText}>Sign in to post a job →</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

function typeColor(t: FarmhandJobType): string {
  switch (t) {
    case 'Full-Time':          return '#2d6a2d';
    case 'Part-Time':          return '#c8931a';
    case 'Seasonal':           return '#4a7c59';
    case 'Casual / Day Labour':return '#7a5230';
    default:                   return '#666';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f4' },
  content:   { paddingBottom: 48 },

  hero:       { backgroundColor: '#7a5230', paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20, alignItems: 'center' },
  heroTitle:  { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 10 },
  heroSub:    { fontSize: 14, color: '#e8c9a8', textAlign: 'center', lineHeight: 22, marginBottom: 14 },
  postBtn:    { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  postBtnText:{ color: '#7a5230', fontWeight: '800', fontSize: 14 },

  typeRow:       { maxHeight: 48 },
  typeRowInner:  { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  typeChip:      { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#d0e8d0' },
  typeChipActive:{ backgroundColor: '#7a5230', borderColor: '#7a5230' },
  typeChipText:  { fontSize: 13, fontWeight: '600', color: '#555' },
  typeChipTextActive: { color: '#fff' },

  regionRow:      { maxHeight: 44 },
  regionRowInner: { paddingHorizontal: 16, paddingVertical: 6, gap: 8, flexDirection: 'row' },
  regionPill:     { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#d0e8d0' },
  regionPillActive: { backgroundColor: '#2d6a2d', borderColor: '#2d6a2d' },
  regionPillText: { fontSize: 13, fontWeight: '600', color: '#555' },
  regionPillTextActive: { color: '#fff' },

  districtWrap:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  districtChip:       { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#d0e8d0' },
  districtChipActive: { backgroundColor: '#2d6a2d', borderColor: '#2d6a2d' },
  districtChipText:   { fontSize: 12, color: '#555', fontWeight: '600' },
  districtChipTextActive: { color: '#fff' },

  emptyBox:  { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#aaa' },

  card:        { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTop:     { marginBottom: 10 },
  cardTitleRow:{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 },
  cardTitle:   { fontSize: 16, fontWeight: '800', color: '#1a3c1a', flex: 1 },
  cardEmployer:{ fontSize: 13, color: '#888' },

  typeBadge:     { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, flexShrink: 0 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },

  cardMeta:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  metaChip:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText:  { fontSize: 12, color: '#666' },
  cardAge:   { fontSize: 11, color: '#bbb', marginLeft: 'auto' },
  cardDesc:  { fontSize: 13, color: '#777', lineHeight: 19 },

  signInPrompt:     { margin: 20, alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#d0e8d0' },
  signInPromptText: { fontSize: 14, fontWeight: '700', color: '#2d6a2d' },
});
