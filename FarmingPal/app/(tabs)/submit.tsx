import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useUser } from '@/context/UserContext';
import AppHeader from '@/components/AppHeader';
import { NON_WHEAT_CROPS, WHEAT_CROPS } from '@/constants/crops';
import { DISTRICTS, getDistrictsByRegion } from '@/constants/regions';
import { Crop, PriceSubmission } from '@/types';

export default function SubmitScreen() {
  const { profile } = useUser();

  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [wheatOpen, setWheatOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [elevatorName, setElevatorName] = useState('');
  const [districtCode, setDistrictCode] = useState(profile?.districtCode ?? '');

  const districts = profile?.regionCode ? getDistrictsByRegion(profile.regionCode) : [];
  const currency = profile?.country === 'US' ? 'USD' : 'CAD';

  const handleSubmit = () => {
    if (!selectedCrop || !price || !elevatorName || !districtCode) {
      Alert.alert('Missing fields', 'Please fill in all fields before submitting.');
      return;
    }
    const submission: PriceSubmission = {
      id: Date.now().toString(),
      cropId: selectedCrop.id,
      price: parseFloat(price),
      currency,
      elevatorName,
      districtCode,
      regionCode: profile?.regionCode ?? '',
      country: profile?.country ?? 'CA',
      submittedAt: new Date().toISOString(),
    };
    // TODO: persist to backend when ready
    console.log('Submitted:', submission);
    Alert.alert('Thank you!', 'Your price has been submitted.');
    setSelectedCrop(null);
    setPrice('');
    setElevatorName('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.pageTitle}>Crop Price Reporting</Text>

        <Text style={styles.label}>Crop</Text>

        {/* Primary crop chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {NON_WHEAT_CROPS.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={[styles.cropChip, selectedCrop?.id === crop.id && styles.cropChipSelected]}
              onPress={() => { setSelectedCrop(crop); setWheatOpen(false); }}
            >
              <Text style={[styles.cropChipText, selectedCrop?.id === crop.id && styles.cropChipTextSelected]}>
                {crop.name}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Wheat dropdown trigger */}
          <TouchableOpacity
            style={[styles.cropChip, (selectedCrop?.id.startsWith('wheat-') || wheatOpen) && styles.cropChipSelected]}
            onPress={() => setWheatOpen(!wheatOpen)}
          >
            <Text style={[styles.cropChipText, (selectedCrop?.id.startsWith('wheat-') || wheatOpen) && styles.cropChipTextSelected]}>
              Wheat {wheatOpen ? '▲' : '▾'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Wheat variety sub-row */}
        {wheatOpen && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wheatRow}>
            {WHEAT_CROPS.map((crop) => (
              <TouchableOpacity
                key={crop.id}
                style={[styles.cropChip, styles.wheatChip, selectedCrop?.id === crop.id && styles.cropChipSelected]}
                onPress={() => { setSelectedCrop(crop); setWheatOpen(false); }}
              >
                <Text style={[styles.cropChipText, selectedCrop?.id === crop.id && styles.cropChipTextSelected]}>
                  {crop.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={styles.label}>
          Price ({currency}/{selectedCrop?.unit ?? 'unit'})
        </Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="e.g. 8.45"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Elevator / Buyer Name</Text>
        <TextInput
          style={styles.input}
          value={elevatorName}
          onChangeText={setElevatorName}
          placeholder="e.g. Richardson Pioneer"
        />

        <Text style={styles.label}>District</Text>
        <View style={styles.cropGrid}>
          {districts.map((d) => (
            <TouchableOpacity
              key={d.code}
              style={[styles.cropChip, districtCode === d.code && styles.cropChipSelected]}
              onPress={() => setDistrictCode(d.code)}
            >
              <Text style={[styles.cropChipText, districtCode === d.code && styles.cropChipTextSelected]}>
                {d.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Price</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f4f8f4' },
  content:             { paddingLeft: 12, paddingRight: 24, paddingTop: 24, paddingBottom: 24 },
  pageTitle:           { fontSize: 26, fontWeight: '800', color: '#1a3c1a', marginBottom: 24 },
  label:               { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:               { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, fontSize: 16, marginBottom: 20 },
  chipRow:             { gap: 8, paddingBottom: 12 },
  wheatRow:            { gap: 8, paddingBottom: 16 },
  cropChip:            { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#d0e8d0', backgroundColor: '#fff' },
  wheatChip:           { borderColor: '#b8dbb8' },
  cropChipSelected:    { backgroundColor: '#2d6a2d', borderColor: '#2d6a2d' },
  cropChipText:        { fontSize: 13, color: '#2d6a2d', fontWeight: '600' },
  cropChipTextSelected:{ color: '#fff' },
  submitButton:        { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
  submitButtonText:    { color: '#fff', fontSize: 17, fontWeight: '700' },
});
