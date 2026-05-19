import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '@/context/UserContext';
import { getRegionsByCountry } from '@/constants/regions';
import { Country, Region } from '@/types';

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
      <Text style={styles.title}>Select your province{country === 'US' ? ' / state' : ''}</Text>
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
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 64 },
  title:     { fontSize: 22, fontWeight: '700', color: '#1a3c1a', paddingHorizontal: 24, marginBottom: 24 },
  list:      { paddingHorizontal: 24 },
  option:    { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', marginBottom: 12, backgroundColor: '#f6fbf6' },
  code:      { fontSize: 14, fontWeight: '700', color: '#4a7c4a', width: 40 },
  name:      { fontSize: 16, color: '#1a3c1a' },
});
