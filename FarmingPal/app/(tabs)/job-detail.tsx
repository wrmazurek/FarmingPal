import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { useJobBoard } from '@/context/JobBoardContext';

export default function JobDetailScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { profile } = useUser();
  const { jobs, submitQuote, getMyQuotes, openThread } = useJobBoard();

  const job = jobs.find(j => j.id === jobId);

  const [ratePerAcre,   setRatePerAcre]   = useState('');
  const [message,       setMessage]       = useState('');
  const [submitting,    setSubmitting]     = useState(false);
  const [quoteError,    setQuoteError]     = useState('');
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  if (!job) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Job not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Back to Job Board</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const myQuotes    = getMyQuotes(profile?.id ?? '');
  const alreadyApplied = myQuotes.some(q => q.jobId === jobId);
  const isOwnJob    = job.farmerId === profile?.id;

  const handleSubmitQuote = () => {
    setQuoteError('');
    if (!ratePerAcre || !message) {
      setQuoteError('Please enter your rate and a message to the farmer.');
      return;
    }
    if (!isAuthenticated || !profile) {
      setQuoteError('You must be signed in to submit a quote.');
      return;
    }
    setSubmitting(true);
    submitQuote({
      jobId:        job.id,
      operatorId:   profile.id,
      operatorName: profile.contactName ?? 'Operator',
      businessName: profile.farmName ?? '',
      ratePerAcre,
      message,
    });
    setSubmitting(false);
    setQuoteSubmitted(true);
  };

  const handleMessageFarmer = () => {
    if (!profile) return;
    const threadId = openThread(
      job.id,
      job.services.join(', '),
      job.farmerId,
      profile.id,
      profile.contactName ?? 'Operator',
    );
    router.push({ pathname: '/(tabs)/job-thread', params: { threadId } } as any);
  };

  const DetailRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={styles.detailRow}>
      <MaterialCommunityIcons name={icon as any} size={16} color="#2d6a2d" style={styles.detailIcon} />
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || '—'}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.hero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Job Board</Text>
          </TouchableOpacity>
          <Text style={styles.heroServices}>{job.services.join(' · ')}</Text>
          <Text style={styles.heroFarmer}>Posted by {job.farmerName}</Text>
          <View style={[styles.statusBadge, job.status !== 'open' && styles.statusBadgeFilled]}>
            <Text style={styles.statusBadgeText}>{job.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Job details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <DetailRow icon="crop-landscape"  label="Acreage"    value={`${job.acres} acres`} />
          <DetailRow icon="barley"          label="Crop"       value={job.crop} />
          <DetailRow icon="terrain"         label="Terrain"    value={job.terrain} />
          <DetailRow icon="calendar-start"  label="Start Date" value={job.startDate} />
          <DetailRow icon="calendar-end"    label="End Date"   value={job.endDate || 'Flexible'} />
          {job.notes ? <DetailRow icon="note-text" label="Notes" value={job.notes} /> : null}
        </View>

        {/* Quote form — only for operators, not own job, not already applied */}
        {!isOwnJob && job.status === 'open' && !alreadyApplied && !quoteSubmitted && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Submit a Quote</Text>
            {quoteError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{quoteError}</Text>
              </View>
            ) : null}
            <Text style={styles.label}>Your Rate (per acre)</Text>
            <TextInput
              style={styles.input}
              value={ratePerAcre}
              onChangeText={setRatePerAcre}
              placeholder="e.g. $28.00 / ac"
              placeholderTextColor="#bbb"
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Message to Farmer</Text>
            <TextInput
              style={[styles.input, styles.inputTall]}
              value={message}
              onChangeText={setMessage}
              placeholder="Introduce yourself, your equipment, availability…"
              placeholderTextColor="#bbb"
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmitQuote}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit Quote'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {quoteSubmitted && !isOwnJob && (
          <View style={styles.appliedBanner}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#2d6a2d" />
            <Text style={styles.appliedText}>Quote submitted! The farmer will be notified.</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/job-board' as any)}>
              <Text style={styles.messageLink}>← Back to Job Board</Text>
            </TouchableOpacity>
          </View>
        )}

        {alreadyApplied && !isOwnJob && (
          <View style={styles.appliedBanner}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#2d6a2d" />
            <Text style={styles.appliedText}>You've already submitted a quote for this job.</Text>
            <TouchableOpacity onPress={handleMessageFarmer}>
              <Text style={styles.messageLink}>Message Farmer →</Text>
            </TouchableOpacity>
          </View>
        )}

        {isOwnJob && (
          <View style={styles.ownJobBanner}>
            <MaterialCommunityIcons name="information" size={18} color="#c8931a" />
            <Text style={styles.ownJobText}>This is your job posting.</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/job-applicants', params: { jobId: job.id } } as any)}>
              <Text style={styles.viewApplicantsLink}>View Quotes →</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f4f8f4' },
  content:            { paddingBottom: 48 },

  notFound:           { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  notFoundText:       { fontSize: 16, color: '#666' },
  backLink:           { color: '#2d6a2d', fontWeight: '600', fontSize: 14 },

  hero:               { backgroundColor: '#2d6a2d', padding: 20, paddingTop: 16 },
  backBtn:            { marginBottom: 12 },
  backBtnText:        { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' },
  heroServices:       { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  heroFarmer:         { fontSize: 14, color: '#c8e6c8', marginBottom: 12 },
  statusBadge:        { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  statusBadgeFilled:  { backgroundColor: '#c8931a' },
  statusBadgeText:    { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  section:            { backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 14, padding: 16 },
  sectionTitle:       { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16 },

  detailRow:          { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  detailIcon:         { marginRight: 12, marginTop: 2 },
  detailLabel:        { fontSize: 11, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  detailValue:        { fontSize: 15, color: '#1a3c1a', fontWeight: '500' },

  label:              { fontSize: 12, fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:              { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 12, fontSize: 15, color: '#1a3c1a', marginBottom: 16 },
  inputTall:          { minHeight: 90 },

  submitBtn:          { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 16, alignItems: 'center' },
  submitBtnDisabled:  { opacity: 0.6 },
  submitBtnText:      { color: '#fff', fontSize: 16, fontWeight: '700' },

  errorBox:           { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 12, marginBottom: 16 },
  errorText:          { fontSize: 14, color: '#c0392b', fontWeight: '600', lineHeight: 20 },

  appliedBanner:      { margin: 16, backgroundColor: '#e8f5e8', borderRadius: 14, padding: 16, gap: 6 },
  appliedText:        { fontSize: 14, color: '#2d6a2d', fontWeight: '600' },
  messageLink:        { fontSize: 14, fontWeight: '700', color: '#c8931a' },

  ownJobBanner:       { margin: 16, backgroundColor: '#fff8ec', borderRadius: 14, padding: 16, gap: 6 },
  ownJobText:         { fontSize: 14, color: '#c8931a', fontWeight: '600' },
  viewApplicantsLink: { fontSize: 14, fontWeight: '700', color: '#2d6a2d' },
});
