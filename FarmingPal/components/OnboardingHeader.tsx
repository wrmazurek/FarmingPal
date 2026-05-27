import { Image, StyleSheet, View } from 'react-native';

const LOGO = require('@/assets/images/FP Logo - Trasluscent Background.png');

export default function OnboardingHeader() {
  return (
    <View style={styles.header}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#2d6a2d', paddingTop: 26, paddingBottom: 10, paddingHorizontal: 12 },
  logo:   { height: 44, width: 80 },
});
