import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { useUser } from '@/context/UserContext';
import { useJobBoard } from '@/context/JobBoardContext';
import type { JobPosting } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  open:   '#2d6a2d',
  filled: '#c8931a',
  closed: '#999',
};

export default function MyJobsScreen() {
  const router = useRouter();
  const { profile } = useUser();
  const { getMyJobs, getQuotesForJob, updateJobStatus } = useJobBoard();

  const myJobs = getMyJobs(profile?.id ?? '');

  const JobRow = ({ job }: { job: JobPosting }) => {
    const quotes      = getQuotesForJob(job.id);
    const pendingCount = quotes.filter(q => q.status === 'pending').length;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardServices}>{job.services.join(' · ')}</Text>
            <Text style={styles.cardMeta}>{job.acres} ac · {job.crop || 'Crop not specified'}</Text>
            <Text style={styles.cardDate}>Start: {job.startDate}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[job.status] + '22' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[job.status] }]}>
              {job.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.quoteBanner}>
          <MaterialCommunityIcons name="file-document-outline" size={15} color="#2d6a2d" />
          <Text style={styles.quoteCount}>
            {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'} received
            {pendingCount > 0 ? ` · ${pendingCount} pending review` : ''}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/(tabs)/job-applicants', params: { jobId: job.id } } as any)}
          >
            <Text style={styles.actionBtnText}>View Quotes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/(tabs)/job-detail', params: { jobId: job.id } } as any)}
          >
            <Text style={styles.actionBtnText}>View Post</Text>
          </TouchableOpacity>

          {job.status === 'open' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDanger]}
              onPress={() => updateJobStatus(job.id, 'closed')}
            >
              <Text style={styles.actionBtnDangerText}>Close Job</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.hero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Job Board</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitle}>My Job Postings</Text>
          <Text style={styles.heroSub}>Manage your posted jobs and review incoming quotes</Text>
        </View>

        <View style={styles.toolbar}>
          <Text style={styles.count}>{myJobs.length} {myJobs.length === 1 ? 'posting' : 'postings'}</Text>
          <TouchableOpacity
            style={styles.newJobBtn}
            onPress={() => router.push('/(tabs)/service-booking' as any)}
          >
            <MaterialCommunityIcons name="plus" size={15} color="#fff" />
            <Text style={styles.newJobBtnText}>Post New Job</Text>
          </TouchableOpacity>
        </View>

        {myJobs.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="clipboard-plus-outline" size={48} color="#d0e8d0" />
            <Text style={styles.emptyTitle}>No job postings yet</Text>
            <Text style={styles.emptySub}>Post your first job to start receiving quotes from operators in your area.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/service-booking' as any)}>
              <Text style={styles.emptyBtnText}>Post a Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          myJobs.map(job => <JobRow key={job.id} job={job} />)
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f4f8f4' },
  content:           { paddingBottom: 48 },

  hero:              { backgroundColor: '#2d6a2d', padding: 20, paddingTop: 16 },
  backBtn:           { marginBottom: 12 },
  backBtnText:       { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' },
  heroTitle:         { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 4 },
  heroSub:           { fontSize: 13, color: '#c8e6c8' },

  toolbar:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  count:             { fontSize: 13, color: '#888', fontWeight: '600' },
  newJobBtn:         { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#2d6a2d', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 },
  newJobBtnText:     { fontSize: 13, fontWeight: '700', color: '#fff' },

  card:              { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTop:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardLeft:          { flex: 1, marginRight: 10 },
  cardServices:      { fontSize: 15, fontWeight: '800', color: '#1a3c1a', marginBottom: 3 },
  cardMeta:          { fontSize: 13, color: '#666', marginBottom: 2 },
  cardDate:          { fontSize: 12, color: '#aaa' },
  statusPill:        { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  statusText:        { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  quoteBanner:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0f8f0', borderRadius: 8, padding: 10, marginBottom: 12 },
  quoteCount:        { fontSize: 13, color: '#2d6a2d', fontWeight: '600' },

  cardActions:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn:         { flex: 1, backgroundColor: '#f0f8f0', borderRadius: 8, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: '#d0e8d0' },
  actionBtnText:     { fontSize: 13, fontWeight: '700', color: '#2d6a2d' },
  actionBtnDanger:   { backgroundColor: '#fff5f5', borderColor: '#ffd0d0' },
  actionBtnDangerText:{ fontSize: 13, fontWeight: '700', color: '#cc3333' },

  empty:             { alignItems: 'center', padding: 48, gap: 12 },
  emptyTitle:        { fontSize: 17, fontWeight: '700', color: '#1a3c1a' },
  emptySub:          { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 21 },
  emptyBtn:          { backgroundColor: '#2d6a2d', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, marginTop: 8 },
  emptyBtnText:      { color: '#fff', fontSize: 15, fontWeight: '700' },
});
