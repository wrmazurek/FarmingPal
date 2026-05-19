import { StyleSheet, Text, View } from 'react-native';
import AppHeader from '@/components/AppHeader';

export default function BuySellScreen() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.content}>
        <Text style={styles.title}>Buy / Sell</Text>
        <Text style={styles.sub}>Farmland & equipment marketplace — coming soon.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f4' },
  content:   { flex: 1, justifyContent: 'center', alignItems: 'center', paddingLeft: 12, paddingRight: 24, paddingTop: 24, paddingBottom: 24 },
  title:     { fontSize: 26, fontWeight: '800', color: '#1a3c1a', marginBottom: 8 },
  sub:       { fontSize: 15, color: '#777', textAlign: 'center' },
});
