import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

const LOGO = require('@/assets/images/IMG_4064 - Trasluscent Background.png');
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      router.replace('/(auth)/farm-profile');
    } catch {
      Alert.alert('Registration failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.75} style={styles.logoBtn}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>
        <View style={styles.form}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Free to join — search prices across North America</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} placeholder="••••••••" secureTextEntry />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
        </View>{/* end form */}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, paddingTop: 0, paddingLeft: 0, paddingRight: 28, paddingBottom: 28, backgroundColor: '#fff' },
  logoBtn:        { marginTop: 12, marginLeft: 12, marginBottom: 32 },
  form:           { paddingLeft: 12, paddingRight: 28 },
  logo:           { height: 100, width: 130 },
  title:          { fontSize: 30, fontWeight: '800', color: '#1a3c1a', marginBottom: 6 },
  subtitle:       { fontSize: 15, color: '#666', marginBottom: 36 },
  label:          { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:          { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, fontSize: 16, marginBottom: 20 },
  button:         { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: '#fff', fontSize: 17, fontWeight: '700' },
  link:           { color: '#2d6a2d', fontSize: 14, textAlign: 'center' },
});
