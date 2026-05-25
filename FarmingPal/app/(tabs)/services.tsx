import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { SERVICE_TYPES } from '@/constants/services';

const OPERATOR_STEPS = [
  { step: '1', title: 'Register Your Business', desc: 'Create an operator profile with your business name, service area, and years of experience.' },
  { step: '2', title: 'List Your Equipment',    desc: 'Add each piece of equipment — make, model, year, and working width. Specify availability windows.' },
  { step: '3', title: 'Set Your Rates',         desc: 'Set per-acre rates, hourly rates, or custom quotes. List operator labour separately or included.' },
  { step: '4', title: 'Accept Job Requests',    desc: 'Receive job requests from farmers in your area. Accept, decline, or send a custom quote.' },
];

const CUSTOMER_STEPS = [
  { step: '1', title: 'Post a Job',       desc: 'Describe the work needed — service type, estimated acres, field location, and preferred timing.' },
  { step: '2', title: 'Select Services',  desc: 'Choose one or more services: tilling, spraying, swathing, combining, trucking, seeding, and more.' },
  { step: '3', title: 'Receive Quotes',   desc: 'Operators in your region respond with availability and rates. Compare quotes side by side.' },
  { step: '4', title: 'Hire & Confirm',   desc: 'Select your operator, confirm timing, and coordinate directly. Payment is handled between parties.' },
];

export default function ServicesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'book' | 'register'>('book');

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Custom Farming Services</Text>
          <Text style={styles.heroSub}>
            Connect farmers who need custom work done with operators who have the equipment to do it — across Canada and the USA.
          </Text>
        </View>

        {/* Action cards */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionCard, activeTab === 'book' ? styles.actionCardPrimary : styles.actionCardInactive]}
            onPress={() => setActiveTab('book')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={38}
              color={activeTab === 'book' ? '#fff' : '#2d6a2d'}
              style={styles.actionCardIcon}
            />
            <Text style={[styles.actionCardTitle, activeTab !== 'book' && styles.actionCardTitleDark]}>Book Services</Text>
            <Text style={[styles.actionCardSub,   activeTab !== 'book' && styles.actionCardSubDark]}>Post a job and get quotes from local operators</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, activeTab === 'register' ? styles.actionCardPrimary : styles.actionCardInactive]}
            onPress={() => setActiveTab('register')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="tractor"
              size={38}
              color={activeTab === 'register' ? '#fff' : '#2d6a2d'}
              style={styles.actionCardIcon}
            />
            <Text style={[styles.actionCardTitle, activeTab !== 'register' && styles.actionCardTitleDark]}>Register as Operator</Text>
            <Text style={[styles.actionCardSub,   activeTab !== 'register' && styles.actionCardSubDark]}>List your equipment and find work in your area</Text>
          </TouchableOpacity>
        </View>

        {/* Services available */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Services Available</Text>
          <View style={styles.serviceGrid}>
            {SERVICE_TYPES.map(s => (
              <View key={s.label} style={styles.serviceChip}>
                <View style={styles.serviceChipIconWrap}>
                  <Image source={s.icon} style={[styles.serviceChipIcon, s.iconSize ? { width: s.iconSize, height: s.iconSize } : null]} resizeMode="contain" />
                </View>
                <Text style={styles.serviceChipLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How it works — conditional on active tab */}
        {activeTab === 'book' ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How It Works — Booking a Job</Text>
            {CUSTOMER_STEPS.map(s => (
              <View key={s.step} style={styles.stepCard}>
                <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>{s.step}</Text></View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
            <View style={styles.ctaRow}>
              <TouchableOpacity style={[styles.sectionCta, styles.sectionCtaHalf]} onPress={() => router.push('/(tabs)/service-booking' as any)}>
                <Text style={styles.sectionCtaText}>Post a Job →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sectionCta, styles.sectionCtaHalf]} onPress={() => router.push('/(tabs)/job-board' as any)}>
                <Text style={styles.sectionCtaText}>Job Board →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How It Works — Registering as Operator</Text>
            {OPERATOR_STEPS.map(s => (
              <View key={s.step} style={styles.stepCard}>
                <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>{s.step}</Text></View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.sectionCta} onPress={() => router.push('/(tabs)/service-register' as any)}>
              <Text style={styles.sectionCtaText}>Register as Operator →</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:              { flex: 1, backgroundColor: '#f4f8f4' },
  content:                { paddingBottom: 48 },

  hero:                   { backgroundColor: '#2d6a2d', paddingTop: 24, paddingBottom: 28, paddingHorizontal: 16, alignItems: 'center' },
  heroTitle:              { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 10 },
  heroSub:                { fontSize: 14, color: '#c8e6c8', textAlign: 'center', lineHeight: 22 },

  actionRow:              { flexDirection: 'row', gap: 12, margin: 16 },
  actionCard:             { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  actionCardPrimary:      { backgroundColor: '#c8931a' },
  actionCardInactive:     { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#d0e8d0' },
  actionCardIcon:         { marginBottom: 8 },
  actionCardTitle:        { fontSize: 15, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 6 },
  actionCardTitleDark:    { color: '#1a3c1a' },
  actionCardSub:          { fontSize: 12, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 18 },
  actionCardSubDark:      { color: '#888' },

  section:                { marginHorizontal: 16, marginBottom: 8 },
  sectionLabel:           { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },

  serviceGrid:            { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  serviceChip:            { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#d0e8d0', minWidth: '22%', flexGrow: 1 },
  serviceChipIconWrap:    { width: 83, height: 83, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  serviceChipIcon:        { width: 52, height: 52 },
  serviceChipLabel:       { fontSize: 14, fontWeight: '700', color: '#c8931a', textAlign: 'center' },

  stepCard:               { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  stepBadge:              { width: 30, height: 30, borderRadius: 15, backgroundColor: '#2d6a2d', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepBadgeText:          { color: '#fff', fontWeight: '800', fontSize: 13 },
  stepBody:               { flex: 1 },
  stepTitle:              { fontSize: 14, fontWeight: '700', color: '#1a3c1a', marginBottom: 3 },
  stepDesc:               { fontSize: 13, color: '#666', lineHeight: 19 },

  ctaRow:                 { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 16 },
  sectionCta:             { backgroundColor: '#f0f8f0', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  sectionCtaHalf:         { flex: 1, marginTop: 0, marginBottom: 0 },
  sectionCtaText:         { fontSize: 14, fontWeight: '700', color: '#2d6a2d' },
});
