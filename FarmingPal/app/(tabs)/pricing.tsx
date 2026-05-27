import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@/context/UserContext';
import { REGIONS } from '@/constants/regions';
import { Country } from '@/types';
import AppHeader from '@/components/AppHeader';
import RegionPickerModal from '@/components/RegionPickerModal';

const CATEGORIES = [
  { label: 'Crop',       color: '#6B7A2A', icon: 'barley',       href: '/(tabs)/submit',       subtitle: 'Cash Price (Bid/Spot)\nCorn, Wheat, Canola & more' },
  { label: 'Fuel',       color: '#c8931a', icon: 'gas-station',  href: '/(tabs)/submit-fuel',  subtitle: 'Diesel, Gasoline, Propane' },
  { label: 'Fertilizer', color: '#7a5230', icon: 'sprout',       href: '/(tabs)/submit-fert',  subtitle: 'Urea, Potash, DAP & blends' },
  { label: 'Chemical',   color: '#b35e10', icon: 'spray-bottle', image: require('@/assets/images/Spayer-Greenv2.png'), href: '/(tabs)/submit-chem', subtitle: 'Herbicides, Fungicides & more' },
];

export default function PricingScreen() {
  const router = useRouter();
  const { profile, setCountry } = useUser();
  const [regionPickerVisible, setRegionPickerVisible] = useState(false);

  const country = profile?.country ?? 'CA';
  const regionName = REGIONS.find((r) => r.code === profile?.regionCode)?.name;
  const handleCountryToggle = async (selected: Country) => {
    if (selected === country) return;
    await setCountry(selected);
    setRegionPickerVisible(true);
  };

  return (
    <View style={styles.container}>
      <RegionPickerModal visible={regionPickerVisible} onClose={() => setRegionPickerVisible(false)} />
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Country toggle + region */}
        <View style={styles.hero}>
          <View style={styles.countryToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, country === 'CA' && styles.toggleBtnActive]}
              onPress={() => handleCountryToggle('CA')}
            >
              <Text style={[styles.toggleBtnText, country === 'CA' && styles.toggleBtnTextActive]}>
                Canada
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, country === 'US' && styles.toggleBtnActive]}
              onPress={() => handleCountryToggle('US')}
            >
              <Text style={[styles.toggleBtnText, country === 'US' && styles.toggleBtnTextActive]}>
                United States
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.regionBadge} onPress={() => setRegionPickerVisible(true)}>
            <Text style={styles.regionBadgeText}>
              📍 {regionName ?? (country === 'CA' ? 'Select Province ▾' : 'Select State ▾')}
              {regionName ? ' ▾' : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category picker */}
        <View style={styles.categorySection}>
          <Text style={styles.heading}>What are you pricing?</Text>
          <Text style={styles.sub}>Select a category to submit a price</Text>
          <View style={styles.grid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={[styles.card, { borderTopColor: cat.color, borderTopWidth: 4 }]}
                onPress={() => router.push(cat.href as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.cardIconWrap, { backgroundColor: cat.color + '18' }]}>
                  {'image' in cat
                    ? <Image source={(cat as any).image} style={{ width: 52, height: 52 }} resizeMode="contain" />
                    : <MaterialCommunityIcons name={cat.icon as any} size={42} color={cat.color} />
                  }
                </View>
                <Text style={[styles.cardLabel, { color: cat.color }]}>{cat.label}</Text>
                <Text style={styles.cardSub}>{cat.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f4f8f4' },
  content:             { paddingBottom: 40 },

  hero:                { backgroundColor: '#2d6a2d', alignItems: 'center', paddingTop: 20, paddingBottom: 24, paddingLeft: 12, paddingRight: 24 },

  countryToggle:       { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 24, padding: 4, marginBottom: 12 },
  toggleBtn:           { paddingVertical: 8, paddingHorizontal: 22, borderRadius: 20 },
  toggleBtnActive:     { backgroundColor: '#fff' },
  toggleBtnText:       { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  toggleBtnTextActive: { color: '#2d6a2d' },

  regionBadge:         { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 16 },
  regionBadgeText:     { color: '#fff', fontSize: 13, fontWeight: '600' },

  categorySection:     { paddingLeft: 12, paddingRight: 12, paddingTop: 24, paddingBottom: 8 },
  heading:             { fontSize: 22, fontWeight: '800', color: '#1a3c1a', marginBottom: 4 },
  sub:                 { fontSize: 14, color: '#777', marginBottom: 20 },
  grid:                { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card:                { backgroundColor: '#fff', borderRadius: 14, padding: 18, width: '47%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardIconWrap:        { width: 68, height: 68, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardIcon:            { marginBottom: 10 },
  cardLabel:           { fontSize: 17, fontWeight: '700', color: '#1a3c1a', marginBottom: 4, textAlign: 'center' },
  cardSub:             { fontSize: 12, color: '#888', textAlign: 'center', lineHeight: 17 },
});
