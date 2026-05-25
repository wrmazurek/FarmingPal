import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { useUser } from '@/context/UserContext';
import { useJobBoard } from '@/context/JobBoardContext';
import type { JobQuote } from '@/types';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: '#888',    bg: '#f5f5f5' },
  accepted: { label: 'Accepted', color: '#2d6a2d', bg: '#e8f5e8' },
  declined: { label: 'Declined', color: '#cc3333', bg: '#fff5f5' },
};

export default function JobApplicantsScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const { profile } = useUser();
  const { jobs, getQuotesForJob, acceptQuote, declineQuote, openThread } = useJobBoard();

  const job    = jobs.find(j => j.id === jobId);
  const quotes = getQuotesForJob(jobId ?? '');

  if (!job) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Job not found.</Text>
        </View>
      </View>
    );
  }

  const hasAccepted = quotes.some(q => q.status === 'accepted');

  const handleMessage = (quote: JobQuote) => {
    if (!profile) return;
    const threadId = openThread(
      job.id,
      job.services.join(', '),
      job.farmerId,
      quote.operatorId,
      quote.operatorName,
    );
    router.push({ pathname: '/(tabs)/job-thread', params: { threadId } } as any);
  };

  const QuoteCard = ({ quote }: { quote: JobQuote }) => {
    const cfg = STATUS_CONFIG[quote.status];
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.operatorName}>{quote.operatorName}</Text>
            {quote.businessName ? <Text style={styles.businessName}>{quote.businessName}</Text> : null}
          </View>
          <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.rateRow}>
          <MaterialCommunityIcons name="cash" size={16} color="#2d6a2d" />
          <Text style={styles.rateText}>{quote.ratePerAcre} / ac</Text>
        </View>

        <Text style={styles.quoteMessage}>"{quote.message}"</Text>

        <Text style={styles.submittedAt}>
          Submitted {new Date(quote.submittedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>

        {quote.status === 'pending' && !hasAccepted && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => acceptQuote(quote.id, job.id)}
            >
              <MaterialCommunityIcons name="check" size={15} color="#fff" />
              <Text style={styles.acceptBtnText}>Accept Quote</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => handleMessage(quote)}
            >
              <MaterialCommunityIcons name="message-outline" size={15} color="#2d6a2d" />
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => declineQuote(quote.id)}
            >
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {quote.status === 'accepted' && (
          <TouchableOpacity style={styles.messageBtn} onPress={() => handleMessage(quote)}>
            <MaterialCommunityIcons name="message-outline" size={15} color="#2d6a2d" />
            <Text style={styles.messageBtnText}>Open Thread</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.hero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← My Jobs</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitle}>{job.services.join(' · ')}</Text>
          <Text style={styles.heroMeta}>{job.acres} ac · {job.crop || 'Crop not specified'}</Text>
        </View>

        <View style={styles.toolbar}>
          <Text style={styles.quoteCount}>{quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'} received</Text>
          {hasAccepted && (
            <View style={styles.filledBadge}>
              <MaterialCommunityIcons name="check-circle" size={13} color="#2d6a2d" />
              <Text style={styles.filledBadgeText}>Job Filled</Text>
            </View>
          )}
        </View>

        {quotes.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="clock-outline" size={48} color="#d0e8d0" />
            <Text style={styles.emptyTitle}>No quotes yet</Text>
            <Text style={styles.emptySub}>Operators in your district will be notified about this job.</Text>
          </View>
        ) : (
          quotes.map(q => <QuoteCard key={q.id} quote={q} />)
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f4f8f4' },
  content:         { paddingBottom: 48 },

  notFound:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  notFoundText:    { fontSize: 16, color: '#666' },

  hero:            { backgroundColor: '#2d6a2d', padding: 20, paddingTop: 16 },
  backBtn:         { marginBottom: 12 },
  backBtnText:     { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' },
  heroTitle:       { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  heroMeta:        { fontSize: 13, color: '#c8e6c8' },

  toolbar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  quoteCount:      { fontSize: 13, color: '#888', fontWeight: '600' },
  filledBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#e8f5e8', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12 },
  filledBadgeText: { fontSize: 12, fontWeight: '700', color: '#2d6a2d' },

  empty:           { alignItems: 'center', padding: 48, gap: 12 },
  emptyTitle:      { fontSize: 17, fontWeight: '700', color: '#1a3c1a' },
  emptySub:        { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 21 },

  card:            { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  operatorName:    { fontSize: 15, fontWeight: '800', color: '#1a3c1a' },
  businessName:    { fontSize: 13, color: '#888', marginTop: 1 },
  statusPill:      { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  statusText:      { fontSize: 11, fontWeight: '700' },

  rateRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  rateText:        { fontSize: 16, fontWeight: '800', color: '#2d6a2d' },

  quoteMessage:    { fontSize: 14, color: '#555', fontStyle: 'italic', lineHeight: 20, marginBottom: 8 },
  submittedAt:     { fontSize: 12, color: '#aaa', marginBottom: 12 },

  actions:         { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  acceptBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#2d6a2d', borderRadius: 8, paddingVertical: 10 },
  acceptBtnText:   { color: '#fff', fontSize: 13, fontWeight: '700' },
  messageBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#f0f8f0', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: '#d0e8d0' },
  messageBtnText:  { color: '#2d6a2d', fontSize: 13, fontWeight: '700' },
  declineBtn:      { paddingVertical: 10, paddingHorizontal: 14 },
  declineBtnText:  { fontSize: 13, color: '#cc3333', fontWeight: '600' },
});
