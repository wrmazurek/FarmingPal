import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';

export default function FarmhandApplyScreen() {
  const router = useRouter();
  const { id: postingId, title } = useLocalSearchParams<{ id: string; title: string }>();
  const { user, isAuthenticated } = useAuth();
  const { profile } = useUser();

  const hasSavedResume = isAuthenticated && !!profile?.farmhandResumeUrl;

  const [name,        setName]        = useState(profile?.contactName ?? '');
  const [email,       setEmail]       = useState(profile?.email ?? user?.email ?? '');
  const [phone,       setPhone]       = useState('');
  const [experience,  setExperience]  = useState(profile?.farmhandExperience ?? '');
  const [coverLetter, setCoverLetter] = useState('');
  const [useSavedResume, setUseSavedResume] = useState(hasSavedResume);
  const [resumeUri,   setResumeUri]   = useState<string | null>(null);
  const [resumeName,  setResumeName]  = useState<string | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState('');

  const pickResume = async () => {
    const result = await ImagePicker.launchDocumentPickerAsync?.().catch(() => null)
      ?? await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
    if (!result.canceled && result.assets?.[0]) {
      setResumeUri(result.assets[0].uri);
      setResumeName(result.assets[0].fileName ?? 'resume');
      setUseSavedResume(false);
    }
  };

  const uploadResume = async (): Promise<{ url: string; name: string } | null> => {
    if (!resumeUri || !user?.id) return null;
    try {
      const resp = await fetch(resumeUri);
      const blob = await resp.blob();
      const ext  = resumeName?.split('.').pop() ?? 'pdf';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('farmhand-resumes').upload(path, blob);
      if (upErr) return null;
      const { data } = supabase.storage.from('farmhand-resumes').getPublicUrl(path);
      return { url: data.publicUrl, name: resumeName ?? 'resume' };
    } catch {
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!name.trim())  { setError('Your name is required.'); return; }
    if (!email.trim()) { setError('Your email is required.'); return; }
    setError('');
    setSubmitting(true);

    try {
      let resumeUrl  = useSavedResume ? (profile?.farmhandResumeUrl ?? null) : null;
      let rName      = useSavedResume ? (profile?.farmhandResumeName ?? null) : null;

      if (!useSavedResume && resumeUri) {
        const uploaded = await uploadResume();
        if (uploaded) { resumeUrl = uploaded.url; rName = uploaded.name; }
      }

      const { error: err } = await supabase.from('farmhand_applications').insert({
        posting_id:     postingId,
        applicant_id:   user?.id ?? null,
        applicant_name: name.trim(),
        email:          email.trim(),
        phone:          phone.trim(),
        cover_letter:   coverLetter.trim(),
        resume_url:     resumeUrl,
        resume_name:    rName,
        experience:     experience.trim(),
        status:         'pending',
      });
      if (err) throw err;
      setSubmitted(true);
    } catch {
      setError('Could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.successBox}>
        <MaterialCommunityIcons name="check-circle-outline" size={72} color="#2d6a2d" />
        <Text style={styles.successTitle}>Application Submitted!</Text>
        <Text style={styles.successBody}>
          Your application for{'\n'}<Text style={styles.successJobTitle}>"{title}"</Text>{'\n'}has been sent to the employer.
        </Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/(tabs)/farmhands' as any)}>
          <Text style={styles.doneBtnText}>Back to Job Board</Text>
        </TouchableOpacity>
        {!isAuthenticated && (
          <TouchableOpacity style={styles.signUpPrompt} onPress={() => router.push('/(auth)/register' as any)}>
            <Text style={styles.signUpPromptText}>Create an account to save your resume and apply faster next time →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.pageTitle}>Apply</Text>
        <Text style={styles.pageSubtitle}>{title}</Text>

        {/* Your Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="First and last name" placeholderTextColor="#bbb" autoCapitalize="words" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#bbb" keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={[styles.field, styles.fieldLast]}>
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="e.g. 306-555-1234" placeholderTextColor="#bbb" keyboardType="phone-pad" />
          </View>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={[styles.field, styles.fieldLast]}>
            <Text style={styles.label}>Relevant Experience</Text>
            <TextInput style={[styles.input, styles.textArea]} value={experience} onChangeText={setExperience} placeholder="Describe your farm experience, years worked, equipment operated, licenses held..." placeholderTextColor="#bbb" multiline numberOfLines={5} />
          </View>
        </View>

        {/* Cover Letter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Letter</Text>
          <View style={[styles.field, styles.fieldLast]}>
            <Text style={styles.label}>Message to Employer</Text>
            <TextInput style={[styles.input, styles.textArea]} value={coverLetter} onChangeText={setCoverLetter} placeholder="Introduce yourself and explain why you're a good fit for this position..." placeholderTextColor="#bbb" multiline numberOfLines={5} />
          </View>
        </View>

        {/* Resume */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume (Optional)</Text>

          {hasSavedResume && (
            <TouchableOpacity
              style={[styles.resumeOption, useSavedResume && styles.resumeOptionActive]}
              onPress={() => { setUseSavedResume(true); setResumeUri(null); }}
            >
              <MaterialCommunityIcons name="file-account-outline" size={22} color={useSavedResume ? '#2d6a2d' : '#888'} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.resumeOptionLabel, useSavedResume && { color: '#2d6a2d' }]}>Use my saved resume</Text>
                <Text style={styles.resumeOptionHint}>{profile?.farmhandResumeName ?? 'Saved resume'}</Text>
              </View>
              {useSavedResume && <MaterialCommunityIcons name="check-circle" size={20} color="#2d6a2d" />}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.resumeOption, !useSavedResume && resumeUri && styles.resumeOptionActive]}
            onPress={pickResume}
          >
            <MaterialCommunityIcons name="upload-outline" size={22} color={!useSavedResume && resumeUri ? '#2d6a2d' : '#888'} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.resumeOptionLabel, !useSavedResume && resumeUri && { color: '#2d6a2d' }]}>
                {resumeUri ? resumeName : 'Upload a resume'}
              </Text>
              <Text style={styles.resumeOptionHint}>PDF, Word, or image — tap to select</Text>
            </View>
            {!useSavedResume && resumeUri && <MaterialCommunityIcons name="check-circle" size={20} color="#2d6a2d" />}
          </TouchableOpacity>

          {!isAuthenticated && (
            <Text style={styles.saveHint}>
              <Text style={styles.saveHintLink} onPress={() => router.push('/(auth)/register' as any)}>Create a free account</Text>
              {' '}to save your resume and apply to future jobs with one tap.
            </Text>
          )}
        </View>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Application'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f4f8f4' },
  content:      { padding: 16, paddingBottom: 48 },

  pageTitle:    { fontSize: 22, fontWeight: '900', color: '#1a3c1a', marginBottom: 2 },
  pageSubtitle: { fontSize: 15, color: '#7a5230', fontWeight: '600', marginBottom: 16 },

  section:      { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#c8931a', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 },

  field:     { marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 14 },
  fieldLast: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
  label:     { fontSize: 13, fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  input:     { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 12, fontSize: 15, color: '#1a3c1a' },
  textArea:  { minHeight: 110, textAlignVertical: 'top' },

  resumeOption:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#e0e0e0', marginBottom: 10 },
  resumeOptionActive: { borderColor: '#2d6a2d', backgroundColor: '#f0f8f0' },
  resumeOptionLabel:  { fontSize: 14, fontWeight: '600', color: '#555' },
  resumeOptionHint:   { fontSize: 12, color: '#aaa', marginTop: 2 },

  saveHint:     { fontSize: 12, color: '#888', lineHeight: 18, marginTop: 6 },
  saveHintLink: { color: '#2d6a2d', fontWeight: '700' },

  errorBox:  { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginBottom: 10 },
  errorText: { fontSize: 14, color: '#c0392b', fontWeight: '600' },

  submitBtn:         { backgroundColor: '#7a5230', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 10 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText:     { color: '#fff', fontSize: 17, fontWeight: '700' },
  cancelBtn:         { borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fff' },
  cancelBtnText:     { color: '#888', fontWeight: '600', fontSize: 15 },

  successBox:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  successTitle:     { fontSize: 24, fontWeight: '900', color: '#1a3c1a' },
  successBody:      { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 24 },
  successJobTitle:  { fontWeight: '700', color: '#7a5230' },
  doneBtn:          { backgroundColor: '#2d6a2d', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40 },
  doneBtnText:      { color: '#fff', fontWeight: '800', fontSize: 15 },
  signUpPrompt:     { marginTop: 8, padding: 14, backgroundColor: '#f0f8f0', borderRadius: 10 },
  signUpPromptText: { fontSize: 13, color: '#2d6a2d', fontWeight: '600', textAlign: 'center', lineHeight: 20 },
});
