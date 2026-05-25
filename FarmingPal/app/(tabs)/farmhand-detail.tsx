import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { supabase } from '@/lib/supabase';
import { REGIONS, DISTRICTS } from '@/constants/regions';
import type { FarmhandPosting } from '@/types';

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

export default function FarmhandDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [posting, setPosting] = useState<FarmhandPosting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from('farmhand_postings').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) setPosting(dbRowToPosting(data));
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <View style={styles.container}>
      <AppHeader />
      <ActivityIndicator color="#7a5230" style={{ marginTop: 60 }} />
    </View>
  );

  if (!posting) return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Job posting not found.</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>← Back</Text></TouchableOpacity>
      </View>
    </View>
  );

  const regionName   = REGIONS.find(r => r.code === posting.regionCode)?.name ?? posting.regionCode;
  const districtName = DISTRICTS.find(d => d.code === posting.districtCode)?.name ?? '';
  const location     = [districtName, regionName, posting.country].filter(Boolean).join(', ');

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.headerCard}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={18} color="#7a5230" />
            <Text style={styles.backBtnText}>All Jobs</Text>
          </TouchableOpacity>

          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{posting.jobType}</Text>
          </View>
          <Text style={styles.title}>{posting.title}</Text>
          <Text style={styles.employer}>{posting.employerName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <MaterialCommunityIcons name="map-marker-outline" size={14} color="#888" />
              <Text style={styles.metaText}>{location}</Text>
            </View>
            {posting.payRate ? (
              <View style={styles.metaChip}>
                <MaterialCommunityIcons name="currency-usd" size={14} color="#888" />
                <Text style={styles.metaText}>{posting.payRate} · {posting.payType}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Perks */}
        {(posting.housingProvided || posting.mealsProvided || posting.startDate) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            <View style={styles.highlightRow}>
              {posting.housingProvided && (
                <View style={styles.highlight}>
                  <MaterialCommunityIcons name="home-outline" size={20} color="#2d6a2d" />
                  <Text style={styles.highlightText}>Housing{'\n'}Provided</Text>
                </View>
              )}
              {posting.mealsProvided && (
                <View style={styles.highlight}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#2d6a2d" />
                  <Text style={styles.highlightText}>Meals{'\n'}Provided</Text>
                </View>
              )}
              {posting.startDate && (
                <View style={styles.highlight}>
                  <MaterialCommunityIcons name="calendar-start" size={20} color="#2d6a2d" />
                  <Text style={styles.highlightText}>Starts{'\n'}{posting.startDate}</Text>
                </View>
              )}
              {posting.endDate && (
                <View style={styles.highlight}>
                  <MaterialCommunityIcons name="calendar-end" size={20} color="#2d6a2d" />
                  <Text style={styles.highlightText}>Ends{'\n'}{posting.endDate}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Description */}
        {posting.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Role</Text>
            <Text style={styles.body}>{posting.description}</Text>
          </View>
        ) : null}

        {/* Requirements */}
        {posting.requirements ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <Text style={styles.body}>{posting.requirements}</Text>
          </View>
        ) : null}

        {/* Apply */}
        {posting.status === 'open' ? (
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => router.push({ pathname: '/(tabs)/farmhand-apply' as any, params: { id: posting.id, title: posting.title } })}
          >
            <Text style={styles.applyBtnText}>Apply for This Job →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.filledBanner}>
            <Text style={styles.filledText}>This position has been filled.</Text>
          </View>
        )}

        <TouchableOpacity style={styles.backBtnBottom} onPress={() => router.back()}>
          <Text style={styles.backBtnBottomText}>← Back to Job Board</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f4' },
  content:   { padding: 16, paddingBottom: 48 },

  emptyBox:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { fontSize: 15, color: '#aaa' },
  backLink:  { fontSize: 14, color: '#7a5230', fontWeight: '700' },

  headerCard:  { backgroundColor: '#fff', borderRadius: 14, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  backBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  backBtnText: { fontSize: 13, fontWeight: '600', color: '#7a5230' },

  typeBadge:     { alignSelf: 'flex-start', backgroundColor: '#7a523018', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8 },
  typeBadgeText: { fontSize: 12, fontWeight: '700', color: '#7a5230' },

  title:    { fontSize: 22, fontWeight: '900', color: '#1a3c1a', marginBottom: 4 },
  employer: { fontSize: 14, color: '#888', marginBottom: 12 },

  metaRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#666' },

  section:      { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#c8931a', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  body:         { fontSize: 15, color: '#444', lineHeight: 24 },

  highlightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  highlight:    { backgroundColor: '#f0f8f0', borderRadius: 10, padding: 14, alignItems: 'center', gap: 6, minWidth: 90 },
  highlightText:{ fontSize: 12, fontWeight: '600', color: '#2d6a2d', textAlign: 'center', lineHeight: 16 },

  applyBtn:     { backgroundColor: '#7a5230', borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 12 },
  applyBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  filledBanner: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 12 },
  filledText:   { fontSize: 15, color: '#aaa', fontWeight: '600' },

  backBtnBottom:     { alignItems: 'center', padding: 14 },
  backBtnBottomText: { fontSize: 14, color: '#7a5230', fontWeight: '600' },
});
