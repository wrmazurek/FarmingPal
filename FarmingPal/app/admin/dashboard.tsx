import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useJobBoard } from '@/context/JobBoardContext';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StatCard {
  label: string;
  value: string | number;
  icon: MCIName;
  color: string;
}

interface NavTile {
  label: string;
  desc: string;
  icon: MCIName;
  href: string;
  available: boolean;
}

const NAV_TILES: NavTile[] = [
  { label: 'Job Postings',    desc: 'View, edit, and moderate all job listings',          icon: 'briefcase-outline',        href: '/admin/jobs',        available: true },
  { label: 'Quotes',          desc: 'All submitted operator quotes across jobs',           icon: 'file-document-outline',    href: '/admin/quotes',      available: true },
  { label: 'Users',           desc: 'Farmer and operator accounts',                        icon: 'account-group-outline',    href: '/admin/users',       available: true },
  { label: 'Price Reports',   desc: 'Crowdsourced crop, fuel, fertilizer submissions',     icon: 'cash-multiple',            href: '/admin/submissions', available: true },
  { label: 'Operators',       desc: 'Registered custom work operators and equipment',      icon: 'tractor',                  href: '/admin/operators',   available: true },
  { label: 'Messages',        desc: 'Job board thread activity',                           icon: 'message-text-outline',     href: '/admin/messages',    available: true },
  { label: 'Buy / Sell',      desc: 'Equipment and land listings from all users',          icon: 'tag-outline',              href: '/admin/listings',    available: true },
  { label: 'Bookings',        desc: 'Service booking requests submitted by farmers',        icon: 'calendar-clock',           href: '/admin/bookings',    available: true },
];

export default function AdminDashboardScreen() {
  const router  = useRouter();
  const { adminSignOut } = useAdminAuth();
  const { jobs, quotes, threads } = useJobBoard();

  const [userCount,      setUserCount]      = useState<number | '…'>('…');
  const [priceCount,     setPriceCount]     = useState<number | '…'>('…');
  const [equipCount,     setEquipCount]     = useState<number | '…'>('…');
  const [landCount,      setLandCount]      = useState<number | '…'>('…');
  const [bookingCount,   setBookingCount]   = useState<number | '…'>('…');

  useEffect(() => {
    const counts = [
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('price_submissions').select('*', { count: 'exact', head: true }),
      supabase.from('equipment_listings').select('*', { count: 'exact', head: true }),
      supabase.from('land_listings').select('*', { count: 'exact', head: true }),
      supabase.from('service_bookings').select('*', { count: 'exact', head: true }),
    ];
    Promise.all(counts).then(([u, p, e, l, b]) => {
      setUserCount(u.count ?? 0);
      setPriceCount(p.count ?? 0);
      setEquipCount(e.count ?? 0);
      setLandCount(l.count ?? 0);
      setBookingCount(b.count ?? 0);
    });
  }, []);

  const totalJobs     = jobs.length;
  const openJobs      = jobs.filter(j => j.status === 'open').length;
  const filledJobs    = jobs.filter(j => j.status === 'filled').length;
  const totalQuotes   = quotes.length;
  const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
  const totalThreads  = threads.length;

  const STATS: StatCard[] = [
    { label: 'Users',            value: userCount,     icon: 'account-group-outline',  color: '#3b82f6' },
    { label: 'Price Reports',    value: priceCount,    icon: 'cash-multiple',          color: '#22c55e' },
    { label: 'Equipment Listed', value: equipCount,    icon: 'tractor',                color: '#c8931a' },
    { label: 'Land Listed',      value: landCount,     icon: 'barn',                   color: '#a855f7' },
    { label: 'Bookings',         value: bookingCount,  icon: 'calendar-clock',         color: '#0ea5e9' },
    { label: 'Open Jobs',        value: openJobs,      icon: 'briefcase-outline',      color: '#06b6d4' },
    { label: 'Filled Jobs',      value: filledJobs,    icon: 'check-circle-outline',   color: '#10b981' },
    { label: 'Quotes',           value: totalQuotes,   icon: 'file-document-outline',  color: '#f59e0b' },
    { label: 'Pending Quotes',   value: pendingQuotes, icon: 'clock-outline',          color: '#ef4444' },
    { label: 'Threads',          value: totalThreads,  icon: 'message-text-outline',   color: '#8b5cf6' },
    { label: 'Total Jobs',       value: totalJobs,     icon: 'format-list-bulleted',   color: '#64748b' },
  ];

  const handleSignOut = async () => {
    await adminSignOut();
    router.replace('/admin' as any);
  };

  return (
    <View style={styles.root}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#c8931a" />
          <Text style={styles.topBarTitle}>FarmingPal Admin</Text>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <MaterialCommunityIcons name="logout" size={18} color="#94a3b8" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Dashboard</Text>
          <Text style={styles.pageSub}>Live counts from Supabase.</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {STATS.map(s => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: s.color + '22' }]}>
                <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>Management</Text>

        {/* Nav tiles */}
        <View style={styles.tilesGrid}>
          {NAV_TILES.map(tile => (
            <TouchableOpacity
              key={tile.label}
              style={[styles.tile, !tile.available && styles.tileDisabled]}
              activeOpacity={tile.available ? 0.8 : 1}
              onPress={() => tile.available && router.push(tile.href as any)}
            >
              <View style={styles.tileIconRow}>
                <View style={styles.tileIconWrap}>
                  <MaterialCommunityIcons name={tile.icon} size={22} color={tile.available ? '#c8931a' : '#475569'} />
                </View>
                {!tile.available && (
                  <View style={styles.comingSoonPill}>
                    <Text style={styles.comingSoonText}>Soon</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tileLabel, !tile.available && styles.tileLabelDisabled]}>{tile.label}</Text>
              <Text style={styles.tileDesc}>{tile.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer note */}
        <View style={styles.footerNote}>
          <MaterialCommunityIcons name="information-outline" size={14} color="#475569" />
          <Text style={styles.footerNoteText}>
            Admin portal v1.0 · All data is live from Supabase.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:              { flex: 1, backgroundColor: '#0f172a' },

  topBar:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#334155' },
  topBarLeft:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topBarTitle:       { fontSize: 16, fontWeight: '800', color: '#f1f5f9' },
  signOutBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0f172a', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  signOutText:       { fontSize: 13, color: '#94a3b8', fontWeight: '600' },

  content:           { padding: 20, paddingBottom: 48 },

  pageHeader:        { marginBottom: 24 },
  pageTitle:         { fontSize: 26, fontWeight: '900', color: '#f1f5f9', marginBottom: 4 },
  pageSub:           { fontSize: 13, color: '#64748b', lineHeight: 19 },

  statsGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  statCard:          { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#334155', minWidth: '30%', flexGrow: 1, alignItems: 'flex-start' },
  statIconWrap:      { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue:         { fontSize: 28, fontWeight: '900', color: '#f1f5f9', marginBottom: 2 },
  statLabel:         { fontSize: 12, color: '#64748b', fontWeight: '600' },

  sectionLabel:      { fontSize: 11, fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14 },

  tilesGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  tile:              { backgroundColor: '#1e293b', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#334155', minWidth: '45%', flexGrow: 1 },
  tileDisabled:      { opacity: 0.55 },
  tileIconRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  tileIconWrap:      { width: 42, height: 42, borderRadius: 10, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  comingSoonPill:    { backgroundColor: '#1e3a5f', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 8 },
  comingSoonText:    { fontSize: 10, fontWeight: '700', color: '#60a5fa' },
  tileLabel:         { fontSize: 14, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  tileLabelDisabled: { color: '#94a3b8' },
  tileDesc:          { fontSize: 12, color: '#64748b', lineHeight: 18 },

  footerNote:        { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#1e293b', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#334155' },
  footerNoteText:    { fontSize: 12, color: '#475569', lineHeight: 18, flex: 1 },
});
