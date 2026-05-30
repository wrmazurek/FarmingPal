import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UserProvider, useUser } from '@/context/UserContext';
import { JobBoardProvider } from '@/context/JobBoardContext';
import { supabase } from '@/lib/supabase';

function RouteGuard() {
  const { onboardingComplete, isLoading: userLoading } = useUser();
  const { isLoading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // On web: check the URL hash immediately for a recovery token.
  // The SPA rewrite means the app always boots at root, so by the time any
  // screen mounts the PASSWORD_RECOVERY event may have already fired.
  // Checking the hash directly on mount is more reliable than the event alone.
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hash = new URLSearchParams(window.location.hash.substring(1));
      if (hash.get('type') === 'recovery' && hash.get('access_token')) {
        router.replace('/(auth)/reset-password' as any);
        return;
      }
    }

    // Fallback: listen for PASSWORD_RECOVERY event (fires after Supabase
    // processes the hash — reliable when the listener registers in time).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/(auth)/reset-password' as any);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
