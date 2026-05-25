import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

// Show alerts + sound when a notification arrives while the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

export async function registerPushToken(userId: string): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const projectId =
      (Constants.expoConfig?.extra as any)?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );

    await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
  } catch (err) {
    console.warn('[notifications] registerPushToken failed:', err);
  }
}

export async function sendPushToUser(
  recipientId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.functions.invoke('send-push', {
      body: { user_id: recipientId, title, body, data: data ?? {} },
    });
  } catch (err) {
    console.warn('[notifications] sendPushToUser failed:', err);
  }
}
