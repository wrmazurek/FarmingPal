import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export default function AdminMessagesScreen() {
  const router = useRouter();
  const [threads,    setThreads]    = useState<any[]>([]);
  const [messages,   setMessages]   = useState<Record<string, any[]>>({});
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmId,  setConfirmId]  = useState<string | null>(null);
  const [msgConfirm, setMsgConfirm] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('job_threads').select('*').order('last_message_at', { ascending: false }).limit(100)
      .then(({ data }) => { setThreads(data ?? []); setLoading(false); });
  }, []);

  const loadMessages = async (threadId: string) => {
    if (messages[threadId]) { setExpandedId(threadId); return; }
    const { data } = await supabase.from('job_messages').select('*').eq('thread_id', threadId).order('sent_at');
    setMessages(prev => ({ ...prev, [threadId]: data ?? [] }));
    setExpandedId(threadId);
  };

  const toggleThread = (threadId: string) => {
    if (expandedId === threadId) { setExpandedId(null); return; }
    loadMessages(threadId);
  };

  const handleDeleteThread = async (threadId: string) => {
    // Delete messages first, then thread
    await supabase.from('job_messages').delete().eq('thread_id', threadId);
    await supabase.from('job_threads').delete().eq('id', threadId);
    setThreads(prev => prev.filter(t => t.id !== threadId));
    setMessages(prev => { const next = { ...prev }; delete next[threadId]; return next; });
    if (expandedId === threadId) setExpandedId(null);
    setConfirmId(null);
  };

  const handleDeleteMessage = async (threadId: string, msgId: string) => {
    await supabase.from('job_messages').delete().eq('id', msgId);
    setMessages(prev => ({ ...prev, [threadId]: (prev[threadId] ?? []).filter(m => m.id !== msgId) }));
    setMsgConfirm(null);
  };

  const fmt      = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
  const fmtShort = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';

  const filtered = threads.filter(t => {
    const q = search.toLowerCase();
    return !q || (t.job_title + t.operator_name).toLowerCase().includes(q);
  });

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Messages</Text>
        <Text style={styles.topCount}>{filtered.length} threads</Text>
      </View>

      <TextInput style={styles.search} value={search} onChangeText={setSearch} placeholder="Search job title, operator…" placeholderTextColor="#475569" />

      <ScrollView contentContainerStyle={styles.list}>
        {loading
          ? <ActivityIndicator color="#c8931a" style={{ marginTop: 40 }} />
          : filtered.length === 0
            ? <Text style={styles.empty}>No message threads found.</Text>
            : filtered.map(t => {
                const isExpanded  = expandedId === t.id;
                const isConfirm   = confirmId === t.id;
                const msgs        = messages[t.id] ?? [];
                return (
                  <View key={t.id} style={styles.card}>
                    <TouchableOpacity style={styles.threadHeader} onPress={() => toggleThread(t.id)} activeOpacity={0.75}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.threadTitle}>{t.job_title || 'Job Thread'}</Text>
                        <Text style={styles.threadSub}>Operator: {t.operator_name}  ·  {fmtShort(t.last_message_at)}</Text>
                      </View>
                      <MaterialCommunityIcons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#475569"
                        style={{ marginRight: 4 }}
                      />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.messageList}>
                        {msgs.length === 0
                          ? <Text style={styles.noMessages}>No messages yet.</Text>
                          : msgs.map(m => {
                              const isMsgConfirm = msgConfirm === m.id;
                              return (
                                <View key={m.id} style={styles.msgBubble}>
                                  <View style={styles.msgMeta}>
                                    <Text style={styles.msgSender}>{m.sender_name}</Text>
                                    <Text style={styles.msgTime}>{fmt(m.sent_at)}</Text>
                                  </View>
                                  <Text style={styles.msgBody}>{m.body}</Text>
                                  {isMsgConfirm ? (
                                    <View style={styles.confirmRow}>
                                      <Text style={styles.confirmText}>Delete this message?</Text>
                                      <TouchableOpacity style={styles.confirmYes} onPress={() => handleDeleteMessage(t.id, m.id)}>
                                        <Text style={styles.confirmYesText}>Delete</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={styles.confirmNo} onPress={() => setMsgConfirm(null)}>
                                        <Text style={styles.confirmNoText}>Cancel</Text>
                                      </TouchableOpacity>
                                    </View>
                                  ) : (
                                    <TouchableOpacity style={styles.msgDeleteBtn} onPress={() => setMsgConfirm(m.id)}>
                                      <MaterialCommunityIcons name="trash-can-outline" size={12} color="#ef4444" />
                                    </TouchableOpacity>
                                  )}
                                </View>
                              );
                            })
                        }
                      </View>
                    )}

                    {isConfirm ? (
                      <View style={styles.confirmRow}>
                        <Text style={styles.confirmText}>Delete this entire thread?</Text>
                        <TouchableOpacity style={styles.confirmYes} onPress={() => handleDeleteThread(t.id)}>
                          <Text style={styles.confirmYesText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmNo} onPress={() => setConfirmId(null)}>
                          <Text style={styles.confirmNoText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => setConfirmId(t.id)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={14} color="#ef4444" />
                        <Text style={styles.deleteBtnText}>Delete Thread</Text>
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
  root:          { flex: 1, backgroundColor: '#0f172a' },
  topBar:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#334155', gap: 10 },
  back:          { padding: 4 },
  topTitle:      { flex: 1, fontSize: 17, fontWeight: '800', color: '#f1f5f9' },
  topCount:      { fontSize: 13, color: '#64748b', fontWeight: '600' },
  search:        { backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155', color: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  list:          { padding: 12, gap: 8 },
  empty:         { color: '#475569', textAlign: 'center', marginTop: 40, fontSize: 14 },

  card:          { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  threadHeader:  { flexDirection: 'row', alignItems: 'center', padding: 14 },
  threadTitle:   { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginBottom: 3 },
  threadSub:     { fontSize: 11, color: '#64748b' },

  messageList:   { borderTopWidth: 1, borderTopColor: '#334155', padding: 12, gap: 8 },
  noMessages:    { color: '#475569', fontSize: 13, fontStyle: 'italic' },
  msgBubble:     { backgroundColor: '#0f172a', borderRadius: 8, padding: 10 },
  msgMeta:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  msgSender:     { fontSize: 11, fontWeight: '700', color: '#c8931a' },
  msgTime:       { fontSize: 10, color: '#475569' },
  msgBody:       { fontSize: 13, color: '#94a3b8', lineHeight: 19, marginBottom: 6 },
  msgDeleteBtn:  { alignSelf: 'flex-end', padding: 2 },

  deleteBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, margin: 10, alignSelf: 'flex-end' },
  deleteBtnText: { fontSize: 12, color: '#ef4444', fontWeight: '600' },
  confirmRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 10 },
  confirmText:   { flex: 1, fontSize: 12, color: '#94a3b8' },
  confirmYes:    { backgroundColor: '#ef4444', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  confirmYesText:{ fontSize: 12, color: '#fff', fontWeight: '700' },
  confirmNo:     { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: '#334155' },
  confirmNoText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
});
