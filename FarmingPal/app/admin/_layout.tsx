import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';

function AdminGuard() {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const onSignIn = segments[1] === 'index' || segments[1] === undefined;
    if (!isAdminAuthenticated && !onSignIn) {
      router.replace('/admin' as any);
    }
  }, [isAdminAuthenticated, isLoading, segments]);

  return null;
}

export default function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminGuard />
      <Stack screenOptions={{ headerShown: false }} />
    </AdminAuthProvider>
  );
}
