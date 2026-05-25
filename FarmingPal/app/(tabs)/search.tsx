import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { NON_WHEAT_CROPS, WHEAT_CROPS, getCropById } from '@/constants/crops';
import { DISTRICTS, REGIONS, getDistrictsByRegion, getRegionsByCountry } from '@/constants/regions';
import { PriceSubmission } from '@/types';
import AppHeader from '@/components/AppHeader';

type DateRange = '7D' | '30D' | '90D' | 'All';
type ViewMode  = 'list' | 'chart';

const DATE_RANGES: DateRange[] = ['7D', '30D', '90D', 'All'];

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

function rowToSubmission(row: Record<string, any>): PriceSubmission {
  return {
    id:           row.id,
    cropId:       row.crop_id,
    grade:        row.grade ?? undefined,
    price:        Number(row.price),
    currency:     row.currency,
    elevatorName: row.elevator_name,
    districtCode: row.district_code,
    regionCode:   row.region_code,
    country:      row.country,
    submittedAt:  row.submitted_at,
  };
}

function AuthGate() {
  const router = useRouter();
  return (
    <View style={styles.gateContainer}>
      <Text style={styles.gateIcon}>🔍</Text>
      <Text style={styles.gateTitle}>Create a free account to search prices</Text>
      <Text style={styles.gateSub}>Search by crop and region across all of North America.</Text>
      <TouchableOpacity style={styles.gateButton} onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.gateButtonText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.gateLink}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatTimeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const CHART_H    = 240;
const PAD_LEFT   = 56;
const PAD_RIGHT  = 16;
const PAD_TOP    = 16;
const PAD_BOTTOM = 44;

function LineChart({ results }: { results: PriceSubmission[] }) {
  const [chartWidth, setChartWidth] = useState(0);
  const onLayout = useCallback((e: any) => setChartWidth(e.nativeEvent.layout.width), []);

  if (results.length === 0) {
    return <Text style={styles.empty}>No results for this location and crop.</Text>;
  }

  // Group by calendar date and average prices
  const byDate = new Map<string, number[]>();
  for (const p of results) {
    const dateKey = p.submittedAt.slice(0, 10); // 'YYYY-MM-DD'
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey)!.push(p.price);
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

  const times    = dailyPoints.map(d => d.t);
  const minT     = Math.min(...times);
  const maxT     = Math.max(...times);
  const timeSpan = maxT - minT || 1;

  const plotW = Math.max(0, chartWidth - PAD_LEFT - PAD_RIGHT);
  const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;

  const toX = (t: number) =>
    PAD_LEFT + (dailyPoints.length > 1 ? (t - minT) / timeSpan * plotW : plotW / 2);
  const toY = (p: number) =>
    PAD_TOP + plotH - ((p - minP) / priceSpan * plotH);

  const points = dailyPoints.map(d => ({
    x:        toX(d.t),
    y:        toY(d.avgPrice),
    avgPrice: d.avgPrice,
    count:    d.count,
    label:    d.label,
  }));

  // Always draw a connected line since points are already averaged per day
  const segments = points.slice(0, -1).map((p1, i) => {
    const p2  = points[i + 1];
    const dx  = p2.x - p1.x;
    const dy  = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    return { cx: (p1.x + p2.x) / 2, cy: (p1.y + p2.y) / 2, len, ang };
  });

  // Y-axis: 5 evenly spaced labels
  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const price = minP + priceSpan * (i / 4);
    return { price, y: toY(price) };
  });

  // X-axis: up to 5 evenly spaced labels
  const xStep   = Math.max(1, Math.floor(points.length / 5));
  const xLabels = points.filter((_, i) => i % xStep === 0 || i === points.length - 1);

  const multiCurrency = new Set(results.map(r => r.currency)).size > 1;
  const currency      = results[0]?.currency ?? 'CAD';
  const totalSubs     = results.length;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 50, paddingTop: 12, paddingBottom: 24 }}>
      {multiCurrency && (
        <Text style={styles.chartNote}>Multiple currencies — filter by country for an accurate comparison</Text>
      )}

      <View style={{ height: CHART_H }} onLayout={onLayout}>
        {chartWidth > 0 && (
          <>
            {/* Y-axis grid + labels */}
            {yLabels.map((l, i) => (
              <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: l.y }}>
                <View style={styles.gridLine} />
                <Text style={styles.yLabel}>{l.price.toFixed(2)}</Text>
              </View>
            ))}

            {/* Y-axis title */}
            <Text style={styles.yAxisTitle}>{multiCurrency ? '$/bu' : `${currency}/bu`}</Text>

            {/* Axes */}
            <View style={[styles.axisLine, { left: PAD_LEFT, top: PAD_TOP, bottom: PAD_BOTTOM, width: 1 }]} />
            <View style={[styles.axisLine, { left: PAD_LEFT, right: PAD_RIGHT, top: PAD_TOP + plotH, height: 1 }]} />

            {/* X-axis labels */}
            {xLabels.map((p, i) => (
              <Text key={i} style={[styles.xLabel, { left: p.x - 20, top: PAD_TOP + plotH + 8 }]}>
                {p.label}
              </Text>
            ))}

            {/* Line segments */}
            {segments.map((seg, i) => (
              <View
                key={i}
                style={{
                  position:        'absolute',
                  left:            seg.cx - seg.len / 2,
                  top:             seg.cy - 1.5,
                  width:           seg.len,
                  height:          3,
                  backgroundColor: '#2d6a2d',
                  transform:       [{ rotate: `${seg.ang}deg` }],
                }}
              />
            ))}

            {/* Daily average dots */}
            {points.map((p, i) => (
              <View
                key={i}
                style={{
                  position:        'absolute',
                  left:            p.x - 5,
                  top:             p.y - 5,
                  width:           10,
                  height:          10,
                  borderRadius:    5,
                  backgroundColor: '#2d6a2d',
                  borderWidth:     2,
                  borderColor:     '#fff',
                  elevation:       3,
                  shadowColor:     '#000',
                  shadowOpacity:   0.15,
                  shadowRadius:    2,
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

export default function SearchScreen() {
  const { isAuthenticated } = useAuth();
  const { profile } = useUser();

  const [selectedCropId,  setSelectedCropId]  = useState<string | null>(null);
  const [wheatOpen,       setWheatOpen]        = useState(false);

  const [filterCountry,   setFilterCountry]    = useState<'CA' | 'US'>(profile?.country ?? 'CA');
  const [filterRegion,    setFilterRegion]     = useState<string>(profile?.regionCode ?? '');
  const [filterDistrict,  setFilterDistrict]   = useState<string>(profile?.districtCode ?? '');
  const [regionOpen,      setRegionOpen]       = useState(false);
  const [districtOpen,    setDistrictOpen]     = useState(false);

  const [filterGrade,     setFilterGrade]      = useState<string>('');
  const [gradeOpen,       setGradeOpen]        = useState(false);

  const [dateRange,       setDateRange]        = useState<DateRange>('All');
  const [viewMode,        setViewMode]         = useState<ViewMode>('list');

  const [results,  setResults]  = useState<PriceSubmission[]>([]);
  const [fetching, setFetching] = useState(false);

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
        .from('price_submissions')
        .select('*')
        .eq('country', filterCountry)
        .order('submitted_at', { ascending: false })
        .limit(500);

      if (filterRegion)   query = query.eq('region_code',   filterRegion);
      if (filterDistrict) query = query.eq('district_code', filterDistrict);
      if (selectedCropId) query = query.eq('crop_id',       selectedCropId);
      if (filterGrade)    query = query.eq('grade',         filterGrade);
      if (cutoff)         query = query.gte('submitted_at', cutoff.toISOString());

      const { data, error } = await query;
      if (cancelled) return;
      setResults(!error && data ? data.map(rowToSubmission) : []);
      setFetching(false);
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, filterCountry, filterRegion, filterDistrict, selectedCropId, filterGrade, dateRange]);

  if (!isAuthenticated) return (
    <View style={styles.container}>
      <AppHeader />
      <AuthGate />
    </View>
  );

  const regions   = getRegionsByCountry(filterCountry);
  const districts = filterRegion ? getDistrictsByRegion(filterRegion) : [];

  const regionName   = REGIONS.find(r => r.code === filterRegion)?.name;
  const districtName = DISTRICTS.find(d => d.code === filterDistrict)?.name;
  const isWheatSelected = selectedCropId?.startsWith('wheat-') ?? false;

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

  const selectCrop = (id: string | null) => {
    setSelectedCropId(id);
    setWheatOpen(false);
    setGradeOpen(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader />

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

      {/* Crop filter row */}
      <View style={styles.cropBar}>
        <View style={styles.chipRow}>
          {NON_WHEAT_CROPS.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={[styles.chip, selectedCropId === crop.id && styles.chipActive]}
              onPress={() => selectCrop(crop.id)}
            >
              <Text style={[styles.chipText, selectedCropId === crop.id && styles.chipTextActive]}>{crop.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.chip, (isWheatSelected || wheatOpen) && styles.chipActive]}
            onPress={() => setWheatOpen(!wheatOpen)}
          >
            <Text style={[styles.chipText, (isWheatSelected || wheatOpen) && styles.chipTextActive]}>
              Wheat {wheatOpen ? '▲' : '▾'}
            </Text>
          </TouchableOpacity>
        </View>
        {wheatOpen && (
          <View style={styles.wheatRow}>
            {WHEAT_CROPS.map((crop) => (
              <TouchableOpacity
                key={crop.id}
                style={[styles.wheatChip, selectedCropId === crop.id && styles.wheatChipActive]}
                onPress={() => selectCrop(crop.id)}
              >
                <Text style={[styles.wheatChipText, selectedCropId === crop.id && styles.wheatChipTextActive]}>
                  {crop.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Grade filter dropdown */}
        <View style={styles.gradeDropWrapper}>
          <TouchableOpacity
            style={[styles.gradeDrop, gradeOpen && styles.gradeDropOpen]}
            onPress={() => setGradeOpen(!gradeOpen)}
            activeOpacity={0.75}
          >
            <Text style={[styles.gradeDropText, !filterGrade && styles.gradeDropPlaceholder]} numberOfLines={1}>
              {filterGrade || 'All Grades'}
            </Text>
            <Text style={styles.gradeDropArrow}>{gradeOpen ? '▲' : '▾'}</Text>
          </TouchableOpacity>
          {gradeOpen && (
            <View style={styles.gradeDdList}>
              <ScrollView nestedScrollEnabled style={styles.gradeDdScroll}>
                <TouchableOpacity
                  style={styles.gradeDdItem}
                  onPress={() => { setFilterGrade(''); setGradeOpen(false); }}
                >
                  <Text style={[styles.gradeDdText, !filterGrade && styles.gradeDdTextActive]}>All Grades</Text>
                  {!filterGrade && <Text style={styles.gradeDdCheck}>✓</Text>}
                </TouchableOpacity>
                {GRADES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.gradeDdItem, filterGrade === g && styles.gradeDdItemActive]}
                    onPress={() => { setFilterGrade(g); setGradeOpen(false); }}
                  >
                    <Text style={[styles.gradeDdText, filterGrade === g && styles.gradeDdTextActive]}>{g}</Text>
                    {filterGrade === g && <Text style={styles.gradeDdCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Date range + view toggle bar */}
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
        <ActivityIndicator size="large" color="#2d6a2d" style={{ marginTop: 48 }} />
      ) : viewMode === 'chart' ? (
        <LineChart results={results} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }: { item: PriceSubmission }) => {
            const crop     = getCropById(item.cropId);
            const district = DISTRICTS.find((d) => d.code === item.districtCode);
            return (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.cropName}>{crop?.name}</Text>
                  <Text style={styles.price}>{item.currency} ${item.price.toFixed(2)}/{crop?.unit}</Text>
                </View>
                <Text style={styles.elevator}>{item.elevatorName}</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.district}>{district?.name ?? item.districtCode}</Text>
                  <Text style={styles.time}>{formatTimeAgo(item.submittedAt)}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No results for this location and crop.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:              { flex: 1, backgroundColor: '#f4f8f4' },

  // Location filter bar
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

  // Crop filter row
  cropBar:                { backgroundColor: '#fff', paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e8f0e8', zIndex: 9 },
  chipRow:                { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 10, paddingBottom: 2 },
  chip:                   { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1.5, borderColor: '#d0e8d0', backgroundColor: '#fff' },
  chipActive:             { backgroundColor: '#2d6a2d', borderColor: '#2d6a2d' },
  chipText:               { color: '#2d6a2d', fontSize: 13, fontWeight: '600' },
  chipTextActive:         { color: '#fff' },
  wheatRow:               { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 6, paddingBottom: 2 },
  wheatChip:              { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1.5, borderColor: '#b8dbb8', backgroundColor: '#fff' },
  wheatChipActive:        { backgroundColor: '#2d6a2d', borderColor: '#2d6a2d' },
  wheatChipText:          { color: '#2d6a2d', fontSize: 13, fontWeight: '600' },
  wheatChipTextActive:    { color: '#fff' },

  // Grade filter dropdown
  gradeDropWrapper:       { marginTop: 8, marginBottom: 2, zIndex: 20 },
  gradeDrop:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fdf9', borderRadius: 8, borderWidth: 1.5, borderColor: '#d0e8d0', paddingVertical: 7, paddingHorizontal: 12 },
  gradeDropOpen:          { borderColor: '#2d6a2d', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  gradeDropText:          { fontSize: 13, fontWeight: '600', color: '#1a3c1a', flex: 1 },
  gradeDropPlaceholder:   { color: '#aaa' },
  gradeDropArrow:         { fontSize: 11, color: '#2d6a2d', fontWeight: '700', marginLeft: 4 },
  gradeDdList:            { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1.5, borderTopWidth: 0, borderColor: '#2d6a2d', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, zIndex: 30, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 } as any,
  gradeDdScroll:          { maxHeight: 200 },
  gradeDdItem:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  gradeDdItemActive:      { backgroundColor: '#f0f8f0' },
  gradeDdText:            { fontSize: 13, color: '#444' },
  gradeDdTextActive:      { color: '#2d6a2d', fontWeight: '700' },
  gradeDdCheck:           { color: '#2d6a2d', fontWeight: '700', fontSize: 13 },

  // Date range + view toggle bar
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

  // List results
  list:                   { padding: 16 },
  card:                   { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardRow:                { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cropName:               { fontSize: 16, fontWeight: '700', color: '#1a3c1a' },
  price:                  { fontSize: 17, fontWeight: '800', color: '#2d6a2d' },
  elevator:               { fontSize: 13, color: '#555', marginBottom: 8 },
  district:               { fontSize: 12, color: '#888' },
  time:                   { fontSize: 12, color: '#aaa' },
  empty:                  { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 15 },

  // Chart
  chartNote:              { fontSize: 11, color: '#aaa', marginBottom: 12, textAlign: 'center', fontStyle: 'italic' },
  gridLine:               { position: 'absolute', left: PAD_LEFT, right: PAD_RIGHT, height: 1, backgroundColor: '#e8f0e8' },
  yLabel:                 { position: 'absolute', right: '100%', top: -7, width: PAD_LEFT - 4, fontSize: 9, color: '#888', textAlign: 'right' } as any,
  yAxisTitle:             { position: 'absolute', left: 0, top: PAD_TOP + (CHART_H - PAD_TOP - PAD_BOTTOM) / 2 - 16, fontSize: 9, color: '#2d6a2d', fontWeight: '700', width: 40, textAlign: 'center' },
  axisLine:               { position: 'absolute', backgroundColor: '#ccc' } as any,
  xLabel:                 { position: 'absolute', width: 40, fontSize: 9, color: '#888', textAlign: 'center' },
  chartSummary:           { marginTop: 8, alignItems: 'center' },
  chartSummaryText:       { fontSize: 11, color: '#888' },

  // Auth gate
  gateContainer:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#f4f8f4' },
  gateIcon:               { fontSize: 48, marginBottom: 16 },
  gateTitle:              { fontSize: 20, fontWeight: '700', color: '#1a3c1a', textAlign: 'center', marginBottom: 10 },
  gateSub:                { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 32 },
  gateButton:             { backgroundColor: '#2d6a2d', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 48, marginBottom: 16 },
  gateButtonText:         { color: '#fff', fontSize: 16, fontWeight: '700' },
  gateLink:               { color: '#2d6a2d', fontSize: 14 },
});
