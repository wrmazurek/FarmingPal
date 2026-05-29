import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { LIVESTOCK_TYPES, getLivestockById } from '@/constants/livestock';
import { DISTRICTS, REGIONS, getDistrictsByRegion, getRegionsByCountry } from '@/constants/regions';
import type { DbLivestockSubmission } from '@/lib/supabase';
import AppHeader from '@/components/AppHeader';

type DateRange = '7D' | '30D' | '90D' | 'All';
type ViewMode  = 'list' | 'chart';

const DATE_RANGES: DateRange[] = ['7D', '30D', '90D', 'All'];
const HERO_COLOR = '#8B2E2E';

function formatTimeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function AuthGate() {
  const router = useRouter();
  return (
    <View style={styles.gateContainer}>
      <Text style={styles.gateIcon}>🐄</Text>
      <Text style={styles.gateTitle}>Sign up to search livestock prices</Text>
      <Text style={styles.gateSub}>Search by livestock type and region across North America.</Text>
      <TouchableOpacity style={styles.gateButton} onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.gateButtonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.gateLink}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Line chart (price trend) ─────────────────────────────────────────────────

const CHART_H    = 240;
const PAD_LEFT   = 56;
const PAD_RIGHT  = 16;
const PAD_TOP    = 16;
const PAD_BOTTOM = 44;

function LineChart({ results }: { results: DbLivestockSubmission[] }) {
  const [chartWidth, setChartWidth] = useState(0);
  const onLayout = useCallback((e: any) => setChartWidth(e.nativeEvent.layout.width), []);

  if (results.length === 0) {
    return <Text style={styles.empty}>No results for this selection.</Text>;
  }

  const byDate = new Map<string, number[]>();
  for (const p of results) {
    const key = p.submitted_at.slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(Number(p.price));
  }

  const dailyPoints = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, prices]) => ({
      t:        new Date(dateKey + 'T12:00:00Z').getTime(),
      avgPrice: prices.reduce((s, v) => s + v, 0) / prices.length,
      count:    prices.length,
      label:    new Date(dateKey + 'T12:00:00Z').toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    }));

  const avgPrices = dailyPoints.map(d => d.avgPrice);
  const minP      = Math.min(...avgPrices);
  const maxP      = Math.max(...avgPrices);
  const priceSpan = maxP - minP || 1;
  const times     = dailyPoints.map(d => d.t);
  const minT      = Math.min(...times);
  const maxT      = Math.max(...times);
  const timeSpan  = maxT - minT || 1;

  const plotW = Math.max(0, chartWidth - PAD_LEFT - PAD_RIGHT);
  const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;

  const toX = (t: number) =>
    PAD_LEFT + (dailyPoints.length > 1 ? (t - minT) / timeSpan * plotW : plotW / 2);
  const toY = (p: number) =>
    PAD_TOP + plotH - ((p - minP) / priceSpan * plotH);

  const points = dailyPoints.map(d => ({ x: toX(d.t), y: toY(d.avgPrice), avgPrice: d.avgPrice, label: d.label }));

  const segments = points.slice(0, -1).map((p1, i) => {
    const p2  = points[i + 1];
    const dx  = p2.x - p1.x;
    const dy  = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    return { cx: (p1.x + p2.x) / 2, cy: (p1.y + p2.y) / 2, len, ang };
  });

  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const price = minP + priceSpan * (i / 4);
    return { price, y: toY(price) };
  });

  const xStep   = Math.max(1, Math.floor(points.length / 5));
  const xLabels = points.filter((_, i) => i % xStep === 0 || i === points.length - 1);

  const currency   = results[0]?.currency ?? 'CAD';
  const totalSubs  = results.length;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 50, paddingTop: 12, paddingBottom: 24 }}>
      <View style={{ height: CHART_H }} onLayout={onLayout}>
        {chartWidth > 0 && (
          <>
            {yLabels.map((l, i) => (
              <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: l.y }}>
                <View style={styles.gridLine} />
                <Text style={styles.yLabel}>{l.price.toFixed(2)}</Text>
              </View>
            ))}
            <Text style={styles.yAxisTitle}>{currency}/cwt</Text>
            <View style={[styles.axisLine, { left: PAD_LEFT, top: PAD_TOP, bottom: PAD_BOTTOM, width: 1 }]} />
            <View style={[styles.axisLine, { left: PAD_LEFT, right: PAD_RIGHT, top: PAD_TOP + plotH, height: 1 }]} />
            {xLabels.map((p, i) => (
              <Text key={i} style={[styles.xLabel, { left: p.x - 20, top: PAD_TOP + plotH + 8 }]}>{p.label}</Text>
            ))}
            {segments.map((seg, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute', left: seg.cx - seg.len / 2, top: seg.cy - 1.5,
                  width: seg.len, height: 3, backgroundColor: HERO_COLOR,
                  transform: [{ rotate: `${seg.ang}deg` }],
                }}
              />
            ))}
            {points.map((p, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute', left: p.x - 5, top: p.y - 5,
                  width: 10, height: 10, borderRadius: 5,
                  backgroundColor: HERO_COLOR, borderWidth: 2, borderColor: '#fff',
                  elevation: 3, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 2,
                }}
              />
            ))}
          </>
        )}
      </View>
      <View style={styles.chartSummary}>
        <Text style={styles.chartSummaryText}>
          {dailyPoints.length} days · {totalSubs} submissions · Low ${minP.toFixed(2)} · High ${maxP.toFixed(2)}
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SearchLivestockScreen() {
  const { isAuthenticated } = useAuth();
  const { profile } = useUser();

  const [selectedTypeId,  setSelectedTypeId]  = useState<string | null>(null);
  const [filterCountry,   setFilterCountry]   = useState<'CA' | 'US'>(profile?.country ?? 'CA');
  const [filterRegion,    setFilterRegion]    = useState<string>(profile?.regionCode ?? '');
  const [filterDistrict,  setFilterDistrict]  = useState<string>(profile?.districtCode ?? '');
  const [regionOpen,      setRegionOpen]      = useState(false);
  const [districtOpen,    setDistrictOpen]    = useState(false);
  const [dateRange,       setDateRange]       = useState<DateRange>('All');
  const [viewMode,        setViewMode]        = useState<ViewMode>('list');
  const [results,         setResults]         = useState<DbLivestockSubmission[]>([]);
  const [fetching,        setFetching]        = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setFetching(true);

    const cutoff = (() => {
      if (dateRange === 'All') return null;
      const days = dateRange === '7D' ? 7 : dateRange === '30D' ? 30 : 90;
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    })();

    (async () => {
      let query = supabase
        .from('livestock_submissions')
        .select('*')
        .eq('country', filterCountry)
        .order('submitted_at', { ascending: false })
        .limit(500);

      if (filterRegion)   query = query.eq('region_code',   filterRegion);
      if (filterDistrict) query = query.eq('district_code', filterDistrict);
      if (selectedTypeId) query = query.eq('livestock_id',  selectedTypeId);
      if (cutoff)         query = query.gte('submitted_at', cutoff.toISOString());

      const { data, error } = await query;
      if (cancelled) return;
      setResults(!error && data ? (data as DbLivestockSubmission[]) : []);
      setFetching(false);
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, filterCountry, filterRegion, filterDistrict, selectedTypeId, dateRange]);

  if (!isAuthenticated) return (
    <View style={styles.container}>
      <AppHeader />
      <AuthGate />
    </View>
  );

  const regions      = getRegionsByCountry(filterCountry);
  const districts    = filterRegion ? getDistrictsByRegion(filterRegion) : [];
  const regionName   = REGIONS.find(r => r.code === filterRegion)?.name;
  const districtName = DISTRICTS.find(d => d.code === filterDistrict)?.name;

  const handleCountryChange = (c: 'CA' | 'US') => {
    setFilterCountry(c);
    setFilterRegion('');
    setFilterDistrict('');
    setRegionOpen(false);
    setDistrictOpen(false);
  };

  const handleRegionChange = (code: string) => {
    setFilterRegion(code);
    setFilterDistrict('');
    setRegionOpen(false);
    setDistrictOpen(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader />

      {/* Hero banner */}
      <View style={[styles.heroBanner, { backgroundColor: HERO_COLOR }]}>
        <Text style={styles.heroTitle}>Livestock Prices</Text>
        <Text style={styles.heroSub}>per cwt · Beef · Hogs · Sheep · Dairy · Poultry</Text>
      </View>

      {/* Location filter bar */}
      <View style={styles.filterBar}>
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

        <View style={styles.filterDropWrapper}>
          <TouchableOpacity
            style={[styles.filterDrop, regionOpen && styles.filterDropOpen]}
            onPress={() => { setRegionOpen(!regionOpen); setDistrictOpen(false); }}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterDropText, !filterRegion && styles.filterDropPlaceholder]} numberOfLines={1}>
              {regionName ?? (filterCountry === 'CA' ? 'Province' : 'State')}
            </Text>
            <Text style={styles.filterDropArrow}>{regionOpen ? '▲' : '▾'}</Text>
          </TouchableOpacity>
          {regionOpen && (
            <View style={styles.filterDdList}>
              <ScrollView nestedScrollEnabled style={styles.filterDdScroll}>
                <TouchableOpacity style={styles.filterDdItem} onPress={() => handleRegionChange('')}>
                  <Text style={[styles.filterDdText, !filterRegion && styles.filterDdTextActive]}>
                    All {filterCountry === 'CA' ? 'Provinces' : 'States'}
                  </Text>
                  {!filterRegion && <Text style={styles.filterDdCheck}>✓</Text>}
                </TouchableOpacity>
                {regions.map((r) => (
                  <TouchableOpacity
                    key={r.code}
                    style={[styles.filterDdItem, filterRegion === r.code && styles.filterDdItemActive]}
                    onPress={() => handleRegionChange(r.code)}
                  >
                    <Text style={[styles.filterDdText, filterRegion === r.code && styles.filterDdTextActive]}>{r.name}</Text>
                    {filterRegion === r.code && <Text style={styles.filterDdCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.filterDropWrapper}>
          <TouchableOpacity
            style={[styles.filterDrop, districtOpen && styles.filterDropOpen, !filterRegion && styles.filterDropDisabled]}
            onPress={() => { if (filterRegion) { setDistrictOpen(!districtOpen); setRegionOpen(false); } }}
            activeOpacity={filterRegion ? 0.75 : 1}
          >
            <Text style={[styles.filterDropText, !filterDistrict && styles.filterDropPlaceholder]} numberOfLines={1}>
              {districtName ?? 'District'}
            </Text>
            <Text style={styles.filterDropArrow}>{districtOpen ? '▲' : '▾'}</Text>
          </TouchableOpacity>
          {districtOpen && (
            <View style={styles.filterDdList}>
              <ScrollView nestedScrollEnabled style={styles.filterDdScroll}>
                <TouchableOpacity style={styles.filterDdItem} onPress={() => { setFilterDistrict(''); setDistrictOpen(false); }}>
                  <Text style={[styles.filterDdText, !filterDistrict && styles.filterDdTextActive]}>All Districts</Text>
                  {!filterDistrict && <Text style={styles.filterDdCheck}>✓</Text>}
                </TouchableOpacity>
                {districts.map((d) => (
                  <TouchableOpacity
                    key={d.code}
                    style={[styles.filterDdItem, filterDistrict === d.code && styles.filterDdItemActive]}
                    onPress={() => { setFilterDistrict(d.code); setDistrictOpen(false); }}
                  >
                    <Text style={[styles.filterDdText, filterDistrict === d.code && styles.filterDdTextActive]}>{d.name}</Text>
                    {filterDistrict === d.code && <Text style={styles.filterDdCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Type filter chips */}
      <View style={styles.chipBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, !selectedTypeId && styles.chipActive]}
            onPress={() => setSelectedTypeId(null)}
          >
            <Text style={[styles.chipText, !selectedTypeId && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {LIVESTOCK_TYPES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.chip, selectedTypeId === t.id && styles.chipActive]}
              onPress={() => setSelectedTypeId(t.id)}
            >
              <Text style={[styles.chipText, selectedTypeId === t.id && styles.chipTextActive]}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Date range + view toggle */}
      <View style={styles.controlBar}>
        <View style={styles.dateRangeGroup}>
          {DATE_RANGES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.dateBtn, dateRange === r && styles.dateBtnActive]}
              onPress={() => setDateRange(r)}
            >
              <Text style={[styles.dateBtnText, dateRange === r && styles.dateBtnTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.viewBtnText, viewMode === 'list' && styles.viewBtnTextActive]}>≡ List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewBtn, viewMode === 'chart' && styles.viewBtnActive]}
            onPress={() => setViewMode('chart')}
          >
            <Text style={[styles.viewBtnText, viewMode === 'chart' && styles.viewBtnTextActive]}>▦ Chart</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      {fetching ? (
        <ActivityIndicator size="large" color={HERO_COLOR} style={{ marginTop: 48 }} />
      ) : viewMode === 'chart' ? (
        <LineChart results={results} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const liveType = getLivestockById(item.livestock_id);
            const district = DISTRICTS.find((d) => d.code === item.district_code);
            return (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.typeName}>{liveType?.name ?? item.livestock_id}</Text>
                  <Text style={styles.price}>{item.currency} ${Number(item.price).toFixed(2)}/cwt</Text>
                </View>
                <Text style={styles.buyer}>{item.buyer_name}</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.district}>{district?.name ?? item.district_code}</Text>
                  <Text style={styles.time}>{formatTimeAgo(item.submitted_at)}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No results for this selection.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:              { flex: 1, backgroundColor: '#f4f8f4' },

  heroBanner:             { paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  heroTitle:              { fontSize: 20, fontWeight: '900', color: '#fff' },
  heroSub:                { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3 },

  filterBar:              { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#e8f0e8', zIndex: 10 },
  countryToggle:          { flexDirection: 'row', borderRadius: 8, borderWidth: 1.5, borderColor: '#d0e8d0', overflow: 'hidden' },
  countryBtn:             { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#fff' },
  countryBtnActive:       { backgroundColor: '#2d6a2d' },
  countryBtnText:         { fontSize: 12, fontWeight: '700', color: '#2d6a2d' },
  countryBtnTextActive:   { color: '#fff' },
  filterDropWrapper:      { flex: 1, zIndex: 20 },
  filterDrop:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1.5, borderColor: '#d0e8d0', paddingVertical: 8, paddingHorizontal: 10 },
  filterDropOpen:         { borderColor: '#2d6a2d', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  filterDropDisabled:     { opacity: 0.4 },
  filterDropText:         { fontSize: 12, fontWeight: '600', color: '#1a3c1a', flex: 1 },
  filterDropPlaceholder:  { color: '#aaa' },
  filterDropArrow:        { fontSize: 11, color: '#2d6a2d', fontWeight: '700', marginLeft: 4 },
  filterDdList:           { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1.5, borderTopWidth: 0, borderColor: '#2d6a2d', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, zIndex: 30, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  filterDdScroll:         { maxHeight: 200 },
  filterDdItem:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  filterDdItemActive:     { backgroundColor: '#f0f8f0' },
  filterDdText:           { fontSize: 13, color: '#444' },
  filterDdTextActive:     { color: '#2d6a2d', fontWeight: '700' },
  filterDdCheck:          { color: '#2d6a2d', fontWeight: '700', fontSize: 13 },

  chipBar:                { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e8f0e8', zIndex: 9 },
  chipRow:                { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  chip:                   { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1.5, borderColor: '#d0e8d0', backgroundColor: '#fff' },
  chipActive:             { backgroundColor: HERO_COLOR, borderColor: HERO_COLOR },
  chipText:               { color: HERO_COLOR, fontSize: 13, fontWeight: '600' },
  chipTextActive:         { color: '#fff' },

  controlBar:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#e8f0e8' },
  dateRangeGroup:         { flexDirection: 'row', gap: 6 },
  dateBtn:                { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5, borderColor: '#d0e8d0', backgroundColor: '#fff' },
  dateBtnActive:          { backgroundColor: '#2d6a2d', borderColor: '#2d6a2d' },
  dateBtnText:            { fontSize: 12, fontWeight: '700', color: '#2d6a2d' },
  dateBtnTextActive:      { color: '#fff' },
  viewToggle:             { flexDirection: 'row', borderRadius: 8, borderWidth: 1.5, borderColor: '#d0e8d0', overflow: 'hidden' },
  viewBtn:                { paddingVertical: 5, paddingHorizontal: 12, backgroundColor: '#fff' },
  viewBtnActive:          { backgroundColor: '#2d6a2d' },
  viewBtnText:            { fontSize: 12, fontWeight: '700', color: '#2d6a2d' },
  viewBtnTextActive:      { color: '#fff' },

  list:                   { padding: 16 },
  card:                   { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardRow:                { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  typeName:               { fontSize: 16, fontWeight: '700', color: '#1a3c1a' },
  price:                  { fontSize: 17, fontWeight: '800', color: HERO_COLOR },
  buyer:                  { fontSize: 13, color: '#555', marginBottom: 8 },
  district:               { fontSize: 12, color: '#888' },
  time:                   { fontSize: 12, color: '#aaa' },
  empty:                  { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 15 },

  gridLine:               { position: 'absolute', left: PAD_LEFT, right: PAD_RIGHT, height: 1, backgroundColor: '#e8f0e8' },
  yLabel:                 { position: 'absolute', right: '100%', top: -7, width: PAD_LEFT - 4, fontSize: 9, color: '#888', textAlign: 'right' } as any,
  yAxisTitle:             { position: 'absolute', left: 0, top: PAD_TOP + (CHART_H - PAD_TOP - PAD_BOTTOM) / 2 - 16, fontSize: 9, color: HERO_COLOR, fontWeight: '700', width: 40, textAlign: 'center' },
  axisLine:               { position: 'absolute', backgroundColor: '#ccc' } as any,
  xLabel:                 { position: 'absolute', width: 40, fontSize: 9, color: '#888', textAlign: 'center' },
  chartSummary:           { marginTop: 8, alignItems: 'center' },
  chartSummaryText:       { fontSize: 11, color: '#888' },

  gateContainer:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#f4f8f4' },
  gateIcon:               { fontSize: 48, marginBottom: 16 },
  gateTitle:              { fontSize: 20, fontWeight: '700', color: '#1a3c1a', textAlign: 'center', marginBottom: 10 },
  gateSub:                { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 32 },
  gateButton:             { backgroundColor: HERO_COLOR, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 48, marginBottom: 16 },
  gateButtonText:         { color: '#fff', fontSize: 16, fontWeight: '700' },
  gateLink:               { color: '#2d6a2d', fontSize: 14 },
});
