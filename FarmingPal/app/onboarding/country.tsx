import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '@/context/UserContext';
import { Country } from '@/types';

const COUNTRIES: { code: Country; label: string; flag: string }[] = [
  { code: 'CA', label: 'Canada', flag: '🇨🇦' },
  { code: 'US', label: 'United States', flag: '🇺🇸' },
];

export default function CountryScreen() {
  const router = useRouter();
  const { updateRegion } = useUser();

  const handleSelect = async (country: Country) => {
    await updateRegion(country, '', '');
    router.push({ pathname: '/onboarding/region', params: { country } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FarmingPal</Text>
      <Text style={styles.subtitle}>Where are you farming?</Text>
      {COUNTRIES.map((c) => (
        <TouchableOpacity key={c.code} style={styles.option} onPress={() => handleSelect(c.code)}>
          <Text style={styles.flag}>{c.flag}</Text>
          <Text style={styles.label}>{c.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  title:      { fontSize: 28, fontWeight: '700', marginBottom: 8, color: '#1a3c1a' },
  subtitle:   { fontSize: 16, color: '#555', marginBottom: 48 },
  option:     { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 20, borderRadius: 12, borderWidth: 1.5, borderColor: '#d0e8d0', marginBottom: 16, backgroundColor: '#f6fbf6' },
  flag:       { fontSize: 32, marginRight: 16 },
  label:      { fontSize: 18, fontWeight: '600', color: '#1a3c1a' },
});
