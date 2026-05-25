import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';

const LOGO = require('@/assets/images/FP Logo - Trasluscent Background.png');

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // Set when Supabase requires email confirmation before activating the account
  const [pendingEmail, setPendingEmail] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!email || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    // After confirmation the user lands back at /search; RouteGuard handles onboarding
    const emailRedirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/search`
      : undefined;

    setLoading(true);
    try {
      const { confirmationRequired } = await signUp(email.trim().toLowerCase(), password, emailRedirectTo);
      if (confirmationRequired) {
        // Email confirmation is on — show the pending state
        setPendingEmail(email.trim().toLowerCase());
      } else {
        // Auto-confirm is on (local / dev config) — session is active immediately
        router.replace('/(auth)/farm-profile');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Confirmation pending state ────────────────────────────────────────────
  if (pendingEmail) {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} activeOpacity={0.75} style={styles.logoBtn}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.confirmBox}>
              <Text style={styles.confirmIcon}>✉️</Text>
              <Text style={styles.confirmTitle}>Confirm your email</Text>
              <Text style={styles.confirmSub}>
                We sent a confirmation link to{'\n'}
                <Text style={styles.confirmEmail}>{pendingEmail}</Text>
              </Text>
              <Text style={styles.confirmInstructions}>
                Click the link in the email to activate your account and sign in.
              </Text>
              <View style={styles.confirmDivider} />
              <Text style={styles.confirmHint}>
                Don't see it? Check your spam or junk folder.
              </Text>
            </View>

            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.signInBtn}>
              <Text style={styles.signInBtnText}>Already confirmed? Sign In →</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPendingEmail('')} style={styles.retryRow}>
              <Text style={styles.retryText}>Use a different email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.75} style={styles.logoBtn}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Free to join — search prices across North America</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={t => { setEmail(t); setError(''); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={t => { setPassword(t); setError(''); }}
            placeholder="8+ characters"
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirm}
            onChangeText={t => { setConfirm(t); setError(''); }}
            placeholder="••••••••"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fff' },
  scrollContent:{ paddingBottom: 48 },
  logoBtn:      { marginTop: 12, marginLeft: 12, marginBottom: 32 },
  logo:         { height: 100, width: 130 },
  form:         { paddingLeft: 24, paddingRight: 28 },

  title:        { fontSize: 30, fontWeight: '800', color: '#1a3c1a', marginBottom: 6 },
  subtitle:     { fontSize: 15, color: '#666', marginBottom: 32, lineHeight: 22 },

  errorBox:     { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginBottom: 20 },
  errorText:    { fontSize: 14, color: '#c0392b', fontWeight: '600', lineHeight: 20 },

  label:        { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:        { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, fontSize: 16, marginBottom: 20 },

  button:         { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 20 },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: '#fff', fontSize: 17, fontWeight: '700' },
  link:           { color: '#2d6a2d', fontSize: 14, textAlign: 'center', fontWeight: '600' },

  // Confirmation pending
  confirmBox:          { backgroundColor: '#f0f9f0', borderRadius: 16, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 28, alignItems: 'center', marginBottom: 24 },
  confirmIcon:         { fontSize: 48, marginBottom: 16 },
  confirmTitle:        { fontSize: 22, fontWeight: '900', color: '#1a3c1a', marginBottom: 12, textAlign: 'center' },
  confirmSub:          { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 12 },
  confirmEmail:        { fontWeight: '700', color: '#2d6a2d' },
  confirmInstructions: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  confirmDivider:      { width: '100%', height: 1, backgroundColor: '#d0e8d0', marginBottom: 16 },
  confirmHint:         { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 19 },

  signInBtn:     { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 14 },
  signInBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  retryRow:      { alignItems: 'center', paddingVertical: 8 },
  retryText:     { color: '#2d6a2d', fontSize: 13, fontWeight: '600' },
});
