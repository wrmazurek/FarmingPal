import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '@/context/UserContext';
import { getDistrictsByRegion } from '@/constants/regions';
import { Country, District } from '@/types';
import OnboardingHeader from '@/components/OnboardingHeader';

export default function DistrictScreen() {
  const { country, regionCode } = useLocalSearchParams<{ country: Country; regionCode: string }>();
  const router = useRouter();
  const { updateRegion, completeOnboarding } = useUser();
  const districts = getDistrictsByRegion(regionCode ?? '');

  const handleSelect = async (district: District) => {
    await updateRegion(country ?? 'CA', regionCode ?? '', district.code);
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader />
      <Text style={styles.title}>Select your district</Text>
      <Text style={styles.subtitle}>This sets your default price view</Text>
      <FlatList
        data={districts}
        keyExtractor={(d) => d.code}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f4' },
  title:     { fontSize: 22, fontWeight: '800', color: '#1a3c1a', paddingHorizontal: 24, paddingTop: 28, marginBottom: 6 },
  subtitle:  { fontSize: 14, color: '#777', paddingHorizontal: 24, marginBottom: 16 },
  list:      { paddingHorizontal: 24, paddingBottom: 32 },
  option:    { padding: 18, borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', marginBottom: 12, backgroundColor: '#fff' },
  name:      { fontSize: 16, color: '#1a3c1a' },
});
