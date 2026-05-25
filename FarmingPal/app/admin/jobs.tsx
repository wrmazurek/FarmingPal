import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

type JobStatus = 'open' | 'filled' | 'closed';

const STATUS_COLORS: Record<JobStatus, string> = {
  open:   '#22c55e',
  filled: '#c8931a',
  closed: '#64748b',
};

export default function AdminJobsScreen() {
  const router = useRouter();
  const [jobs,      setJobs]      = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('job_postings').select('*').order('posted_at', { ascending: false }).limit(200)
      .then(({ data }) => { setJobs(data ?? []); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('job_postings').delete().eq('id', id);
    setJobs(prev => prev.filter(j => j.id !== id));
    setConfirmId(null);
  };

  const handleStatus = async (id: string, status: JobStatus) => {
    await supabase.from('job_postings').update({ status }).eq('id', id);
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  };

  const fmt = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    return !q || (j.farmer_name + j.services?.join(' ') + j.district_code).toLowerCase().includes(q);
  });

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Job Postings</Text>
        <Text style={styles.topCount}>{filtered.length}</Text>
      </View>

      <TextInput style={styles.search} value={search} onChangeText={setSearch} placeholder="Search farmer, service, district…" placeholderTextColor="#475569" />

      <ScrollView contentContainerStyle={styles.list}>
        {loading
          ? <ActivityIndicator color="#c8931a" style={{ marginTop: 40 }} />
          : filtered.length === 0
            ? <Text style={styles.empty}>No job postings found.</Text>
            : filtered.map(j => {
                const isConfirm = confirmId === j.id;
                return (
                  <View key={j.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardPrimary}>{j.services?.join(' · ') || '—'}</Text>
                        <Text style={styles.cardSub}>{j.farmer_name}  ·  {j.acres} ac  ·  {j.district_code}</Text>
                        <Text style={styles.cardDate}>Posted {fmt(j.posted_at)}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[j.status as JobStatus] + '33' }]}>
                        <Text style={[styles.statusText, { color: STATUS_COLORS[j.status as JobStatus] }]}>{j.status?.toUpperCase()}</Text>
                      </View>
                    </View>

                    <View style={styles.statusRow}>
                      {(['open', 'filled', 'closed'] as JobStatus[]).map(s => (
                        <TouchableOpacity
                          key={s}
                          style={[styles.statusBtn, j.status === s && { backgroundColor: STATUS_COLORS[s] + '33', borderColor: STATUS_COLORS[s] }]}
                          onPress={() => handleStatus(j.id, s)}
                        >
                          <Text style={[styles.statusBtnText, j.status === s && { color: STATUS_COLORS[s] }]}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {isConfirm ? (
                      <View style={styles.confirmRow}>
                        <Text style={styles.confirmText}>Delete this posting and all its quotes?</Text>
                        <TouchableOpacity style={styles.confirmYes} onPress={() => handleDelete(j.id)}>
                          <Text style={styles.confirmYesText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmNo} onPress={() => setConfirmId(null)}>
                          <Text style={styles.confirmNoText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => setConfirmId(j.id)}>
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
  cardHeader:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  cardPrimary:      { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginBottom: 3 },
  cardSub:          { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
  cardDate:         { fontSize: 11, color: '#475569' },
  statusBadge:      { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, alignSelf: 'flex-start' },
  statusText:       { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  statusRow:        { flexDirection: 'row', gap: 6, marginBottom: 10 },
  statusBtn:        { flex: 1, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statusBtnText:    { fontSize: 11, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },

  deleteBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  deleteBtnText:    { fontSize: 12, color: '#ef4444', fontWeight: '600' },
  confirmRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmText:      { flex: 1, fontSize: 12, color: '#94a3b8' },
  confirmYes:       { backgroundColor: '#ef4444', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  confirmYesText:   { fontSize: 12, color: '#fff', fontWeight: '700' },
  confirmNo:        { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: '#334155' },
  confirmNoText:    { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
});
