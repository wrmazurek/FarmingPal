import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useUser } from '@/context/UserContext';

export default function FarmProfileScreen() {
  const router = useRouter();
  const { saveFarmDetails } = useUser();

  const [farmName, setFarmName]       = useState('');
  const [ruralAddress, setRuralAddress] = useState('');
  const [city, setCity]               = useState('');
  const [postalCode, setPostalCode]   = useState('');
  const [acres, setAcres]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [formError, setFormError]     = useState('');

  const handleSave = async () => {
    setFormError('');
    if (!farmName || !city || !postalCode) {
      setFormError('Please fill in Farm Name, City/Town, and Postal Code.');
      return;
    }
    setLoading(true);
    try {
      await saveFarmDetails({ farmName, ruralAddress, city, postalCode, acres });
      router.replace('/(tabs)/search');
    } catch {
      setFormError('Could not save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.title}>Your Farm Profile</Text>
        <Text style={styles.subtitle}>
          Help us personalise your FarmingPal experience. This information is kept private and used only to show you relevant local data.
        </Text>

        <Text style={styles.label}>Farm Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={farmName}
          onChangeText={setFarmName}
          placeholder="e.g. Sunrise Grain Farm"
        />

        <Text style={styles.sectionHeading}>Farm Location</Text>

        <Text style={styles.label}>Rural Address</Text>
        <TextInput
          style={styles.input}
          value={ruralAddress}
          onChangeText={setRuralAddress}
          placeholder="e.g. RR 2 Box 14, Hwy 16 W"
        />

        <Text style={styles.label}>City / Town <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Yorkton"
        />

        <Text style={styles.label}>Postal / ZIP Code <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={postalCode}
          onChangeText={setPostalCode}
          placeholder="e.g. S3N 2K4"
          autoCapitalize="characters"
        />

        <Text style={styles.label}># of Acres</Text>
        <TextInput
          style={styles.input}
          value={acres}
          onChangeText={setAcres}
          placeholder="e.g. 2400"
          keyboardType="number-pad"
        />

        {formError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save & Continue →'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)/search')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  content:        { paddingLeft: 12, paddingRight: 28, paddingTop: 12, paddingBottom: 48 },

  title:          { fontSize: 28, fontWeight: '800', color: '#1a3c1a', marginBottom: 8 },
  subtitle:       { fontSize: 14, color: '#666', lineHeight: 21, marginBottom: 32 },

  sectionHeading: { fontSize: 13, fontWeight: '700', color: '#2d6a2d', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12, marginTop: 8, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },

  label:          { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  required:       { color: '#c0392b' },
  input:          { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, fontSize: 16, marginBottom: 20 },

  button:         { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: '#fff', fontSize: 17, fontWeight: '700' },

  skipBtn:        { alignItems: 'center', paddingVertical: 8 },
  skipText:       { color: '#999', fontSize: 14 },

  errorBox:       { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginBottom: 8, marginTop: 4 },
  errorText:      { fontSize: 14, color: '#c0392b', fontWeight: '600', lineHeight: 20 },
});
