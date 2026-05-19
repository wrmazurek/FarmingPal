import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="country" />
      <Stack.Screen name="region" />
      <Stack.Screen name="district" />
    </Stack>
  );
}
