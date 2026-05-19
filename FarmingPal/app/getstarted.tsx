import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LOGO = require('@/assets/images/IMG_4064 - Trasluscent Background.png');

const STEPS = [
  {
    step: '1',
    icon: '📍',
    title: 'Set Your Location',
    desc: 'Choose your country, province or state, and district so we show you prices relevant to your area.',
  },
  {
    step: '2',
    icon: '🌾',
    title: 'Browse Real-Time Prices',
    desc: 'View crowdsourced crop, fuel, fertilizer, and chemical prices submitted by farmers in your region.',
  },
  {
    step: '3',
    icon: '➕',
    title: 'Submit a Price',
    desc: 'Spotted a price at your local elevator or co-op? Submit it in seconds — no account required.',
  },
  {
    step: '4',
    icon: '🔍',
    title: 'Search Across North America',
    desc: 'Create a free account to search and compare prices across all regions in Canada and the USA.',
  },
  {
    step: '5',
    icon: '🤝',
    title: 'Connect & Transact',
    desc: 'Find custom farming services, buy equipment, or list your own — all in one place built for farmers.',
  },
];

export default function GetStartedScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.hero}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.75} style={styles.logoBtn}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>How FarmingPal Works</Text>
          <Text style={styles.heroSub}>
            Built by farmers, for farmers. Here's everything you can do with FarmingPal — for free.
          </Text>
        </View>

        {/* Steps */}
        {STEPS.map((s) => (
          <View key={s.step} style={styles.stepCard}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{s.step}</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepIcon}>{s.icon}</Text>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
            </View>
          </View>
        ))}

        {/* Value prop */}
        <View style={styles.valueCard}>
          <Text style={styles.valueTitle}>Always Free. Always Farmer-First.</Text>
          <Text style={styles.valueText}>
            FarmingPal is a community-powered platform. Your submissions help thousands of farmers across North America make smarter purchasing and selling decisions. No subscription, no paywall — ever.
          </Text>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to get started?</Text>
          <Text style={styles.ctaSub}>Create your free account and unlock full access in under a minute.</Text>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerBtnText}>Create Free Account →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLinkText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f4f8f4' },
  content:        { paddingBottom: 48 },

  hero:           { backgroundColor: '#2d6a2d', paddingTop: 0, paddingBottom: 32, paddingLeft: 12, paddingRight: 24 },
  logoBtn:        { marginTop: 12, marginBottom: 16 },
  logo:           { height: 100, width: 130 },
  heroTitle:      { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 10, marginLeft: 12 },
  heroSub:        { fontSize: 14, color: '#c8e6c8', lineHeight: 22, marginLeft: 12 },

  stepCard:       { flexDirection: 'row', backgroundColor: '#fff', marginLeft: 12, marginRight: 16, marginTop: 12, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  stepBadge:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2d6a2d', alignItems: 'center', justifyContent: 'center', marginRight: 14, marginTop: 2, flexShrink: 0 },
  stepNumber:     { color: '#fff', fontWeight: '800', fontSize: 14 },
  stepBody:       { flex: 1 },
  stepIcon:       { fontSize: 22, marginBottom: 4 },
  stepTitle:      { fontSize: 16, fontWeight: '700', color: '#1a3c1a', marginBottom: 4 },
  stepDesc:       { fontSize: 13, color: '#666', lineHeight: 20 },

  valueCard:      { marginLeft: 12, marginRight: 16, marginTop: 20, marginBottom: 16, backgroundColor: '#1e4d1e', borderRadius: 14, padding: 20 },
  valueTitle:     { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 8 },
  valueText:      { fontSize: 13, color: '#a8d8a8', lineHeight: 21 },

  ctaSection:     { marginLeft: 12, marginRight: 16, marginTop: 8 },
  ctaTitle:       { fontSize: 22, fontWeight: '800', color: '#1a3c1a', marginBottom: 6 },
  ctaSub:         { fontSize: 14, color: '#666', lineHeight: 21, marginBottom: 20 },
  registerBtn:    { backgroundColor: '#2d6a2d', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 14 },
  registerBtnText:{ color: '#fff', fontSize: 16, fontWeight: '800' },
  loginLink:      { alignItems: 'center' },
  loginLinkText:  { color: '#2d6a2d', fontSize: 14, fontWeight: '600' },
});
