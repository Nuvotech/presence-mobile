import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { api, clearToken } from '../../lib/api';
import { fetchNotifications, registerPushToken } from '../../lib/parent';
import { getExpoPushToken } from '../../lib/push';
import { useAppStore } from '../../store/useAppStore';

export default function ParentLayout() {
  const router = useRouter();
  const parentGuardian = useAppStore((s) => s.parentGuardian);
  const setParentGuardian = useAppStore((s) => s.setParentGuardian);
  const setParentPushToken = useAppStore((s) => s.setParentPushToken);
  const setParentUnreadCount = useAppStore((s) => s.setParentUnreadCount);
  const canUseApp = parentGuardian !== null && !parentGuardian.must_change_password;

  // An expired or revoked token sends the parent back to the login screen.
  useEffect(() => {
    const interceptor = api.interceptors.response.use(undefined, async (error) => {
      if (error?.response?.status === 401 && useAppStore.getState().parentGuardian) {
        await clearToken();
        setParentGuardian(null);
        router.replace('/login');
      }
      return Promise.reject(error);
    });

    return () => api.interceptors.response.eject(interceptor);
  }, [router, setParentGuardian]);

  // Register this device for pushes once the parent can use the app.
  useEffect(() => {
    if (!canUseApp) return;

    getExpoPushToken().then((token) => {
      if (!token) return;
      setParentPushToken(token);
      registerPushToken(token).catch(() => {
        // The inbox still works without push; retried on next launch.
      });
    });
  }, [canUseApp, setParentPushToken]);

  // A push arriving in the foreground refreshes the badge; tapping one opens the inbox.
  useEffect(() => {
    if (!canUseApp) return;

    const refreshUnread = () =>
      fetchNotifications()
        .then((page) => setParentUnreadCount(page.unreadCount))
        .catch(() => {});

    const received = Notifications.addNotificationReceivedListener(refreshUnread);
    const tapped = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/parent/notifications');
    });

    return () => {
      received.remove();
      tapped.remove();
    };
  }, [canUseApp, router, setParentUnreadCount]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
