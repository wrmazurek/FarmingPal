import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAdminAuth } from '@/context/AdminAuthContext';

const LOGO = require('@/assets/images/FP Logo - Trasluscent Background.png');

export default function AdminSignInScreen() {
  const router = useRouter();
  const { adminSignIn } = useAdminAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSignIn = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    const ok = await adminSignIn(email.trim(), password);
    setLoading(false);
    if (ok) {
      router.replace('/admin/dashboard' as any);
    } else {
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topBar}>
        <View style={styles.topBarInner}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <Text style={styles.topBarLabel}>ADMIN PORTAL</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <MaterialCommunityIcons name="shield-lock" size={28} color="#c8931a" />
            <Text style={styles.cardTitle}>FarmingPal Admin</Text>
          </View>
          <Text style={styles.cardSub}>Restricted access — authorized personnel only.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="admin@farmingpal.com"
              placeholderTextColor="#6b7280"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.pwdRow}>
              <TextInput
                style={[styles.input, styles.pwdInput]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                placeholder="••••••••••"
                placeholderTextColor="#6b7280"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd(v => !v)}>
                <MaterialCommunityIcons name={showPwd ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={styles.errorRow}>
              <MaterialCommunityIcons name="alert-circle" size={15} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.signInBtn, loading && styles.signInBtnDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <MaterialCommunityIcons name="login" size={18} color="#fff" />
            <Text style={styles.signInBtnText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>FarmingPal Admin v1.0 · Internal use only</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#0f172a' },

  topBar:         { backgroundColor: '#1e293b', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#334155' },
  topBarInner:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo:           { width: 38, height: 38, borderRadius: 8 },
  topBarLabel:    { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase' },

  body:           { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

  card:           { width: '100%', maxWidth: 420, backgroundColor: '#1e293b', borderRadius: 16, padding: 28, borderWidth: 1, borderColor: '#334155' },
  badgeRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  cardTitle:      { fontSize: 22, fontWeight: '900', color: '#f1f5f9' },
  cardSub:        { fontSize: 13, color: '#64748b', marginBottom: 28, lineHeight: 20 },

  field:          { marginBottom: 18 },
  label:          { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  input:          { backgroundColor: '#0f172a', borderRadius: 10, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: '#f1f5f9' },
  pwdRow:         { flexDirection: 'row', alignItems: 'center' },
  pwdInput:       { flex: 1 },
  eyeBtn:         { position: 'absolute', right: 14 },

  errorRow:       { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#450a0a', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText:      { fontSize: 13, color: '#fca5a5', flex: 1 },

  signInBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#c8931a', borderRadius: 10, paddingVertical: 15, marginTop: 4 },
  signInBtnDisabled: { opacity: 0.6 },
  signInBtnText:  { fontSize: 15, fontWeight: '800', color: '#fff' },

  footer:         { marginTop: 32, fontSize: 12, color: '#475569', textAlign: 'center' },
});
