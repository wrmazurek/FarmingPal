import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

type QuoteStatus = 'pending' | 'accepted' | 'declined';

const STATUS_COLORS: Record<QuoteStatus, string> = {
  pending:  '#f59e0b',
  accepted: '#22c55e',
  declined: '#ef4444',
};

export default function AdminQuotesScreen() {
  const router = useRouter();
  const [quotes,    setQuotes]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('job_quotes').select('*').order('submitted_at', { ascending: false }).limit(200)
      .then(({ data }) => { setQuotes(data ?? []); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('job_quotes').delete().eq('id', id);
    setQuotes(prev => prev.filter(q => q.id !== id));
    setConfirmId(null);
  };

  const handleStatus = async (id: string, status: QuoteStatus) => {
    await supabase.from('job_quotes').update({ status }).eq('id', id);
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  const fmt = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';

  const filtered = quotes.filter(q => {
    const s = search.toLowerCase();
    return !s || (q.operator_name + q.business_name + q.rate_per_acre + q.job_id).toLowerCase().includes(s);
  });

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Quotes</Text>
        <Text style={styles.topCount}>{filtered.length}</Text>
      </View>

      <TextInput style={styles.search} value={search} onChangeText={setSearch} placeholder="Search operator, business…" placeholderTextColor="#475569" />

      <ScrollView contentContainerStyle={styles.list}>
        {loading
          ? <ActivityIndicator color="#c8931a" style={{ marginTop: 40 }} />
          : filtered.length === 0
            ? <Text style={styles.empty}>No quotes found.</Text>
            : filtered.map(q => {
                const isConfirm = confirmId === q.id;
                const statusColor = STATUS_COLORS[q.status as QuoteStatus] ?? '#64748b';
                return (
                  <View key={q.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardPrimary}>{q.operator_name}</Text>
                        <Text style={styles.cardSub}>{q.business_name || '—'}  ·  Rate: {q.rate_per_acre || '—'}/ac</Text>
                        <Text style={styles.cardDate}>Submitted {fmt(q.submitted_at)}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + '33' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{q.status?.toUpperCase()}</Text>
                      </View>
                    </View>

                    {q.message ? (
                      <Text style={styles.message} numberOfLines={2}>{q.message}</Text>
                    ) : null}

                    <View style={styles.statusRow}>
                      {(['pending', 'accepted', 'declined'] as QuoteStatus[]).map(s => (
                        <TouchableOpacity
                          key={s}
                          style={[styles.statusBtn, q.status === s && { backgroundColor: STATUS_COLORS[s] + '33', borderColor: STATUS_COLORS[s] }]}
                          onPress={() => handleStatus(q.id, s)}
                        >
                          <Text style={[styles.statusBtnText, q.status === s && { color: STATUS_COLORS[s] }]}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {isConfirm ? (
                      <View style={styles.confirmRow}>
                        <Text style={styles.confirmText}>Delete this quote?</Text>
                        <TouchableOpacity style={styles.confirmYes} onPress={() => handleDelete(q.id)}>
                          <Text style={styles.confirmYesText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmNo} onPress={() => setConfirmId(null)}>
                          <Text style={styles.confirmNoText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => setConfirmId(q.id)}>
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
  root:             { flex: 1, backgroundColor: '#0f172a' },
  topBar:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#334155', gap: 10 },
  back:             { padding: 4 },
  topTitle:         { flex: 1, fontSize: 17, fontWeight: '800', color: '#f1f5f9' },
  topCount:         { fontSize: 13, color: '#64748b', fontWeight: '600' },
  search:           { backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155', color: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  list:             { padding: 12, gap: 8 },
  empty:            { color: '#475569', textAlign: 'center', marginTop: 40, fontSize: 14 },

  card:             { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155' },
  cardHeader:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardPrimary:      { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginBottom: 3 },
  cardSub:          { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
  cardDate:         { fontSize: 11, color: '#475569' },
  statusBadge:      { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, alignSelf: 'flex-start' },
  statusText:       { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  message:          { fontSize: 12, color: '#64748b', fontStyle: 'italic', marginBottom: 10, paddingHorizontal: 4 },

  statusRow:        { flexDirection: 'row', gap: 6, marginBottom: 10 },
  statusBtn:        { flex: 1, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statusBtnText:    { fontSize: 11, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4 },

  deleteBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  deleteBtnText:    { fontSize: 12, color: '#ef4444', fontWeight: '600' },
  confirmRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmText:      { flex: 1, fontSize: 12, color: '#94a3b8' },
  confirmYes:       { backgroundColor: '#ef4444', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  confirmYesText:   { fontSize: 12, color: '#fff', fontWeight: '700' },
  confirmNo:        { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: '#334155' },
  confirmNoText:    { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
});
