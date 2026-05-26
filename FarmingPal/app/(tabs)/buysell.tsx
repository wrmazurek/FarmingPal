import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { REGIONS, DISTRICTS, getRegionsByCountry, getDistrictsByRegion } from '@/constants/regions';

const EQUIPMENT_CATEGORIES = [
  'Tractor', 'Combine / Harvester', 'Header / Attachment',
  'Seeder / Air Drill', 'Sprayer', 'Tillage / Cultivator',
  'Grain Truck', 'Grain Handling', 'Hay & Forage',
  'Loader / Skid Steer', 'ATV / UTV', 'Other',
];

const LAND_TYPES = [
  'Cultivated / Cropland', 'Pasture / Grazing', 'Mixed Farm',
  'Hay / Forage Land', 'Recreational', 'Other',
];

type ListingType = 'equipment' | 'land';

interface EquipmentListing {
  id: string; seller_id: string; seller_name: string;
  category: string; year: string; make: string; model: string;
  hours: string; condition: string; price: number; currency: string;
  description: string; district_code: string; region_code: string;
  country: string; status: string; posted_at: string; photos?: string[];
}

interface LandListing {
  id: string; seller_id: string; seller_name: string;
  acres: string; land_type: string; soil_class: string;
  price: number; price_type: string; currency: string;
  description: string; district_code: string; region_code: string;
  country: string; status: string; posted_at: string; photos?: string[];
}

function timeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? '1d ago' : `${d}d ago`;
}

function formatPrice(price: number, currency: string, suffix = ''): string {
  return `${currency} $${price.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${suffix}`;
}

function conditionLabel(c: string): string {
  return c === 'excellent' ? 'Excellent' : c === 'good' ? 'Good' : c === 'fair' ? 'Fair' : 'Parts Only';
}

export default function BuySellScreen() {
  const router   = useRouter();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const { profile }         = useUser();
  const { isAuthenticated } = useAuth();

  const [tab,             setTab]             = useState<ListingType>(tabParam === 'land' ? 'land' : 'equipment');
  const [filterCountry,   setFilterCountry]   = useState<'CA' | 'US'>(profile?.country ?? 'CA');
  const [filterRegion,    setFilterRegion]     = useState<string>(profile?.regionCode ?? '');
  const [filterDistricts, setFilterDistricts] = useState<string[]>(
    profile?.districtCode ? [profile.districtCode] : []
  );
  const [regionOpen,      setRegionOpen]       = useState(false);
  const [activeEqTypes,   setActiveEqTypes]   = useState<string[]>([]);
  const [activeLandTypes, setActiveLandTypes] = useState<string[]>([]);

  const [equipment, setEquipment] = useState<EquipmentListing[]>([]);
  const [land,      setLand]      = useState<LandListing[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [expanded,  setExpanded]  = useState<string | null>(null);

  const regions    = getRegionsByCountry(filterCountry);
  const districts  = filterRegion ? getDistrictsByRegion(filterRegion) : [];
  const regionName = REGIONS.find(r => r.code === filterRegion)?.name;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setExpanded(null);

    (async () => {
      const table = tab === 'equipment' ? 'equipment_listings' : 'land_listings';
      let query = supabase
        .from(table)
        .select('*')
        .eq('country', filterCountry)
        .eq('status', 'active')
        .order('posted_at', { ascending: false })
        .limit(200);

      if (filterRegion) query = query.eq('region_code', filterRegion);

      const { data } = await query;
      if (cancelled) return;
      if (tab === 'equipment') setEquipment((data ?? []) as EquipmentListing[]);
      else                     setLand((data ?? []) as LandListing[]);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [tab, filterCountry, filterRegion]);

  const handleCountryChange = (c: 'CA' | 'US') => {
    setFilterCountry(c);
    setFilterRegion('');
    setFilterDistricts([]);
    setRegionOpen(false);
  };

  const handleRegionChange = (code: string) => {
    setFilterRegion(code);
    setFilterDistricts([]);
    setRegionOpen(false);
  };

  const toggleDistrict = (code: string) => setFilterDistricts(prev =>
    prev.includes(code) ? prev.filter(d => d !== code) : [...prev, code]
  );

  const toggleEqType   = (t: string) => setActiveEqTypes(prev =>   prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleLandType = (t: string) => setActiveLandTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  // ── Equipment card ──────────────────────────────────────────────────────────

  function EquipmentCard({ item }: { item: EquipmentListing }) {
    const open = expanded === item.id;
    const title = [item.year, item.make, item.model].filter(Boolean).join(' ') || item.category;
    const region = REGIONS.find(r => r.code === item.region_code)?.name ?? item.region_code;
    return (
      <TouchableOpacity
        style={[styles.card, open && styles.cardOpen]}
        onPress={() => setExpanded(open ? null : item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTag}><Text style={styles.cardTagText}>{item.category}</Text></View>
          <Text style={styles.cardTime}>{timeAgo(item.posted_at)}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardCondition}>{conditionLabel(item.condition)}{item.hours ? ` · ${item.hours}h` : ''}</Text>
          <Text style={styles.cardPrice}>{formatPrice(item.price, item.currency)}</Text>
        </View>
        <Text style={styles.cardLocation}>{region}{item.district_code ? ` · ${item.district_code}` : ''}</Text>
        {open && (
          <View style={styles.expanded}>
            {item.photos && item.photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoStrip}>
                {item.photos.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                ))}
              </ScrollView>
            )}
            {item.description ? <Text style={styles.expandedDesc}>{item.description}</Text> : null}
            <Text style={styles.expandedSeller}>Listed by {item.seller_name}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // ── Land card ───────────────────────────────────────────────────────────────

  function LandCard({ item }: { item: LandListing }) {
    const open = expanded === item.id;
    const region = REGIONS.find(r => r.code === item.region_code)?.name ?? item.region_code;
    const priceSuffix = item.price_type === 'per_acre' ? '/acre' : ' total';
    return (
      <TouchableOpacity
        style={[styles.card, open && styles.cardOpen]}
        onPress={() => setExpanded(open ? null : item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardTag, styles.cardTagLand]}><Text style={styles.cardTagText}>{item.land_type}</Text></View>
          <Text style={styles.cardTime}>{timeAgo(item.posted_at)}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.acres} acres</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardCondition}>{item.soil_class ? `${item.soil_class} soil` : 'Land'}</Text>
          <Text style={styles.cardPrice}>{formatPrice(item.price, item.currency, priceSuffix)}</Text>
        </View>
        <Text style={styles.cardLocation}>{region}{item.district_code ? ` · ${item.district_code}` : ''}</Text>
        {open && (
          <View style={styles.expanded}>
            {item.photos && item.photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoStrip}>
                {item.photos.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                ))}
              </ScrollView>
            )}
            {item.description ? <Text style={styles.expandedDesc}>{item.description}</Text> : null}
            <Text style={styles.expandedSeller}>Listed by {item.seller_name}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  const filteredEquipment = equipment
    .filter(e => activeEqTypes.length === 0   || activeEqTypes.includes(e.category))
    .filter(e => filterDistricts.length === 0 || filterDistricts.includes(e.district_code));
  const filteredLand = land
    .filter(l => activeLandTypes.length === 0 || activeLandTypes.includes(l.land_type))
    .filter(l => filterDistricts.length === 0 || filterDistricts.includes(l.district_code));
  const listData = tab === 'equipment' ? filteredEquipment : filteredLand;

  return (
    <View style={styles.container}>
      <AppHeader />

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Buy / Sell — Equipment &amp; Land</Text>
        <Text style={styles.heroSub}>List or find farming equipment, cropland, pasture, and mixed farm properties.</Text>
      </View>

      {/* Type toggle + filter bar */}
      <View style={styles.filterBar}>
        {/* Equipment / Land toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, tab === 'equipment' && styles.typeBtnActive]}
            onPress={() => setTab('equipment')}
          >
            <Text style={[styles.typeBtnText, tab === 'equipment' && styles.typeBtnTextActive]}>Equipment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, tab === 'land' && styles.typeBtnActive]}
            onPress={() => setTab('land')}
          >
            <Text style={[styles.typeBtnText, tab === 'land' && styles.typeBtnTextActive]}>Land</Text>
          </TouchableOpacity>
        </View>

        {/* Country toggle */}
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

        {/* Province / State dropdown */}
        <View style={styles.regionWrapper}>
          <TouchableOpacity
            style={[styles.regionDrop, regionOpen && styles.regionDropOpen]}
            onPress={() => setRegionOpen(!regionOpen)}
            activeOpacity={0.75}
          >
            <Text style={[styles.regionDropText, !filterRegion && styles.regionDropPlaceholder]} numberOfLines={1}>
              {regionName ?? (filterCountry === 'CA' ? 'All Provinces' : 'All States')}
            </Text>
            <Text style={styles.regionDropArrow}>{regionOpen ? '▲' : '▾'}</Text>
          </TouchableOpacity>
          {regionOpen && (
            <View style={styles.regionDdList}>
              <ScrollView nestedScrollEnabled style={styles.regionDdScroll}>
                <TouchableOpacity style={styles.regionDdItem} onPress={() => handleRegionChange('')}>
                  <Text style={[styles.regionDdText, !filterRegion && styles.regionDdTextActive]}>
                    All {filterCountry === 'CA' ? 'Provinces' : 'States'}
                  </Text>
                  {!filterRegion && <Text style={styles.regionDdCheck}>✓</Text>}
                </TouchableOpacity>
                {regions.map(r => (
                  <TouchableOpacity
                    key={r.code}
                    style={[styles.regionDdItem, filterRegion === r.code && styles.regionDdItemActive]}
                    onPress={() => handleRegionChange(r.code)}
                  >
                    <Text style={[styles.regionDdText, filterRegion === r.code && styles.regionDdTextActive]}>{r.name}</Text>
                    {filterRegion === r.code && <Text style={styles.regionDdCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* District filter chips */}
      {filterRegion && districts.length > 0 && (
        <View style={styles.districtSection}>
          <View style={styles.districtHeaderRow}>
            <Text style={styles.districtLabel}>DISTRICT</Text>
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

      {/* Type filter chips */}
      <View style={styles.typeFilterSection}>
        <View style={styles.typeFilterHeader}>
          <Text style={styles.typeFilterLabel}>
            {tab === 'equipment' ? 'EQUIPMENT TYPE' : 'LAND TYPE'}
          </Text>
          {(tab === 'equipment' ? activeEqTypes : activeLandTypes).length > 0 && (
            <TouchableOpacity onPress={() => tab === 'equipment' ? setActiveEqTypes([]) : setActiveLandTypes([])}>
              <Text style={styles.typeFilterClear}>
                Clear ({(tab === 'equipment' ? activeEqTypes : activeLandTypes).length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeChipRow}
        >
          {(tab === 'equipment' ? EQUIPMENT_CATEGORIES : LAND_TYPES).map(t => {
            const active = (tab === 'equipment' ? activeEqTypes : activeLandTypes).includes(t);
            return (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, active && styles.typeChipActive]}
                onPress={() => tab === 'equipment' ? toggleEqType(t) : toggleLandType(t)}
                activeOpacity={0.75}
              >
                <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{t}</Text>
                {active && <MaterialCommunityIcons name="check-circle" size={12} color="#2d6a2d" style={{ marginLeft: 3 }} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Post listing button */}
      <View style={styles.postBar}>
        <Text style={styles.postBarTitle}>
          {tab === 'equipment' ? 'Farm Equipment' : 'Farmland'} for Sale
        </Text>
        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => isAuthenticated
            ? router.push('/(tabs)/buysell-post' as any)
            : router.push('/(auth)/login' as any)
          }
        >
          <Text style={styles.postBtnText}>+ Post Listing</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <ActivityIndicator size="large" color="#2d6a2d" style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={listData as any[]}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) =>
            tab === 'equipment'
              ? <EquipmentCard item={item as EquipmentListing} />
              : <LandCard      item={item as LandListing} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>{tab === 'equipment' ? '🚜' : '🌾'}</Text>
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptySub}>Be the first to post a listing in this area.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#f4f8f4' },
  hero:                 { backgroundColor: '#c8931a', paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20, alignItems: 'center' },
  heroTitle:            { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 10 },
  heroSub:              { fontSize: 14, color: '#fde8b0', textAlign: 'center', lineHeight: 22 },

  // Filter bar
  filterBar:            { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#e8f0e8', zIndex: 10 },
  typeToggle:           { flexDirection: 'row', borderRadius: 8, borderWidth: 1.5, borderColor: '#d0e8d0', overflow: 'hidden' },
  typeBtn:              { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
  typeBtnActive:        { backgroundColor: '#2d6a2d' },
  typeBtnText:          { fontSize: 12, fontWeight: '700', color: '#2d6a2d' },
  typeBtnTextActive:    { color: '#fff' },
  countryToggle:        { flexDirection: 'row', borderRadius: 8, borderWidth: 1.5, borderColor: '#d0e8d0', overflow: 'hidden' },
  countryBtn:           { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#fff' },
  countryBtnActive:     { backgroundColor: '#2d6a2d' },
  countryBtnText:       { fontSize: 12, fontWeight: '700', color: '#2d6a2d' },
  countryBtnTextActive: { color: '#fff' },
  regionWrapper:        { flex: 1, zIndex: 20 },
  regionDrop:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1.5, borderColor: '#d0e8d0', paddingVertical: 8, paddingHorizontal: 10 },
  regionDropOpen:       { borderColor: '#2d6a2d', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  regionDropText:       { fontSize: 12, fontWeight: '600', color: '#1a3c1a', flex: 1 },
  regionDropPlaceholder:{ color: '#aaa' },
  regionDropArrow:      { fontSize: 11, color: '#2d6a2d', fontWeight: '700', marginLeft: 4 },
  regionDdList:         { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1.5, borderTopWidth: 0, borderColor: '#2d6a2d', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, zIndex: 30, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  regionDdScroll:       { maxHeight: 200 },
  regionDdItem:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  regionDdItemActive:   { backgroundColor: '#f0f8f0' },
  regionDdText:         { fontSize: 13, color: '#444' },
  regionDdTextActive:   { color: '#2d6a2d', fontWeight: '700' },
  regionDdCheck:        { color: '#2d6a2d', fontWeight: '700', fontSize: 13 },

  // District filter chips
  districtSection:       { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e8f0e8', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10 },
  districtHeaderRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  districtLabel:         { fontSize: 10, fontWeight: '700', color: '#aaa', letterSpacing: 0.8 },
  clearDistrictsText:    { fontSize: 12, fontWeight: '700', color: '#2d6a2d' },
  districtGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  districtChip:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fafafa' },
  districtChipActive:    { backgroundColor: '#f0f8f0', borderColor: '#2d6a2d', borderWidth: 2 },
  districtChipText:      { fontSize: 11, fontWeight: '600', color: '#666' },
  districtChipTextActive:{ color: '#2d6a2d', fontWeight: '700' },

  // Type filter chips
  typeFilterSection:  { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e8f0e8', paddingTop: 8, paddingBottom: 10 },
  typeFilterHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 7 },
  typeFilterLabel:    { fontSize: 10, fontWeight: '700', color: '#aaa', letterSpacing: 0.8 },
  typeFilterClear:    { fontSize: 12, fontWeight: '700', color: '#2d6a2d' },
  typeChipRow:        { paddingHorizontal: 12, gap: 6, flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  typeChip:           { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fafafa' },
  typeChipActive:     { backgroundColor: '#f0f8f0', borderColor: '#2d6a2d', borderWidth: 2 },
  typeChipText:       { fontSize: 11, fontWeight: '600', color: '#666' },
  typeChipTextActive: { color: '#2d6a2d', fontWeight: '700' },

  // Post bar
  postBar:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e8f0e8' },
  postBarTitle:         { fontSize: 15, fontWeight: '700', color: '#1a3c1a' },
  postBtn:              { backgroundColor: '#2d6a2d', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
  postBtnText:          { color: '#fff', fontSize: 13, fontWeight: '700' },

  // List
  list:                 { padding: 16 },

  // Cards
  card:                 { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardOpen:             { borderWidth: 1.5, borderColor: '#2d6a2d' },
  cardHeader:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cardTag:              { backgroundColor: '#e8f5e8', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  cardTagLand:          { backgroundColor: '#fff8e8' },
  cardTagText:          { fontSize: 11, fontWeight: '700', color: '#2d6a2d' },
  cardTitle:            { fontSize: 17, fontWeight: '800', color: '#1a3c1a', marginBottom: 6 },
  cardRow:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardCondition:        { fontSize: 13, color: '#666' },
  cardPrice:            { fontSize: 16, fontWeight: '800', color: '#2d6a2d' },
  cardLocation:         { fontSize: 12, color: '#999' },
  cardTime:             { fontSize: 11, color: '#bbb' },
  expanded:             { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e8f0e8' },
  photoStrip:           { marginBottom: 10 },
  photoThumb:           { width: 200, height: 130, borderRadius: 8, marginRight: 8 },
  expandedDesc:         { fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 10 },
  expandedSeller:       { fontSize: 12, color: '#888', fontStyle: 'italic' },

  // Empty
  emptyWrap:            { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyIcon:            { fontSize: 52, marginBottom: 16 },
  emptyTitle:           { fontSize: 18, fontWeight: '700', color: '#1a3c1a', marginBottom: 8 },
  emptySub:             { fontSize: 14, color: '#888', textAlign: 'center' },
});
