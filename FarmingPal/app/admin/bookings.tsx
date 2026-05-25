import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export default function AdminBookingsScreen() {
  const router = useRouter();
  const [bookings,  setBookings]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('service_bookings').select('*').order('submitted_at', { ascending: false }).limit(200)
      .then(({ data }) => { setBookings(data ?? []); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('service_bookings').delete().eq('id', id);
    setBookings(prev => prev.filter(b => b.id !== id));
    setConfirmId(null);
  };

  const fmt = (iso: string) => iso
    ? new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: '2-digit' })
    : '—';

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    return !q || (b.user_id + (b.services ?? []).join(' ') + b.crop + b.terrain).toLowerCase().includes(q);
  });

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Service Bookings</Text>
        <Text style={styles.topCount}>{filtered.length}</Text>
      </View>

      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search services, crop, terrain…"
        placeholderTextColor="#475569"
      />

      <ScrollView contentContainerStyle={styles.list}>
        {loading
          ? <ActivityIndicator color="#c8931a" style={{ marginTop: 40 }} />
          : filtered.length === 0
            ? <Text style={styles.empty}>No service bookings found.</Text>
            : filtered.map(b => {
                const isConfirm = confirmId === b.id;
                const services  = Array.isArray(b.services) ? b.services.join(', ') : b.services ?? '—';
                return (
                  <View key={b.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardPrimary}>{services}</Text>
                        <Text style={styles.cardSub}>{b.acres ? b.acres + ' ac' : '—'}  ·  {b.crop || 'No crop'}  ·  {b.terrain || '—'}</Text>
                        <Text style={styles.cardDate}>Submitted {fmt(b.submitted_at)}</Text>
                      </View>
                      <View style={styles.badge}>
                        <MaterialCommunityIcons name="calendar-clock" size={18} color="#c8931a" />
                      </View>
                    </View>

                    <View style={styles.metaRow}>
                      {b.start_date ? (
                        <View style={styles.metaChip}>
                          <Text style={styles.metaLabel}>Start</Text>
                          <Text style={styles.metaValue}>{b.start_date}</Text>
                        </View>
                      ) : null}
                      {b.end_date ? (
                        <View style={styles.metaChip}>
                          <Text style={styles.metaLabel}>End</Text>
                          <Text style={styles.metaValue}>{b.end_date}</Text>
                        </View>
                      ) : null}
                    </View>

                    {b.notes ? (
                      <Text style={styles.notes} numberOfLines={2}>{b.notes}</Text>
                    ) : null}

                    {isConfirm ? (
                      <View style={styles.confirmRow}>
                        <Text style={styles.confirmText}>Delete this booking?</Text>
                        <TouchableOpacity style={styles.confirmYes} onPress={() => handleDelete(b.id)}>
                          <Text style={styles.confirmYesText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmNo} onPress={() => setConfirmId(null)}>
                          <Text style={styles.confirmNoText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => setConfirmId(b.id)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={14} color="#ef4444" />
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#0f172a' },
  topBar:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#334155', gap: 10 },
  back:           { padding: 4 },
  topTitle:       { flex: 1, fontSize: 17, fontWeight: '800', color: '#f1f5f9' },
  topCount:       { fontSize: 13, color: '#64748b', fontWeight: '600' },
  search:         { backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155', color: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  list:           { padding: 12, gap: 8 },
  empty:          { color: '#475569', textAlign: 'center', marginTop: 40, fontSize: 14 },

  card:           { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155' },
  cardHeader:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardPrimary:    { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginBottom: 3 },
  cardSub:        { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
  cardDate:       { fontSize: 11, color: '#475569' },
  badge:          { width: 38, height: 38, borderRadius: 10, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },

  metaRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  metaChip:       { backgroundColor: '#0f172a', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  metaLabel:      { fontSize: 9, color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue:      { fontSize: 12, color: '#94a3b8', fontWeight: '600' },

  notes:          { fontSize: 12, color: '#64748b', fontStyle: 'italic', marginBottom: 10 },

  deleteBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  deleteBtnText:  { fontSize: 12, color: '#ef4444', fontWeight: '600' },
  confirmRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  confirmText:    { flex: 1, fontSize: 12, color: '#94a3b8' },
  confirmYes:     { backgroundColor: '#ef4444', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  confirmYesText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  confirmNo:      { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: '#334155' },
  confirmNoText:  { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
});
