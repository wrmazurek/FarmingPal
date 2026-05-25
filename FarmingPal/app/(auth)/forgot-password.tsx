import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { supabase } from '@/lib/supabase';

const LOGO = require('@/assets/images/FP Logo - Trasluscent Background.png');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [formError, setFormError] = useState('');

  const handleSend = async () => {
    setFormError('');
    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    setLoading(true);

    // Expo Router groups like (auth) are transparent in the URL — the actual
    // browser path is /reset-password, not /(auth)/reset-password.
    // Supabase will reject any redirectTo not in its Redirect URLs allowlist.
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo,
    });
    setLoading(false);

    if (error) {
      setFormError(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} activeOpacity={0.75} style={styles.logoBtn}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.title}>Reset Password</Text>

          {sent ? (
            <>
              <View style={styles.successBox}>
                <Text style={styles.successIcon}>✉️</Text>
                <Text style={styles.successTitle}>Check your email</Text>
                <Text style={styles.successSub}>
                  We sent a password reset link to {email}. Click the link in the email to choose a new password.{'\n\n'}
                  Don't see it? Check your spam or junk folder.
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.link}>← Back to Sign In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Enter your account email and we'll send you a link to reset your password.
              </Text>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              {formError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSend}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.link}>← Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fff' },
  logoBtn:      { marginTop: 12, marginLeft: 12, marginBottom: 32 },
  logo:         { height: 100, width: 130 },
  form:         { paddingLeft: 24, paddingRight: 28 },

  title:        { fontSize: 30, fontWeight: '800', color: '#1a3c1a', marginBottom: 8 },
  subtitle:     { fontSize: 15, color: '#666', marginBottom: 32, lineHeight: 22 },

  label:        { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:        { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, fontSize: 16, marginBottom: 24 },

  button:         { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 20 },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: '#fff', fontSize: 17, fontWeight: '700' },

  link:         { color: '#2d6a2d', fontSize: 14, textAlign: 'center', fontWeight: '600' },

  errorBox:     { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginBottom: 16 },
  errorText:    { fontSize: 14, color: '#c0392b', fontWeight: '600', lineHeight: 20 },

  successBox:   { backgroundColor: '#f0f9f0', borderRadius: 14, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 24, alignItems: 'center', marginBottom: 28 },
  successIcon:  { fontSize: 40, marginBottom: 12 },
  successTitle: { fontSize: 18, fontWeight: '800', color: '#1a3c1a', marginBottom: 8 },
  successSub:   { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 21 },
});
