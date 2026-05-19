import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { MOCK_PRICES } from '@/data/mockPrices';
import { NON_WHEAT_CROPS, WHEAT_CROPS, getCropById } from '@/constants/crops';
import { DISTRICTS } from '@/constants/regions';
import { PriceSubmission } from '@/types';
import AppHeader from '@/components/AppHeader';

function AuthGate() {
  const router = useRouter();
  return (
    <View style={styles.gateContainer}>
      <Text style={styles.gateIcon}>🔍</Text>
      <Text style={styles.gateTitle}>Create a free account to search prices</Text>
      <Text style={styles.gateSub}>Search by crop and region across all of North America.</Text>
      <TouchableOpacity style={styles.gateButton} onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.gateButtonText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.gateLink}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatTimeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SearchScreen() {
  const { isAuthenticated } = useAuth();
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [wheatOpen, setWheatOpen] = useState(false);

  if (!isAuthenticated) return <AuthGate />;

  const isWheatSelected = selectedCropId?.startsWith('wheat-') ?? false;

  const results = MOCK_PRICES.filter((p) =>
    selectedCropId ? p.cropId === selectedCropId : true
  );

  const selectCrop = (id: string | null) => {
    setSelectedCropId(id);
    setWheatOpen(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader>
        {/* Primary crop chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <TouchableOpacity
            style={[styles.chip, !selectedCropId && styles.chipActive]}
            onPress={() => selectCrop(null)}
          >
            <Text style={[styles.chipText, !selectedCropId && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>

          {NON_WHEAT_CROPS.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={[styles.chip, selectedCropId === crop.id && styles.chipActive]}
              onPress={() => selectCrop(crop.id)}
            >
              <Text style={[styles.chipText, selectedCropId === crop.id && styles.chipTextActive]}>
                {crop.name}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Wheat dropdown trigger */}
          <TouchableOpacity
            style={[styles.chip, (isWheatSelected || wheatOpen) && styles.chipActive]}
            onPress={() => setWheatOpen(!wheatOpen)}
          >
            <Text style={[styles.chipText, (isWheatSelected || wheatOpen) && styles.chipTextActive]}>
              Wheat {wheatOpen ? '▲' : '▾'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Wheat variety sub-row */}
        {wheatOpen && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wheatRow}
          >
            {WHEAT_CROPS.map((crop) => (
              <TouchableOpacity
                key={crop.id}
                style={[styles.wheatChip, selectedCropId === crop.id && styles.wheatChipActive]}
                onPress={() => selectCrop(crop.id)}
              >
                <Text style={[styles.wheatChipText, selectedCropId === crop.id && styles.wheatChipTextActive]}>
                  {crop.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </AppHeader>

      <FlatList
        data={results}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: PriceSubmission }) => {
          const crop = getCropById(item.cropId);
          const district = DISTRICTS.find((d) => d.code === item.districtCode);
          return (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cropName}>{crop?.name}</Text>
                <Text style={styles.price}>{item.currency} ${item.price.toFixed(2)}/{crop?.unit}</Text>
              </View>
              <Text style={styles.elevator}>{item.elevatorName}</Text>
              <View style={styles.cardRow}>
                <Text style={styles.district}>{district?.name ?? item.districtCode}</Text>
                <Text style={styles.time}>{formatTimeAgo(item.submittedAt)}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No results found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f4f8f4' },

  chipRow:            { gap: 8, paddingVertical: 10 },
  chip:               { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)' },
  chipActive:         { backgroundColor: '#fff' },
  chipText:           { color: '#e0f0e0', fontSize: 13, fontWeight: '600' },
  chipTextActive:     { color: '#2d6a2d' },

  wheatRow:           { gap: 8, paddingBottom: 10 },
  wheatChip:          { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  wheatChipActive:    { backgroundColor: '#fff' },
  wheatChipText:      { color: '#e0f0e0', fontSize: 13, fontWeight: '600' },
  wheatChipTextActive:{ color: '#2d6a2d' },

  list:               { padding: 16 },
  card:               { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cropName:           { fontSize: 16, fontWeight: '700', color: '#1a3c1a' },
  price:              { fontSize: 17, fontWeight: '800', color: '#2d6a2d' },
  elevator:           { fontSize: 13, color: '#555', marginBottom: 8 },
  district:           { fontSize: 12, color: '#888' },
  time:               { fontSize: 12, color: '#aaa' },
  empty:              { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 15 },

  gateContainer:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#f4f8f4' },
  gateIcon:           { fontSize: 48, marginBottom: 16 },
  gateTitle:          { fontSize: 20, fontWeight: '700', color: '#1a3c1a', textAlign: 'center', marginBottom: 10 },
  gateSub:            { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 32 },
  gateButton:         { backgroundColor: '#2d6a2d', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 48, marginBottom: 16 },
  gateButtonText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  gateLink:           { color: '#2d6a2d', fontSize: 14 },
});
