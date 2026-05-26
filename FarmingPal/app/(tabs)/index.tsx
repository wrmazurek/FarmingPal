import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';

const MARKETPLACE_FEATURES = [
  {
    icon: 'clipboard-list-outline',
    label: 'Custom Farming Job Board',
    desc: 'Post jobs or find operators for seeding, spraying, harvesting, and more.',
    href: '/(tabs)/job-board',
    color: '#2d6a2d',
  },
  {
    icon: 'store-outline',
    label: 'Buy / Sell — Equipment & Land',
    desc: 'List or find farming equipment, cropland, pasture, and mixed farm properties.',
    href: '/(tabs)/buysell',
    color: '#c8931a',
  },
  {
    icon: 'account-hard-hat-outline',
    label: 'Farmhands — Employment Postings',
    desc: 'Post or find seasonal and full-time farm employment across your region.',
    href: '/(tabs)/farmhands',
    color: '#7a5230',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>

        {/* CTA */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Report Current Pricing</Text>
          <Text style={styles.ctaSub}>
            Seen a price at your elevator, fuel pump, or co-op? Submit it anonymously in seconds — no account required. Help your community make smarter decisions.
          </Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/(tabs)/submit' as any)}>
            <Text style={styles.ctaBtnText}>Report a Price →</Text>
          </TouchableOpacity>
        </View>

        {/* Mission */}
        <View style={styles.missionSection}>
          <View style={styles.missionInner}>
            <View style={styles.missionLeft}>
              <Text style={styles.missionEyebrow}>Our Mission</Text>
              <Text style={styles.missionHeading}>Leveling the playing field</Text>
              <Text style={styles.missionBody}>
                Large agribusinesses have always had access to sophisticated market intelligence. Individual farmers haven't — until now. FarmingPal puts that same power in the hands of every grower, for free, no subscription required.
              </Text>
            </View>
            <View style={styles.missionQuote}>
              <Text style={styles.missionQuoteText}>
                "Built by the farming community,{'\n'}for the farming community."
              </Text>
            </View>
          </View>
        </View>

        {/* Green callout */}
        <View style={styles.submitSection}>
          <Text style={styles.submitBody}>
            Submit prices anonymously, connect with local operators, list your equipment, and find farm workers — when farmers share what they know, everyone wins.
          </Text>
          <TouchableOpacity style={styles.heroBtn} onPress={() => router.push('/getstarted')}>
            <Text style={styles.heroBtnText}>Get Started →</Text>
          </TouchableOpacity>
        </View>

        {/* What We Offer */}
        <Text style={styles.sectionTitle}>What We Offer</Text>

        {/* Pricing Intelligence */}
        <View style={styles.featureCard}>
          <View style={styles.featureCardHeader}>
            <View style={[styles.featureIconWrap, { backgroundColor: '#2d6a2d' }]}>
              <MaterialCommunityIcons name="cash-multiple" size={28} color="#fff" />
            </View>
            <View style={styles.featureCardMeta}>
              <Text style={styles.featureCardTitle}>Pricing Intelligence</Text>
              <Text style={styles.featureCardSub}>Crops · Fuel · Fertilizer · Chemicals</Text>
            </View>
          </View>
          <Text style={styles.featureCardDesc}>
            Real-time crowdsourced prices submitted by farmers across Canada and the USA. No account needed to contribute or browse.
          </Text>
          <TouchableOpacity style={styles.featureCardBtn} onPress={() => router.push('/(tabs)/pricing' as any)}>
            <Text style={styles.featureCardBtnText}>View Prices →</Text>
          </TouchableOpacity>
        </View>

        {/* Marketplace */}
        <View style={styles.featureCard}>
          <View style={styles.featureCardHeader}>
            <View style={[styles.featureIconWrap, { backgroundColor: '#c8931a' }]}>
              <MaterialCommunityIcons name="store-outline" size={28} color="#fff" />
            </View>
            <View style={styles.featureCardMeta}>
              <Text style={styles.featureCardTitle}>Marketplace</Text>
              <Text style={styles.featureCardSub}>Services · Equipment · Land · Employment</Text>
            </View>
          </View>
          <Text style={styles.featureCardDesc}>
            Everything you need to run and grow your operation — connect with custom farming operators, buy and sell equipment and land, and find or post farm employment.
          </Text>

          {/* Sub-features */}
          {MARKETPLACE_FEATURES.map(f => (
            <TouchableOpacity
              key={f.label}
              style={styles.subFeatureRow}
              onPress={() => router.push(f.href as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.subFeatureIcon, { backgroundColor: f.color + '18' }]}>
                <MaterialCommunityIcons name={f.icon as any} size={20} color={f.color} />
              </View>
              <View style={styles.subFeatureBody}>
                <Text style={[styles.subFeatureLabel, { color: f.color }]}>{f.label}</Text>
                <Text style={styles.subFeatureDesc}>{f.desc}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#ccc" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={[styles.featureCardBtn, { backgroundColor: '#fdf3e3' }]} onPress={() => router.push('/(tabs)/marketplace' as any)}>
            <Text style={[styles.featureCardBtnText, { color: '#c8931a' }]}>Explore Marketplace →</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Growing Every Day</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>🌎</Text>
              <Text style={styles.statLabel}>Canada & USA</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Price Categories</Text>
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

  ctaCard:      { marginHorizontal: 20, marginTop: 20, marginBottom: 4, backgroundColor: '#000', borderRadius: 14, padding: 28 },
  ctaTitle:     { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 10 },
  ctaSub:       { fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 23, marginBottom: 24 },
  ctaBtn:       { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  ctaBtnText:   { color: '#000', fontSize: 16, fontWeight: '800' },

  missionSection:   { backgroundColor: '#fff', paddingTop: 40, paddingBottom: 40, paddingHorizontal: 20 },
  missionInner:     { flexDirection: 'row', gap: 20, alignItems: 'stretch' },
  missionLeft:      { flex: 3 },
  missionEyebrow:   { fontSize: 13, fontWeight: '700', color: '#c8931a', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  missionHeading:   { fontSize: 26, fontWeight: '800', color: '#1a3c1a', lineHeight: 34, marginBottom: 16, letterSpacing: -0.5 },
  missionBody:      { fontSize: 15, color: '#5a5a5a', lineHeight: 26 },
  missionQuote:     { flex: 2, backgroundColor: '#c8931a', borderRadius: 14, padding: 22, justifyContent: 'center' },
  missionQuoteText: { fontSize: 15, fontWeight: '700', color: '#fff', lineHeight: 24, fontStyle: 'italic' },

  submitSection:  { backgroundColor: '#2d6a2d', paddingTop: 36, paddingBottom: 44, paddingHorizontal: 24, alignItems: 'center' },
  submitBody:     { fontSize: 17, color: 'rgba(255,255,255,0.85)', lineHeight: 30, marginBottom: 28, textAlign: 'center' },
  heroBtn:        { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  heroBtnText:    { color: '#2d6a2d', fontSize: 16, fontWeight: '800' },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#c8931a', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 28, marginBottom: 16, marginHorizontal: 20 },

  featureCard:       { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 16, borderRadius: 14, padding: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  featureCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  featureIconWrap:   { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureCardMeta:   { flex: 1 },
  featureCardTitle:  { fontSize: 18, fontWeight: '800', color: '#1a3c1a' },
  featureCardSub:    { fontSize: 12, color: '#999', marginTop: 2 },
  featureCardDesc:   { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 16 },
  featureCardBtn:    { alignSelf: 'flex-start', backgroundColor: '#f0f8f0', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 16, marginTop: 12 },
  featureCardBtnText:{ fontSize: 14, fontWeight: '700', color: '#2d6a2d' },

  subFeatureRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  subFeatureIcon:  { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  subFeatureBody:  { flex: 1 },
  subFeatureLabel: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  subFeatureDesc:  { fontSize: 12, color: '#888', lineHeight: 17 },

  statsCard:    { marginHorizontal: 20, marginTop: 8, marginBottom: 20, backgroundColor: '#1e4d1e', borderRadius: 14, padding: 24 },
  statsTitle:   { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 20, textAlign: 'center' },
  statsRow:     { flexDirection: 'row', justifyContent: 'space-around' },
  stat:         { alignItems: 'center' },
  statValue:    { fontSize: 24, fontWeight: '800', color: '#fff' },
  statLabel:    { fontSize: 12, color: '#a8d8a8', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
});
