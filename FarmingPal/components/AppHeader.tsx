import { usePathname, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { useJobBoard } from '@/context/JobBoardContext';

const LOGO = require('@/assets/images/FP Logo - Trasluscent Background.png');

const NAV_ITEMS = [
  { label: 'Prices',      icon: 'cash-multiple', href: '/(tabs)/pricing'      },
  { label: 'Marketplace', icon: 'store',         href: '/(tabs)/marketplace'  },
];

const MARKETPLACE_PATHS = [
  '/marketplace', '/services', '/service-booking', '/service-register',
  '/buysell', '/buysell-post', '/job-board', '/job-detail', '/job-thread', '/my-jobs', '/job-applicants',
];

interface Props {
  children?: React.ReactNode;
}

export default function AppHeader({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, signOut } = useAuth();
  const { profile } = useUser();
  const { getUnreadCount } = useJobBoard();
  const unread = isAuthenticated ? getUnreadCount(profile?.id ?? '') : 0;

  const isActive = (href: string) => {
    if (href === '/(tabs)/marketplace') {
      return MARKETPLACE_PATHS.some(p => pathname.includes(p));
    }
    return pathname.includes(href.replace('/(tabs)/', '/'));
  };

  const handleSignOut = () => {
    // Navigate immediately — don't await the server-side signout network call.
    // signOut() clears the local session; server token invalidation runs in background.
    signOut().catch(() => {});
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        {/* Logo */}
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.75} style={styles.logoBtn}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        {/* Nav items */}
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <TouchableOpacity
              key={item.href}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.href as any)}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={26}
                color={active ? '#fff' : 'rgba(255,255,255,0.75)'}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={item.wrap ? undefined : 1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Authenticated-only: Profile + Sign Out */}
        {isAuthenticated ? (
          <>
            <TouchableOpacity
              style={[styles.navItem, isActive('/(tabs)/profile') && styles.navItemActive]}
              onPress={() => router.push('/(tabs)/profile' as any)}
              activeOpacity={0.75}
            >
              <View style={styles.profileIconOuter}>
                <MaterialCommunityIcons
                  name="account-cowboy-hat"
                  size={26}
                  color={isActive('/(tabs)/profile') ? '#fff' : 'rgba(255,255,255,0.75)'}
                />
                {unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.navLabel, isActive('/(tabs)/profile') && styles.navLabelActive]}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.75}>
              <MaterialCommunityIcons name="logout" size={22} color="rgba(255,255,255,0.75)" />
              <Text style={styles.signOutLabel}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/(auth)/login' as any)} activeOpacity={0.75}>
            <MaterialCommunityIcons name="login" size={22} color="rgba(255,255,255,0.75)" />
            <Text style={styles.signInLabel}>Sign In</Text>
          </TouchableOpacity>
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
  profileIconOuter: { position: 'relative' },
  badge:            { position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#2d6a2d' },
  badgeText:        { fontSize: 10, fontWeight: '800', color: '#fff' },
  navLabel:      { fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: '600', flexShrink: 1 },
  navLabelActive:{ color: '#fff', fontWeight: '700' },

  signOutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)', marginLeft: 4, marginRight: 24 },
  signOutLabel:  { fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  signInBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)', marginLeft: 4, marginRight: 24 },
  signInLabel:   { fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
});
