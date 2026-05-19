import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '@/components/AppHeader';

const SERVICES = [
  {
    icon: '🌾',
    title: 'Pricing Intelligence',
    desc: 'Real-time crowdsourced prices for crops, fuel, fertilizer, and chemicals — submitted by farmers, for farmers.',
    href: '/(tabs)/pricing',
    cta: 'View Prices',
  },
  {
    icon: '🚜',
    title: 'Custom Services',
    desc: 'Connect with custom farming operators offering seeding, spraying, harvesting, and more across your region.',
    href: '/(tabs)/services',
    cta: 'Explore Services',
  },
  {
    icon: '🤝',
    title: 'Buy / Sell',
    desc: 'List or find farmland, equipment, and supplies in a marketplace built specifically for agricultural communities.',
    href: '/(tabs)/buysell',
    cta: 'Browse Listings',
  },
] as const;

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Your Farm.{'\n'}Your Community.{'\n'}Your Data.</Text>
          <Text style={styles.heroSub}>
            FarmingPal is a crowdsourced intelligence platform empowering North American farmers with real-time pricing, services, and marketplace tools — built by the farming community, for the farming community.
          </Text>
          <TouchableOpacity style={styles.heroBtn} onPress={() => router.push('/getstarted')}>
            <Text style={styles.heroBtnText}>Get Started →</Text>
          </TouchableOpacity>
        </View>

        {/* Mission */}
        <View style={styles.missionCard}>
          <Text style={styles.missionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            Farmers deserve access to the same market intelligence that large agribusinesses have. FarmingPal puts that power in the hands of every grower — no subscription required. Submit prices anonymously, browse your region, and make better decisions at the bin, the fuel pump, and the co-op.
          </Text>
        </View>

        {/* Services */}
        <Text style={styles.sectionTitle}>What We Offer</Text>
        {SERVICES.map((s) => (
          <View key={s.title} style={styles.serviceCard}>
            <Text style={styles.serviceIcon}>{s.icon}</Text>
            <Text style={styles.serviceTitle}>{s.title}</Text>
            <Text style={styles.serviceDesc}>{s.desc}</Text>
            <TouchableOpacity style={styles.serviceBtn} onPress={() => router.push(s.href)}>
              <Text style={styles.serviceBtnText}>{s.cta} →</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* CTA */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Help Your Community</Text>
          <Text style={styles.ctaSub}>
            Every price you submit helps another farmer make a better decision. No account needed to contribute.
          </Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/(tabs)/pricing')}>
            <Text style={styles.ctaBtnText}>➕  Submit a Price</Text>
          </TouchableOpacity>
        </View>

        {/* Community stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Growing Every Day</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>🌎</Text>
              <Text style={styles.statLabel}>Canada & USA</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Crop Types</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>Free</Text>
              <Text style={styles.statLabel}>Always</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f4f8f4' },
  content:      { paddingBottom: 48 },

  hero:         { backgroundColor: '#2d6a2d', paddingTop: 28, paddingBottom: 32, paddingLeft: 12, paddingRight: 24, alignItems: 'center' },
  heroTitle:    { fontSize: 32, fontWeight: '900', color: '#fff', lineHeight: 40, marginBottom: 14, textAlign: 'center' },
  heroSub:      { fontSize: 16, color: '#c8e6c8', lineHeight: 24, marginBottom: 22, textAlign: 'center' },
  heroBtn:      { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28, alignSelf: 'center' },
  heroBtnText:  { color: '#2d6a2d', fontSize: 15, fontWeight: '800' },

  missionCard:  { marginLeft: 12, marginRight: 16, marginTop: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: 14, padding: 20, borderLeftWidth: 4, borderLeftColor: '#2d6a2d' },
  missionTitle: { fontSize: 16, fontWeight: '800', color: '#1a3c1a', marginBottom: 8 },
  missionText:  { fontSize: 14, color: '#555', lineHeight: 22 },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 8, marginBottom: 12, marginLeft: 12, marginRight: 16 },

  serviceCard:  { backgroundColor: '#fff', marginLeft: 12, marginRight: 16, marginBottom: 12, borderRadius: 14, padding: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  serviceIcon:  { fontSize: 36, marginBottom: 8 },
  serviceTitle: { fontSize: 18, fontWeight: '800', color: '#1a3c1a', marginBottom: 6 },
  serviceDesc:  { fontSize: 14, color: '#666', lineHeight: 21, marginBottom: 14 },
  serviceBtn:   { alignSelf: 'flex-start', backgroundColor: '#f0f8f0', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  serviceBtnText:{ fontSize: 13, fontWeight: '700', color: '#2d6a2d' },

  statsCard:    { marginLeft: 12, marginRight: 16, marginTop: 16, marginBottom: 16, backgroundColor: '#1e4d1e', borderRadius: 14, padding: 20 },
  statsTitle:   { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 16, textAlign: 'center' },
  statsRow:     { flexDirection: 'row', justifyContent: 'space-around' },
  stat:         { alignItems: 'center' },
  statValue:    { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel:    { fontSize: 11, color: '#a8d8a8', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },

  ctaCard:      { marginLeft: 12, marginRight: 16, marginTop: 16, marginBottom: 16, backgroundColor: '#000', borderRadius: 14, padding: 24 },
  ctaTitle:     { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 },
  ctaSub:       { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 21, marginBottom: 20 },
  ctaBtn:       { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  ctaBtnText:   { color: '#000', fontSize: 15, fontWeight: '800' },
});
