import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { useUser } from '@/context/UserContext';
import { useJobBoard } from '@/context/JobBoardContext';

export default function JobThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const router = useRouter();
  const { profile } = useUser();
  const { threads, sendMessage, markThreadRead, jobs } = useJobBoard();

  const [body, setBody] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const thread = threads.find(t => t.id === threadId);
  const job    = thread ? jobs.find(j => j.id === thread.jobId) : null;

  useEffect(() => {
    if (thread && profile) markThreadRead(thread.id, profile.id);
  }, [thread?.messages.length]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [thread?.messages.length]);

  if (!thread) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Thread not found.</Text>
        </View>
      </View>
    );
  }

  const handleSend = () => {
    const trimmed = body.trim();
    if (!trimmed || !profile) return;
    sendMessage(thread.id, profile.id, profile.contactName ?? 'You', trimmed);
    setBody('');
  };

  const isMe = (senderId: string) => senderId === profile?.id;

  const otherName = profile?.id === thread.farmerId
    ? thread.operatorName
    : 'Farmer';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />
      <View style={styles.container}>

        {/* Thread header */}
        <View style={styles.threadHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.threadHeaderInfo}>
            <Text style={styles.threadHeaderName}>{otherName}</Text>
            <Text style={styles.threadHeaderJob} numberOfLines={1}>
              Re: {thread.jobTitle || job?.services.join(', ') || 'Job'}
            </Text>
          </View>
          {job && (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(tabs)/job-detail', params: { jobId: job.id } } as any)}
            >
              <MaterialCommunityIcons name="information-outline" size={22} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
        >
          {thread.messages.length === 0 && (
            <View style={styles.emptyThread}>
              <MaterialCommunityIcons name="message-text-outline" size={40} color="#d0e8d0" />
              <Text style={styles.emptyThreadText}>
                Send a message to start the conversation with {otherName}.
              </Text>
            </View>
          )}

          {thread.messages.map((msg) => {
            const mine = isMe(msg.senderId);
            const timeLabel = new Date(msg.sentAt).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
            return (
              <View key={msg.id} style={[styles.msgRow, mine && styles.msgRowMe]}>
                {!mine && (
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitial}>{msg.senderName[0]?.toUpperCase()}</Text>
                  </View>
                )}
                <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleThem]}>
                  {!mine && <Text style={styles.senderName}>{msg.senderName}</Text>}
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMe]}>{msg.body}</Text>
                  <Text style={[styles.timeLabel, mine && styles.timeLabelMe]}>{timeLabel}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={body}
            onChangeText={setBody}
            placeholder="Type a message…"
            placeholderTextColor="#bbb"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !body.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!body.trim()}
          >
            <MaterialCommunityIcons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f4f8f4' },

  notFound:            { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  notFoundText:        { fontSize: 16, color: '#666' },

  threadHeader:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2d6a2d', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn:             { padding: 2 },
  threadHeaderInfo:    { flex: 1 },
  threadHeaderName:    { fontSize: 16, fontWeight: '800', color: '#fff' },
  threadHeaderJob:     { fontSize: 12, color: '#c8e6c8', marginTop: 1 },

  messageList:         { flex: 1 },
  messageListContent:  { padding: 16, paddingBottom: 8 },

  emptyThread:         { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12 },
  emptyThreadText:     { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 21, maxWidth: 260 },

  msgRow:              { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  msgRowMe:            { flexDirection: 'row-reverse' },

  avatarCircle:        { width: 32, height: 32, borderRadius: 16, backgroundColor: '#d0e8d0', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarInitial:       { fontSize: 14, fontWeight: '700', color: '#2d6a2d' },

  bubble:              { maxWidth: '75%', borderRadius: 14, padding: 12 },
  bubbleMe:            { backgroundColor: '#2d6a2d', borderBottomRightRadius: 4 },
  bubbleThem:          { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  senderName:          { fontSize: 11, fontWeight: '700', color: '#2d6a2d', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  bubbleText:          { fontSize: 15, color: '#1a3c1a', lineHeight: 21 },
  bubbleTextMe:        { color: '#fff' },
  timeLabel:           { fontSize: 10, color: '#888', marginTop: 4, textAlign: 'right' },
  timeLabelMe:         { color: 'rgba(255,255,255,0.6)' },

  inputRow:            { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e8e8e8' },
  input:               { flex: 1, backgroundColor: '#f4f8f4', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#1a3c1a', maxHeight: 100, borderWidth: 1, borderColor: '#e0e0e0' },
  sendBtn:             { width: 42, height: 42, borderRadius: 21, backgroundColor: '#2d6a2d', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled:     { backgroundColor: '#d0e8d0' },
});
