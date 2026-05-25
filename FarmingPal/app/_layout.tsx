import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UserProvider, useUser } from '@/context/UserContext';
import { JobBoardProvider } from '@/context/JobBoardContext';

function RouteGuard() {
  const { onboardingComplete, isLoading: userLoading } = useUser();
  const { isLoading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (userLoading || authLoading) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inGetStarted = segments[0] === 'getstarted';
    const inAuth       = segments[0] === '(auth)';
    const inAdmin      = segments[0] === 'admin';

    if (!onboardingComplete && !inOnboarding && !inGetStarted && !inAuth && !inAdmin) {
      router.replace('/onboarding/country');
    } else if (onboardingComplete && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [onboardingComplete, userLoading, authLoading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <UserProvider>
      <AuthProvider>
        <JobBoardProvider>
          <RouteGuard />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="getstarted" />
            <Stack.Screen name="admin" />
          </Stack>
          <StatusBar style="auto" />
        </JobBoardProvider>
      </AuthProvider>
    </UserProvider>
  );
}
