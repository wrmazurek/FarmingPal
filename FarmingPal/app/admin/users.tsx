import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users,     setUsers]     = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(500)
      .then(({ data }) => { setUsers(data ?? []); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('profiles').delete().eq('id', id);
    setUsers(prev => prev.filter(u => u.id !== id));
    setConfirmId(null);
  };

  const fmt = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || (u.email + u.contact_name + u.farm_name + u.region_code).toLowerCase().includes(q);
  });

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Users</Text>
        <Text style={styles.topCount}>{filtered.length}</Text>
      </View>

      <TextInput style={styles.search} value={search} onChangeText={setSearch} placeholder="Search email, name, farm, region…" placeholderTextColor="#475569" />

      <ScrollView contentContainerStyle={styles.list}>
        {loading
          ? <ActivityIndicator color="#c8931a" style={{ marginTop: 40 }} />
          : filtered.length === 0
            ? <Text style={styles.empty}>No users found.</Text>
            : filtered.map(u => {
                const isConfirm = confirmId === u.id;
                return (
                  <View key={u.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{(u.contact_name || u.email || '?')[0].toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardPrimary}>{u.contact_name || u.email}</Text>
                        <Text style={styles.cardSub}>{u.email}</Text>
                      </View>
                      <View style={styles.countryBadge}>
                        <Text style={styles.countryText}>{u.country === 'US' ? '🇺🇸' : '🇨🇦'}</Text>
                      </View>
                    </View>
                    <View style={styles.metaRow}>
                      <MetaChip label="Farm" value={u.farm_name || '—'} />
                      <MetaChip label="Region" value={u.region_code || '—'} />
                      <MetaChip label="Acres" value={u.acres || '—'} />
                      <MetaChip label="Joined" value={fmt(u.created_at)} />
                    </View>
                    {isConfirm ? (
                      <View style={styles.confirmRow}>
                        <Text style={styles.confirmText}>Delete this user's profile?</Text>
                        <TouchableOpacity style={styles.confirmYes} onPress={() => handleDelete(u.id)}>
                          <Text style={styles.confirmYesText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmNo} onPress={() => setConfirmId(null)}>
                          <Text style={styles.confirmNoText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => setConfirmId(u.id)}>
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

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={metaStyles.wrap}>
      <Text style={metaStyles.label}>{label}</Text>
      <Text style={metaStyles.value}>{value}</Text>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  wrap:  { backgroundColor: '#0f172a', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  label: { fontSize: 9, color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
});

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
  cardHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  avatar:         { width: 38, height: 38, borderRadius: 19, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
  avatarText:     { fontSize: 16, fontWeight: '800', color: '#c8931a' },
  cardPrimary:    { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginBottom: 2 },
  cardSub:        { fontSize: 11, color: '#64748b' },
  countryBadge:   { padding: 4 },
  countryText:    { fontSize: 20 },
  metaRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },

  deleteBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  deleteBtnText:  { fontSize: 12, color: '#ef4444', fontWeight: '600' },
  confirmRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  confirmText:    { flex: 1, fontSize: 12, color: '#94a3b8' },
  confirmYes:     { backgroundColor: '#ef4444', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  confirmYesText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  confirmNo:      { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: '#334155' },
  confirmNoText:  { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
});
