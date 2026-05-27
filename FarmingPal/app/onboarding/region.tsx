import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '@/context/UserContext';
import { getRegionsByCountry } from '@/constants/regions';
import { Country, Region } from '@/types';
import OnboardingHeader from '@/components/OnboardingHeader';

export default function RegionScreen() {
  const { country } = useLocalSearchParams<{ country: Country }>();
  const router = useRouter();
  const { updateRegion } = useUser();
  const regions = getRegionsByCountry(country ?? 'CA');

  const handleSelect = async (region: Region) => {
    await updateRegion(country ?? 'CA', region.code, '');
    router.push({ pathname: '/onboarding/district', params: { country, regionCode: region.code } });
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader />
      <Text style={styles.title}>
        Select your {country === 'US' ? 'state' : 'province'}
      </Text>
      <FlatList
        data={regions}
        keyExtractor={(r) => r.code}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f4' },
  title:     { fontSize: 22, fontWeight: '800', color: '#1a3c1a', paddingHorizontal: 24, paddingTop: 28, marginBottom: 16 },
  list:      { paddingHorizontal: 24, paddingBottom: 32 },
  option:    { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', marginBottom: 12, backgroundColor: '#fff' },
  code:      { fontSize: 14, fontWeight: '700', color: '#4a7c4a', width: 40 },
  name:      { fontSize: 16, color: '#1a3c1a' },
});
