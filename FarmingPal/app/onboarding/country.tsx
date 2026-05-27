import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '@/context/UserContext';
import { Country } from '@/types';
import OnboardingHeader from '@/components/OnboardingHeader';

const COUNTRIES: { code: Country; label: string; flag: string }[] = [
  { code: 'CA', label: 'Canada',        flag: '🇨🇦' },
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
      <OnboardingHeader />
      <View style={styles.body}>
        <Text style={styles.title}>Where are you farming?</Text>
        <Text style={styles.subtitle}>Select your country to get started</Text>
        {COUNTRIES.map((c) => (
          <TouchableOpacity key={c.code} style={styles.option} onPress={() => handleSelect(c.code)}>
            <Text style={styles.flag}>{c.flag}</Text>
            <Text style={styles.label}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f4' },
  body:      { flex: 1, padding: 32, paddingTop: 48 },
  title:     { fontSize: 26, fontWeight: '800', marginBottom: 8, color: '#1a3c1a' },
  subtitle:  { fontSize: 15, color: '#666', marginBottom: 40 },
  option:    { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 20, borderRadius: 12, borderWidth: 1.5, borderColor: '#d0e8d0', marginBottom: 16, backgroundColor: '#fff' },
  flag:      { fontSize: 32, marginRight: 16 },
  label:     { fontSize: 18, fontWeight: '600', color: '#1a3c1a' },
});
