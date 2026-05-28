import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase, SUPABASE_URL, SUPABASE_ANON } from '@/lib/supabase';

// Parse the URL hash fragment into key-value pairs (web only).
// Supabase sends recovery tokens as: /reset-password#access_token=...&type=recovery
function parseHash(): Record<string, string> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return {};
  return Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)));
}

const LOGO = require('@/assets/images/FP Logo - Trasluscent Background.png');

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [ready,    setReady]    = useState(false);
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);
  const recoveryReady = useRef(false);
  const recoverySession = useRef<Session | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolveSession = (session: Session) => {
      if (cancelled || recoveryReady.current) return;
      recoveryReady.current = true;
      recoverySession.current = session;
      setReady(true);
    };

    // Primary: listen for the PASSWORD_RECOVERY event. This fires when Supabase
    // processes the URL hash after this component mounts.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) resolveSession(session);
    });

    // Supabase (detectSessionInUrl: true) processes the URL hash when the module
    // is first imported — usually before this component mounts, so the
    // PASSWORD_RECOVERY event is already gone. getSession() returns it immediately.
    // We also verify the URL has recovery params so we don't grab a stale login session.
    const hash = parseHash();
    const isRecoveryUrl = hash.type === 'recovery' && !!hash.access_token;

    if (isRecoveryUrl) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) { resolveSession(session); return; }
        // Hash present but session not yet stored — give Supabase one more tick
        setTimeout(() => {
          if (cancelled || recoveryReady.current) return;
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (s) resolveSession(s);
          });
        }, 800);
      });
    } else {
      // Native app path (no URL hash) — wait briefly for the event
      setTimeout(() => {
        if (cancelled || recoveryReady.current) return;
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) resolveSession(session);
        });
      }, 1500);
    }

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleReset = async () => {
    setError('');
    if (!password) { setError('Please enter a new password.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    const accessToken = recoverySession.current?.access_token;
    if (!accessToken) {
      setError('Session expired — please request a new reset link.');
      return;
    }

    setLoading(true);
    try {
      // Call the Supabase Auth REST API directly with the recovery access token.
      // Using supabase.auth.updateUser() was hanging due to the JS client's
      // internal lock/refresh machinery; a plain fetch bypasses that entirely.
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 15_000);
      let res: Response;
      try {
        res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          method:  'PUT',
          signal:  controller.signal,
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'apikey':        SUPABASE_ANON,
          },
          body: JSON.stringify({ password }),
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as any).message ?? `Error ${res.status} — try a new reset link.`);
        return;
      }

      setDone(true);
      setTimeout(() => router.replace('/(auth)/login'), 2000);
    } catch (err: any) {
      const msg = err?.name === 'AbortError'
        ? 'Request timed out — try requesting a new reset link.'
        : (err?.message ?? 'Failed to update password. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} activeOpacity={0.75} style={styles.logoBtn}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.title}>New Password</Text>

          {done ? (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>Password updated!</Text>
              <Text style={styles.successSub}>Redirecting you to sign in…</Text>
            </View>
          ) : !ready ? (
            <View style={styles.waitBox}>
              <Text style={styles.waitIcon}>🔒</Text>
              <Text style={styles.waitTitle}>Verifying reset link…</Text>
              <Text style={styles.waitSub}>
                Confirming your reset link. Should be ready in a moment.
                If nothing happens, request a new link below.
              </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/forgot-password' as any)} style={styles.retryBtn}>
                <Text style={styles.retryText}>Request a new link</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>Choose a strong password (8+ characters).</Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={t => { setPassword(t); setError(''); }}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirm}
                onChangeText={t => { setConfirm(t); setError(''); }}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleReset}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Set New Password'}</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.backRow}>
            <Text style={styles.link}>← Back to Sign In</Text>
          </TouchableOpacity>
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

  errorBox:     { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginBottom: 20 },
  errorText:    { fontSize: 14, color: '#c0392b', fontWeight: '600', lineHeight: 20 },

  label:        { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:        { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, fontSize: 16, marginBottom: 24 },

  button:         { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 20 },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: '#fff', fontSize: 17, fontWeight: '700' },

  link:         { color: '#2d6a2d', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  backRow:      { marginTop: 8 },

  waitBox:      { backgroundColor: '#f0f9f0', borderRadius: 14, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 24, alignItems: 'center', marginBottom: 28 },
  waitIcon:     { fontSize: 40, marginBottom: 12 },
  waitTitle:    { fontSize: 18, fontWeight: '800', color: '#1a3c1a', marginBottom: 8 },
  waitSub:      { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  retryBtn:     { backgroundColor: '#2d6a2d', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  retryText:    { color: '#fff', fontSize: 14, fontWeight: '700' },

  successBox:   { backgroundColor: '#f0f9f0', borderRadius: 14, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 32, alignItems: 'center', marginBottom: 28 },
  successIcon:  { fontSize: 48, color: '#2d6a2d', fontWeight: '900', marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#1a3c1a', marginBottom: 8 },
  successSub:   { fontSize: 15, color: '#555', textAlign: 'center' },
});
