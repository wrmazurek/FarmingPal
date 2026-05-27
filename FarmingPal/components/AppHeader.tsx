import { useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { useJobBoard } from '@/context/JobBoardContext';

const LOGO = require('@/assets/images/FP Logo - Trasluscent Background.png');

const NAV_ITEMS_GUEST = [
  { label: 'Report Prices', icon: 'cash-multiple', href: '/(tabs)/pricing'     },
  { label: 'Marketplace',   icon: 'store',         href: '/(tabs)/marketplace' },
];

const NAV_ITEMS_AUTH = [
  { label: 'Prices',      icon: 'cash-multiple', href: '/(tabs)/pricing'     },
  { label: 'Marketplace', icon: 'store',         href: '/(tabs)/marketplace' },
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
  const { width } = useWindowDimensions();
  const unread = isAuthenticated ? getUnreadCount(profile?.id ?? '') : 0;
  const NAV_ITEMS = isAuthenticated ? NAV_ITEMS_AUTH : NAV_ITEMS_GUEST;
  const isDesktop = width >= 768;

  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/(tabs)/marketplace') {
      return MARKETPLACE_PATHS.some(p => pathname.includes(p));
    }
    return pathname.includes(href.replace('/(tabs)/', '/'));
  };

  const handleSignOut = () => {
    signOut().catch(() => {});
    router.replace('/(auth)/login');
  };

  const handleNavPress = (href: string) => {
    setMenuOpen(false);
    router.push(href as any);
  };

  return (
    <View style={styles.header}>
      <View style={[styles.row, isDesktop && styles.rowDesktop]}>
        {/* Logo */}
        <TouchableOpacity
          onPress={() => { setMenuOpen(false); router.replace('/(tabs)'); }}
          activeOpacity={0.75}
          style={styles.logoBtn}
        >
          <Image source={LOGO} style={[styles.logo, isDesktop && styles.logoDesktop]} resizeMode="contain" />
        </TouchableOpacity>

        {isDesktop ? (
          /* ── Desktop / tablet: inline nav ── */
          <>
            <View style={styles.desktopNav}>
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <TouchableOpacity
                    key={item.href}
                    style={[styles.desktopNavItem, active && styles.desktopNavItemActive]}
                    onPress={() => router.push(item.href as any)}
                    activeOpacity={0.75}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={22}
                      color={active ? '#fff' : 'rgba(255,255,255,0.75)'}
                    />
                    <Text style={[styles.desktopNavLabel, active && styles.desktopNavLabelActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.desktopRight}>
              {isAuthenticated ? (
                <>
                  <TouchableOpacity
                    style={[styles.desktopNavItem, isActive('/(tabs)/profile') && styles.desktopNavItemActive]}
                    onPress={() => router.push('/(tabs)/profile' as any)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.profileIconOuter}>
                      <MaterialCommunityIcons
                        name="account-cowboy-hat"
                        size={22}
                        color={isActive('/(tabs)/profile') ? '#fff' : 'rgba(255,255,255,0.75)'}
                      />
                      {unread > 0 && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.desktopNavLabel, isActive('/(tabs)/profile') && styles.desktopNavLabelActive]}>
                      Profile
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.desktopAuthBtn} onPress={handleSignOut} activeOpacity={0.75}>
                    <MaterialCommunityIcons name="logout" size={18} color="rgba(255,255,255,0.75)" />
                    <Text style={styles.desktopAuthLabel}>Sign Out</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.desktopAuthBtn}
                  onPress={() => router.push('/(auth)/login' as any)}
                  activeOpacity={0.75}
                >
                  <MaterialCommunityIcons name="login" size={18} color="rgba(255,255,255,0.75)" />
                  <Text style={styles.desktopAuthLabel}>Sign In</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          /* ── Mobile: hamburger ── */
          <>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={styles.burgerBtn}
              onPress={() => setMenuOpen(o => !o)}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons
                name={menuOpen ? 'close' : 'menu'}
                size={28}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Mobile dropdown menu */}
      {!isDesktop && menuOpen && (
        <View style={styles.menu}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <TouchableOpacity
                key={item.href}
                style={[styles.menuItem, active && styles.menuItemActive]}
                onPress={() => handleNavPress(item.href)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={22}
                  color={active ? '#fff' : 'rgba(255,255,255,0.8)'}
                />
                <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {isAuthenticated ? (
            <>
              <TouchableOpacity
                style={[styles.menuItem, isActive('/(tabs)/profile') && styles.menuItemActive]}
                onPress={() => handleNavPress('/(tabs)/profile')}
                activeOpacity={0.75}
              >
                <View style={styles.profileIconOuter}>
                  <MaterialCommunityIcons
                    name="account-cowboy-hat"
                    size={22}
                    color={isActive('/(tabs)/profile') ? '#fff' : 'rgba(255,255,255,0.8)'}
                  />
                  {unread > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.menuLabel, isActive('/(tabs)/profile') && styles.menuLabelActive]}>
                  Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemSignOut]}
                onPress={() => { setMenuOpen(false); handleSignOut(); }}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons name="logout" size={22} color="rgba(255,255,255,0.75)" />
                <Text style={styles.menuLabel}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavPress('/(auth)/login')}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons name="login" size={22} color="rgba(255,255,255,0.75)" />
              <Text style={styles.menuLabel}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header:     { backgroundColor: '#2d6a2d', paddingTop: 26, paddingBottom: 6, paddingLeft: 0, paddingRight: 4 },
  row:        { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  rowDesktop: { maxWidth: 1140, width: '100%', alignSelf: 'center', paddingRight: 16 },

  logoBtn:       { marginLeft: 12, marginRight: 4 },
  logo:          { height: 44, width: 80 },
  logoDesktop:   { height: 64, width: 116 },

  /* Desktop nav */
  desktopNav:          { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 16 },
  desktopNavItem:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  desktopNavItemActive:{ backgroundColor: 'rgba(255,255,255,0.18)' },
  desktopNavLabel:     { fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  desktopNavLabelActive:{ color: '#fff', fontWeight: '700' },
  desktopRight:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  desktopAuthBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  desktopAuthLabel:    { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

  /* Mobile hamburger */
  burgerBtn:  { padding: 8, marginRight: 8 },

  /* Mobile dropdown */
  menu:             { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingVertical: 4, paddingHorizontal: 8 },
  menuItem:         { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  menuItemActive:   { backgroundColor: 'rgba(255,255,255,0.18)' },
  menuItemSignOut:  { marginTop: 4, borderBottomWidth: 0 },
  menuLabel:        { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  menuLabelActive:  { color: '#fff', fontWeight: '700' },

  profileIconOuter: { position: 'relative' },
  badge:            { position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#2d6a2d' },
  badgeText:        { fontSize: 10, fontWeight: '800', color: '#fff' },
});
