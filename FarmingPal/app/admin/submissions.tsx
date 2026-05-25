import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

type Tab = 'crop' | 'fuel' | 'fert' | 'chem';

export default function AdminSubmissionsScreen() {
  const router = useRouter();
  const [tab,        setTab]        = useState<Tab>('crop');
  const [rows,       setRows]       = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [confirmId,  setConfirmId]  = useState<string | null>(null);

  const load = async (t: Tab) => {
    setLoading(true);
    setRows([]);
    const table = t === 'crop' ? 'price_submissions'
                : t === 'fuel' ? 'fuel_submissions'
                : t === 'fert' ? 'fertilizer_submissions'
                :                'chemical_submissions';
    const { data } = await supabase.from(table).select('*').order('submitted_at', { ascending: false }).limit(200);
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleDelete = async (id: string) => {
    const table = tab === 'crop' ? 'price_submissions'
                : tab === 'fuel' ? 'fuel_submissions'
                : tab === 'fert' ? 'fertilizer_submissions'
                :                  'chemical_submissions';
    await supabase.from(table).delete().eq('id', id);
    setRows(prev => prev.filter(r => r.id !== id));
    setConfirmId(null);
  };

  const fmt = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    if (!q) return true;
    if (tab === 'crop') return (r.crop_id + r.elevator_name + r.district_code).toLowerCase().includes(q);
    if (tab === 'fuel') return (r.fuel_type_id + r.supplier_name + r.district_code).toLowerCase().includes(q);
    if (tab === 'fert') return (r.fert_type_id + r.supplier_name + r.district_code).toLowerCase().includes(q);
    return (r.category_id + r.product_name + r.supplier_name).toLowerCase().includes(q);
  });

  const renderRow = (r: any) => {
    const isConfirm = confirmId === r.id;
    const primary = tab === 'crop'  ? `${r.crop_id}  ·  ${r.elevator_name}`
                  : tab === 'fuel'  ? `${r.fuel_type_id}  ·  ${r.supplier_name}`
                  : tab === 'fert'  ? `${r.fert_type_id}  ·  ${r.supplier_name}`
                  :                   `${r.category_id}  ·  ${r.product_name}`;
    const secondary = tab === 'chem'
      ? `${r.formulation}  ·  ${r.supplier_name}  ·  ${r.district_code}`
      : r.district_code;

    return (
      <View key={r.id} style={styles.card}>
        <View style={styles.cardBody}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardPrimary}>{primary}</Text>
            <Text style={styles.cardSub}>{secondary}  ·  {fmt(r.submitted_at)}</Text>
          </View>
          <View style={styles.priceCol}>
            <Text style={styles.price}>{r.currency} {parseFloat(r.price).toFixed(2)}</Text>
            <Text style={styles.unit}>/{r.unit ?? 'bu'}</Text>
          </View>
        </View>
        {isConfirm ? (
          <View style={styles.confirmRow}>
            <Text style={styles.confirmText}>Delete this submission?</Text>
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
        <Text style={styles.topTitle}>Price Reports</Text>
        <Text style={styles.topCount}>{filtered.length}</Text>
      </View>

      <View style={styles.tabRow}>
        {(['crop', 'fuel', 'fert', 'chem'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => { setTab(t); setSearch(''); setConfirmId(null); }}>
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search…"
        placeholderTextColor="#475569"
      />

      <ScrollView contentContainerStyle={styles.list}>
        {loading
          ? <ActivityIndicator color="#c8931a" style={{ marginTop: 40 }} />
          : filtered.length === 0
            ? <Text style={styles.empty}>No submissions found.</Text>
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
  cardPrimary:     { fontSize: 13, fontWeight: '700', color: '#f1f5f9', marginBottom: 3 },
  cardSub:         { fontSize: 11, color: '#64748b' },
  priceCol:        { alignItems: 'flex-end', marginLeft: 8 },
  price:           { fontSize: 15, fontWeight: '900', color: '#22c55e' },
  unit:            { fontSize: 10, color: '#64748b' },

  deleteBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  deleteBtnText:   { fontSize: 12, color: '#ef4444', fontWeight: '600' },

  confirmRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  confirmText:     { flex: 1, fontSize: 12, color: '#94a3b8' },
  confirmYes:      { backgroundColor: '#ef4444', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  confirmYesText:  { fontSize: 12, color: '#fff', fontWeight: '700' },
  confirmNo:       { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: '#334155' },
  confirmNoText:   { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
});
