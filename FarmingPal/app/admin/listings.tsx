import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

type Tab = 'equipment' | 'land';
type ListingStatus = 'active' | 'sold' | 'removed';

const STATUS_COLORS: Record<ListingStatus, string> = {
  active:  '#22c55e',
  sold:    '#c8931a',
  removed: '#ef4444',
};

export default function AdminListingsScreen() {
  const router = useRouter();
  const [tab,       setTab]       = useState<Tab>('equipment');
  const [rows,      setRows]      = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async (t: Tab) => {
    setLoading(true);
    setRows([]);
    const table = t === 'equipment' ? 'equipment_listings' : 'land_listings';
    const { data } = await supabase.from(table).select('*').order('posted_at', { ascending: false }).limit(200);
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleDelete = async (id: string) => {
    const table = tab === 'equipment' ? 'equipment_listings' : 'land_listings';
    await supabase.from(table).delete().eq('id', id);
    setRows(prev => prev.filter(r => r.id !== id));
    setConfirmId(null);
  };

  const handleStatus = async (id: string, status: ListingStatus) => {
    const table = tab === 'equipment' ? 'equipment_listings' : 'land_listings';
    await supabase.from(table).update({ status }).eq('id', id);
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const fmt = (iso: string) => iso
    ? new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: '2-digit' })
    : '—';

  const formatPrice = (price: number, currency: string) =>
    `${currency} $${price?.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) ?? '—'}`;

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    if (!q) return true;
    if (tab === 'equipment') {
      return (r.category + r.make + r.model + r.year + r.district_code + r.seller_name).toLowerCase().includes(q);
    }
    return (r.land_type + r.soil_class + r.district_code + r.seller_name).toLowerCase().includes(q);
  });

  const renderRow = (r: any) => {
    const isConfirm = confirmId === r.id;
    const primary = tab === 'equipment'
      ? `${r.year ? r.year + ' ' : ''}${r.make ?? ''} ${r.model ?? ''}`.trim() || r.category
      : `${r.acres} ac — ${r.land_type}`;
    const secondary = tab === 'equipment'
      ? `${r.category}  ·  ${r.condition}  ·  ${r.district_code}`
      : `${r.soil_class ? r.soil_class + '  ·  ' : ''}${r.price_type}  ·  ${r.district_code}`;

    return (
      <View key={r.id} style={styles.card}>
        <View style={styles.cardBody}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardSeller}>{r.seller_name || '—'}</Text>
            <Text style={styles.cardPrimary}>{primary}</Text>
            <Text style={styles.cardSub}>{secondary}  ·  {fmt(r.posted_at)}</Text>
          </View>
          <View style={styles.priceCol}>
            <Text style={styles.price}>{formatPrice(r.price, r.currency)}</Text>
            {tab === 'equipment' && r.hours ? (
              <Text style={styles.unit}>{Number(r.hours).toLocaleString()}h</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.statusRow}>
          {(['active', 'sold', 'removed'] as ListingStatus[]).map(s => {
            const active = r.status === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, active && { backgroundColor: STATUS_COLORS[s] + '33', borderColor: STATUS_COLORS[s] }]}
                onPress={() => handleStatus(r.id, s)}
              >
                <Text style={[styles.statusBtnText, active && { color: STATUS_COLORS[s] }]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isConfirm ? (
          <View style={styles.confirmRow}>
            <Text style={styles.confirmText}>Delete this listing?</Text>
            <TouchableOpacity style={styles.confirmYes} onPress={() => handleDelete(r.id)}>
              <Text style={styles.confirmYesText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmNo} onPress={() => setConfirmId(null)}>
              <Text style={styles.confirmNoText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => setConfirmId(r.id)}>
            <MaterialCommunityIcons name="trash-can-outline" size={14} color="#ef4444" />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Buy / Sell Listings</Text>
        <Text style={styles.topCount}>{filtered.length}</Text>
      </View>

      <View style={styles.tabRow}>
        {(['equipment', 'land'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => { setTab(t); setSearch(''); setConfirmId(null); }}
          >
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
              {t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder={tab === 'equipment' ? 'Search make, model, category, district…' : 'Search land type, soil, district…'}
        placeholderTextColor="#475569"
      />

      <ScrollView contentContainerStyle={styles.list}>
        {loading
          ? <ActivityIndicator color="#c8931a" style={{ marginTop: 40 }} />
          : filtered.length === 0
            ? <Text style={styles.empty}>No listings found.</Text>
            : filtered.map(renderRow)
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: '#0f172a' },

  topBar:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#334155', gap: 10 },
  back:            { padding: 4 },
  topTitle:        { flex: 1, fontSize: 17, fontWeight: '800', color: '#f1f5f9' },
  topCount:        { fontSize: 13, color: '#64748b', fontWeight: '600' },

  tabRow:          { flexDirection: 'row', backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  tabBtn:          { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabBtnActive:    { borderBottomWidth: 2, borderBottomColor: '#c8931a' },
  tabBtnText:      { fontSize: 11, fontWeight: '700', color: '#475569', letterSpacing: 0.8 },
  tabBtnTextActive:{ color: '#c8931a' },

  search:          { backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155', color: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },

  list:            { padding: 12, gap: 8 },
  empty:           { color: '#475569', textAlign: 'center', marginTop: 40, fontSize: 14 },

  card:            { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155' },
  cardBody:        { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardSeller:      { fontSize: 10, fontWeight: '700', color: '#c8931a', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  cardPrimary:     { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginBottom: 3 },
  cardSub:         { fontSize: 11, color: '#64748b' },
  priceCol:        { alignItems: 'flex-end', marginLeft: 8 },
  price:           { fontSize: 15, fontWeight: '900', color: '#22c55e' },
  unit:            { fontSize: 10, color: '#64748b', marginTop: 2 },

  statusRow:       { flexDirection: 'row', gap: 6, marginBottom: 10 },
  statusBtn:       { flex: 1, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statusBtnText:   { fontSize: 11, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4 },

  deleteBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  deleteBtnText:   { fontSize: 12, color: '#ef4444', fontWeight: '600' },

  confirmRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  confirmText:     { flex: 1, fontSize: 12, color: '#94a3b8' },
  confirmYes:      { backgroundColor: '#ef4444', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  confirmYesText:  { fontSize: 12, color: '#fff', fontWeight: '700' },
  confirmNo:       { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: '#334155' },
  confirmNoText:   { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
});
