import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

const LOGO = require('@/assets/images/FP Logo - Trasluscent Background.png');
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setLoginError('Please enter your email and password.'); return; }
    setLoginError('');
    setLoading(true);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Sign in timed out — please try again.')), 15_000)
      );
      await Promise.race([signIn(email, password), timeout]);
      router.replace('/(tabs)/search');
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setLoginError('Email not confirmed — check your inbox for the confirmation link.');
      } else {
        setLoginError(msg || 'Sign in failed. Check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.75} style={styles.logoBtn}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.form}>
        {/* Sign In */}
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Access pricing data across North America</Text>

        <View style={styles.signInSection}>
          {loginError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{loginError}</Text>
            </View>
          ) : null}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password' as any)} style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register section */}
        <View style={styles.registerSection}>
          <Text style={styles.registerTitle}>New to FarmingPal?</Text>
          <Text style={styles.registerSub}>
            Create a free account to search prices across all of Canada and the USA, save your farm profile, and access the full marketplace.
          </Text>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerBtnText}>Create Free Account →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/getstarted')}>
            <Text style={styles.howItWorksLink}>See how FarmingPal works first</Text>
          </TouchableOpacity>
        </View>

        </View>{/* end form */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#fff' },
  content:          { paddingTop: 0, paddingLeft: 0, paddingRight: 28, paddingBottom: 48 },

  logoBtn:          { marginTop: 12, marginLeft: 12, marginBottom: 32 },
  form:             { paddingLeft: 12, paddingRight: 28 },
  logo:             { height: 100, width: 130 },

  title:            { fontSize: 30, fontWeight: '800', color: '#1a3c1a', marginBottom: 6, marginLeft: 20 },
  subtitle:         { fontSize: 15, color: '#666', marginBottom: 32, marginLeft: 20 },

  label:            { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:            { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, fontSize: 16, marginBottom: 20 },

  button:           { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 4 },
  buttonDisabled:   { opacity: 0.6 },
  buttonText:       { color: '#fff', fontSize: 17, fontWeight: '700' },

  divider:          { flexDirection: 'row', alignItems: 'center', marginVertical: 28 },
  dividerLine:      { flex: 1, height: 1, backgroundColor: '#e8e8e8' },
  dividerText:      { marginHorizontal: 12, fontSize: 13, color: '#aaa', fontWeight: '600' },

  signInSection:    { backgroundColor: '#f4f8f4', borderRadius: 14, padding: 20, marginBottom: 4 },
  registerSection:  { backgroundColor: '#f4f8f4', borderRadius: 14, padding: 20 },
  registerTitle:    { fontSize: 18, fontWeight: '800', color: '#1a3c1a', marginBottom: 8 },
  registerSub:      { fontSize: 14, color: '#666', lineHeight: 21, marginBottom: 18 },
  registerBtn:      { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  registerBtnText:  { color: '#fff', fontSize: 15, fontWeight: '700' },
  howItWorksLink:   { color: '#2d6a2d', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  forgotRow:        { marginTop: 14, alignItems: 'center' },
  forgotText:       { color: '#2d6a2d', fontSize: 13, fontWeight: '600' },
  errorBox:         { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginBottom: 16 },
  errorText:        { fontSize: 14, color: '#c0392b', fontWeight: '600', lineHeight: 20 },
});
