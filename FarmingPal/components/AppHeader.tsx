import { usePathname, useRouter } from 'expo-router';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

const LOGO = require('@/assets/images/IMG_4064 - Trasluscent Background.png');

const GUEST_NAV_ITEMS = [
  { label: 'Report Pricing',  icon: '🌾', href: '/(tabs)/pricing',  wrap: true },
  { label: 'Search Prices',   icon: '🔍', href: '/(tabs)/search',   wrap: true },
  { label: 'Custom Services', icon: '🚜', href: '/(tabs)/services', wrap: true },
];

const AUTH_NAV_ITEMS: { label: string; icon: string; href: string; wrap: boolean }[] = [];

interface Props {
  children?: React.ReactNode;
}

export default function AppHeader({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, signOut } = useAuth();

  const isActive = (href: string) =>
    pathname.includes(href.replace('/(tabs)/', '/'));

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const navItems = isAuthenticated ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS;

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        {/* Logo */}
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.75} style={styles.logoBtn}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        {/* Nav items */}
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <TouchableOpacity
              key={item.href}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.href as any)}
              activeOpacity={0.75}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={item.wrap ? undefined : 1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Authenticated-only: Profile + Sign Out */}
        {isAuthenticated && (
          <>
            <TouchableOpacity
              style={[styles.navItem, isActive('/(tabs)/profile') && styles.navItemActive]}
              onPress={() => router.push('/(tabs)/profile' as any)}
              activeOpacity={0.75}
            >
              <Text style={styles.navIcon}>👤</Text>
              <Text style={[styles.navLabel, isActive('/(tabs)/profile') && styles.navLabelActive]}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.75}>
              <Text style={styles.navIcon}>🚪</Text>
              <Text style={styles.signOutLabel}>Sign Out</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header:        { backgroundColor: '#2d6a2d', paddingTop: 26, paddingBottom: 6, paddingLeft: 0, paddingRight: 4 },
  row:           { flexDirection: 'row', alignItems: 'center' },

  logoBtn:       { marginLeft: 12, marginRight: 4 },
  logo:          { height: 100, width: 130 },

  navItem:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 2, paddingHorizontal: 2, borderRadius: 8 },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.18)' },
  navIcon:       { fontSize: 36 },
  navLabel:      { fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: '600', flexShrink: 1 },
  navLabelActive:{ color: '#fff', fontWeight: '700' },

  signOutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)', marginLeft: 4 },
  signOutLabel:  { fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
});
