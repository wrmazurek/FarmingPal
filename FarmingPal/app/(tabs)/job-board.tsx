import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { useJobBoard } from '@/context/JobBoardContext';
import { REGIONS, DISTRICTS, getRegionsByCountry, getDistrictsByRegion } from '@/constants/regions';
import { SERVICE_TYPES } from '@/constants/services';
import type { JobPosting } from '@/types';

function AuthGate() {
  const router = useRouter();
  return (
    <View style={styles.gate}>
      <MaterialCommunityIcons name="briefcase-search" size={52} color="#d0e8d0" />
      <Text style={styles.gateTitle}>Sign in to View the Job Board</Text>
      <Text style={styles.gateSub}>Find custom farming work posted by landowners in your district.</Text>
      <TouchableOpacity style={styles.gateBtn} onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.gateBtnText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
        <Text style={styles.gateLink}>Create Account →</Text>
      </TouchableOpacity>
    </View>
  );
}

function JobCard({ job, onPress }: { job: JobPosting; onPress: () => void }) {
  const daysAgo = Math.floor((Date.now() - new Date(job.postedAt).getTime()) / 86400000);
  const postedLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;
  const district = DISTRICTS.find(d => d.code === job.districtCode)?.name ?? job.districtCode;
  const region   = REGIONS.find(r => r.code === job.regionCode)?.name ?? job.regionCode;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardServices}>{job.services.join(' · ')}</Text>
          <Text style={styles.cardFarmer}>{job.farmerName}</Text>
        </View>
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{job.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="crop-landscape" size={14} color="#888" />
          <Text style={styles.metaText}>{job.acres} ac</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="barley" size={14} color="#888" />
          <Text style={styles.metaText}>{job.crop || 'Crop TBD'}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="calendar-range" size={14} color="#888" />
          <Text style={styles.metaText}>{job.startDate}{job.endDate ? ` – ${job.endDate}` : ''}</Text>
        </View>
      </View>

      {job.notes ? <Text style={styles.cardNotes} numberOfLines={2}>{job.notes}</Text> : null}

      <View style={styles.cardFooter}>
        <Text style={styles.cardLocation}>
          <MaterialCommunityIcons name="map-marker-outline" size={11} color="#aaa" />
          {' '}{[district, region].filter(Boolean).join(', ')}
        </Text>
        <View style={styles.cardRight}>
          <Text style={styles.cardPosted}>{postedLabel}</Text>
          <Text style={styles.cardCta}>View Details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function JobBoardScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { profile } = useUser();
  const { jobs } = useJobBoard();

  // Location filters — default to profile but freely adjustable
  const [filterCountry,   setFilterCountry]   = useState<'CA' | 'US'>(profile?.country ?? 'CA');
  const [filterRegion,    setFilterRegion]     = useState<string>(profile?.regionCode ?? '');
  const [filterDistricts, setFilterDistricts] = useState<string[]>(
    profile?.districtCode ? [profile.districtCode] : []
  );

  // Service filters — multi-select
  const [activeServices, setActiveServices] = useState<string[]>([]);

  const regions   = getRegionsByCountry(filterCountry);
  const districts = filterRegion ? getDistrictsByRegion(filterRegion) : [];

  const regionName = REGIONS.find(r => r.code === filterRegion)?.name;

  const handleCountryChange = (c: 'CA' | 'US') => {
    setFilterCountry(c);
    setFilterRegion('');
    setFilterDistricts([]);
  };

  const handleRegionChange = (code: string) => {
    setFilterRegion(code);
    setFilterDistricts([]);
  };

  const toggleDistrict = (code: string) => {
    setFilterDistricts(prev =>
      prev.includes(code) ? prev.filter(d => d !== code) : [...prev, code]
    );
  };

  const toggleService = (label: string) => {
    setActiveServices(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  // Apply all filters client-side
  const visibleJobs = jobs
    .filter(j => j.status === 'open')
    .filter(j => j.country === filterCountry)
    .filter(j => !filterRegion   || j.regionCode   === filterRegion)
    .filter(j => filterDistricts.length === 0 || filterDistricts.includes(j.districtCode))
    .filter(j => activeServices.length === 0 || j.services.some(s => activeServices.includes(s)))
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));

  return (
    <View style={styles.container}>
      <AppHeader />

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Custom Farming Job Board</Text>
        <Text style={styles.heroSub}>Post jobs or find operators for seeding, spraying, harvesting, and more.</Text>
      </View>

      {/* ── Location filter bar ──────────────────────────────────────────────── */}
      <View style={styles.filterWrap}>

        {/* Row 1: Country toggle + label */}
        <View style={styles.countryRow}>
          <View style={styles.countryToggle}>
            <TouchableOpacity
              style={[styles.countryBtn, filterCountry === 'CA' && styles.countryBtnActive]}
              onPress={() => handleCountryChange('CA')}
            >
              <Text style={[styles.countryBtnText, filterCountry === 'CA' && styles.countryBtnTextActive]}>CAN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.countryBtn, filterCountry === 'US' && styles.countryBtnActive]}
              onPress={() => handleCountryChange('US')}
            >
              <Text style={[styles.countryBtnText, filterCountry === 'US' && styles.countryBtnTextActive]}>USA</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.filterSectionLabel}>{filterCountry === 'CA' ? 'PROVINCE' : 'STATE'}</Text>
        </View>

        {/* Row 2: Province pills (horizontal scroll, single-select) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.regionPillsContent}
          style={styles.regionPillsRow}
        >
          <TouchableOpacity
            style={[styles.regionPill, !filterRegion && styles.regionPillActive]}
            onPress={() => handleRegionChange('')}
            activeOpacity={0.75}
          >
            <Text style={[styles.regionPillText, !filterRegion && styles.regionPillTextActive]}>All</Text>
          </TouchableOpacity>
          {regions.map(r => (
            <TouchableOpacity
              key={r.code}
              style={[styles.regionPill, filterRegion === r.code && styles.regionPillActive]}
              onPress={() => handleRegionChange(r.code)}
              activeOpacity={0.75}
            >
              <Text style={[styles.regionPillText, filterRegion === r.code && styles.regionPillTextActive]}>
                {r.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Row 3: District pills (wrapping, multi-select) */}
        {filterRegion && districts.length > 0 && (
          <View style={styles.districtSection}>
            <View style={styles.districtHeaderRow}>
              <Text style={styles.filterSectionLabel}>DISTRICT</Text>
              {filterDistricts.length > 0 && (
                <TouchableOpacity onPress={() => setFilterDistricts([])}>
                  <Text style={styles.clearDistrictsText}>Clear ({filterDistricts.length})</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.districtGrid}>
              {districts.map(d => {
                const active = filterDistricts.includes(d.code);
                return (
                  <TouchableOpacity
                    key={d.code}
                    style={[styles.districtChip, active && styles.districtChipActive]}
                    onPress={() => toggleDistrict(d.code)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.districtChipText, active && styles.districtChipTextActive]}>{d.name}</Text>
                    {active && <MaterialCommunityIcons name="check-circle" size={12} color="#2d6a2d" style={{ marginLeft: 3 }} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* ── Service filter grid ──────────────────────────────────────────────── */}
      <View style={styles.serviceSection}>
        <View style={styles.serviceSectionHeader}>
          <Text style={styles.serviceSectionTitle}>SERVICES AVAILABLE</Text>
          {activeServices.length > 0 && (
            <TouchableOpacity onPress={() => setActiveServices([])}>
              <Text style={styles.clearServicesText}>Clear ({activeServices.length})</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.serviceGrid}>
          {SERVICE_TYPES.map(svc => {
            const active = activeServices.includes(svc.label);
            return (
              <TouchableOpacity
                key={svc.label}
                style={[styles.serviceChip, active && styles.serviceChipActive]}
                onPress={() => toggleService(svc.label)}
                activeOpacity={0.75}
              >
                <Image
                  source={svc.icon}
                  style={styles.serviceChipIcon}
                  resizeMode="contain"
                />
                <Text style={[styles.serviceChipLabel, active && styles.serviceChipLabelActive]}>
                  {svc.label}
                </Text>
                {active && (
                  <MaterialCommunityIcons name="check-circle" size={13} color="#2d6a2d" style={{ marginLeft: 3 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Auth gate or job list ────────────────────────────────────────────── */}
      {!isAuthenticated ? <AuthGate /> : (
        <ScrollView contentContainerStyle={styles.content}>

          <View style={styles.toolbar}>
            <Text style={styles.resultCount}>
              {visibleJobs.length} open {visibleJobs.length === 1 ? 'job' : 'jobs'}
              {filterDistricts.length === 1
                ? ` · ${DISTRICTS.find(d => d.code === filterDistricts[0])?.name ?? filterDistricts[0]}`
                : filterDistricts.length > 1
                  ? ` · ${filterDistricts.length} districts`
                  : filterRegion ? ` · ${regionName}` : ''}
              {activeServices.length > 0 ? ` · ${activeServices.join(', ')}` : ''}
            </Text>
            <TouchableOpacity style={styles.myJobsBtn} onPress={() => router.push('/(tabs)/my-jobs' as any)}>
              <MaterialCommunityIcons name="clipboard-list" size={15} color="#2d6a2d" />
              <Text style={styles.myJobsBtnText}>My Jobs</Text>
            </TouchableOpacity>
          </View>

          {visibleJobs.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="tractor" size={48} color="#d0e8d0" />
              <Text style={styles.emptyTitle}>No matching jobs</Text>
              <Text style={styles.emptySub}>
                {activeServices.length > 0
                  ? 'No open jobs match the selected services in this area. Try deselecting a service type.'
                  : filterDistricts.length > 0
                    ? 'Try deselecting a district or clearing district filters.'
                    : 'Try selecting a different province or country.'}
              </Text>
              {activeServices.length > 0 && (
                <TouchableOpacity style={styles.clearBtn} onPress={() => setActiveServices([])}>
                  <Text style={styles.clearBtnText}>Clear Service Filters</Text>
                </TouchableOpacity>
              )}
              {filterDistricts.length > 0 && activeServices.length === 0 && (
                <TouchableOpacity style={styles.clearBtn} onPress={() => setFilterDistricts([])}>
                  <Text style={styles.clearBtnText}>Show All Districts</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            visibleJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => router.push({ pathname: '/(tabs)/job-detail', params: { jobId: job.id } } as any)}
              />
            ))
          )}

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#f4f8f4' },
  hero:                 { backgroundColor: '#6B7A2A', paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20, alignItems: 'center' },
  heroTitle:            { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 10 },
  heroSub:              { fontSize: 14, color: '#d8e4a0', textAlign: 'center', lineHeight: 22 },
  content:              { paddingBottom: 48 },

  // Auth gate
  gate:                 { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 },
  gateTitle:            { fontSize: 20, fontWeight: '700', color: '#1a3c1a', textAlign: 'center' },
  gateSub:              { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 21 },
  gateBtn:              { backgroundColor: '#2d6a2d', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48, marginTop: 8 },
  gateBtnText:          { color: '#fff', fontSize: 16, fontWeight: '700' },
  gateLink:             { color: '#2d6a2d', fontSize: 14, fontWeight: '600' },

  // Location filter bar
  filterWrap:            { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e8f0e8', paddingTop: 8, paddingBottom: 10 },
  countryRow:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 8, gap: 10 },
  filterSectionLabel:    { fontSize: 10, fontWeight: '700', color: '#aaa', letterSpacing: 0.8 },

  countryToggle:         { flexDirection: 'row', borderRadius: 8, borderWidth: 1.5, borderColor: '#d0e8d0', overflow: 'hidden' },
  countryBtn:            { paddingVertical: 7, paddingHorizontal: 12, backgroundColor: '#fff' },
  countryBtnActive:      { backgroundColor: '#2d6a2d' },
  countryBtnText:        { fontSize: 12, fontWeight: '700', color: '#2d6a2d' },
  countryBtnTextActive:  { color: '#fff' },

  regionPillsRow:        { marginBottom: 0 },
  regionPillsContent:    { paddingHorizontal: 12, gap: 6, flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  regionPill:            { paddingVertical: 6, paddingHorizontal: 13, borderRadius: 20, borderWidth: 1.5, borderColor: '#d0e8d0', backgroundColor: '#fff' },
  regionPillActive:      { backgroundColor: '#2d6a2d', borderColor: '#2d6a2d' },
  regionPillText:        { fontSize: 12, fontWeight: '600', color: '#2d6a2d' },
  regionPillTextActive:  { color: '#fff', fontWeight: '700' },

  districtSection:       { paddingHorizontal: 12, paddingTop: 8 },
  districtHeaderRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  clearDistrictsText:    { fontSize: 12, fontWeight: '700', color: '#2d6a2d' },
  districtGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  districtChip:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fafafa' },
  districtChipActive:    { backgroundColor: '#f0f8f0', borderColor: '#2d6a2d', borderWidth: 2 },
  districtChipText:      { fontSize: 11, fontWeight: '600', color: '#666' },
  districtChipTextActive:{ color: '#2d6a2d', fontWeight: '700' },

  // Service filter grid
  serviceSection:       { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e8f0e8', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10 },
  serviceSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  serviceSectionTitle:  { fontSize: 11, fontWeight: '700', color: '#aaa', letterSpacing: 0.8 },
  clearServicesText:    { fontSize: 12, fontWeight: '700', color: '#2d6a2d' },

  serviceGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  serviceChip:           { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fafafa', borderRadius: 20, borderWidth: 1.5, borderColor: '#e0e0e0', paddingVertical: 5, paddingHorizontal: 9 },
  serviceChipActive:     { backgroundColor: '#f0f8f0', borderColor: '#2d6a2d', borderWidth: 2 },
  serviceChipIcon:       { width: 20, height: 20 },
  serviceChipLabel:      { fontSize: 11, fontWeight: '700', color: '#c8931a' },
  serviceChipLabelActive:{ color: '#2d6a2d' },

  // Toolbar
  toolbar:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  resultCount:          { fontSize: 12, fontWeight: '600', color: '#888', flex: 1 },
  myJobsBtn:            { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#e8f5e8', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14 },
  myJobsBtnText:        { fontSize: 13, fontWeight: '700', color: '#2d6a2d' },

  // Empty state
  empty:                { alignItems: 'center', padding: 48, gap: 12 },
  emptyTitle:           { fontSize: 17, fontWeight: '700', color: '#1a3c1a' },
  emptySub:             { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 21 },
  clearBtn:             { backgroundColor: '#e8f5e8', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, marginTop: 4 },
  clearBtnText:         { fontSize: 13, fontWeight: '700', color: '#2d6a2d' },

  // Job cards
  card:                 { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardHeaderLeft:       { flex: 1, marginRight: 10 },
  cardServices:         { fontSize: 15, fontWeight: '800', color: '#1a3c1a', marginBottom: 2 },
  cardFarmer:           { fontSize: 13, color: '#888', fontWeight: '500' },
  cardBadge:            { backgroundColor: '#e8f5e8', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 },
  cardBadgeText:        { fontSize: 10, fontWeight: '800', color: '#2d6a2d', letterSpacing: 0.5 },

  cardMeta:             { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  metaItem:             { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:             { fontSize: 12, color: '#666' },

  cardNotes:            { fontSize: 13, color: '#777', lineHeight: 19, marginBottom: 10, fontStyle: 'italic' },
  cardFooter:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  cardLocation:         { fontSize: 12, color: '#aaa', flex: 1 },
  cardRight:            { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardPosted:           { fontSize: 12, color: '#bbb' },
  cardCta:              { fontSize: 13, fontWeight: '700', color: '#2d6a2d' },
});
