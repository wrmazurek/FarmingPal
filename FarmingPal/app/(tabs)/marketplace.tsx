import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';

const SECTIONS = [
  {
    icon: 'clipboard-list-outline',
    title: 'Job Board (Custom Farming)',
    desc: 'Browse open custom farming jobs in your region — or post a job and receive quotes from local operators.',
    cta: 'View Job Board',
    href: '/(tabs)/job-board',
    params: undefined as undefined,
    color: '#6B7A2A',
  },
  {
    icon: 'store-outline',
    title: 'Buy / Sell — Equipment & Land',
    desc: 'Buy and sell farming equipment, or find cultivated cropland, pasture, and mixed farm land listings across Canada and the USA.',
    cta: 'Browse Listings',
    href: '/(tabs)/buysell',
    params: undefined as undefined,
    color: '#c8931a',
  },
  {
    icon: 'account-hard-hat-outline',
    title: 'Farmhands (Employment Postings)',
    desc: 'Post or find seasonal and full-time farm employment opportunities across your region.',
    cta: 'Browse Postings',
    href: '/(tabs)/farmhands',
    params: undefined as undefined,
    color: '#7a5230',
  },
];

export default function MarketplaceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Marketplace</Text>
          <Text style={styles.heroSub}>
            Custom farming services, equipment, and land — all in one place, built for the agricultural community.
          </Text>
        </View>

        <View style={styles.sections}>
          {SECTIONS.map(s => (
            <TouchableOpacity
              key={s.title}
              style={styles.card}
              onPress={() => router.push({ pathname: s.href as any, params: s.params })}
              activeOpacity={0.85}
            >
              <View style={[styles.cardIconWrap, { backgroundColor: s.color }]}>
                <MaterialCommunityIcons name={s.icon as any} size={40} color="#fff" />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardDesc}>{s.desc}</Text>
                <Text style={[styles.cardCta, { color: s.color }]}>{s.cta} →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f4' },
  content:   { paddingBottom: 48 },

  hero:      { backgroundColor: '#2d6a2d', paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20, alignItems: 'center' },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 10 },
  heroSub:   { fontSize: 14, color: '#c8e6c8', textAlign: 'center', lineHeight: 22 },

  sections:  { padding: 16, gap: 14 },

  card:         { backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', alignItems: 'center', padding: 18, gap: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardIconWrap: { width: 68, height: 68, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardBody:     { flex: 1 },
  cardTitle:    { fontSize: 18, fontWeight: '800', color: '#1a3c1a', marginBottom: 5 },
  cardDesc:     { fontSize: 13, color: '#666', lineHeight: 20, marginBottom: 8 },
  cardCta:      { fontSize: 13, fontWeight: '700' },
});
