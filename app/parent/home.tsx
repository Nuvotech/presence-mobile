import { useCallback, useState } from 'react';
import { View, Pressable, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ParentHeader } from '../../components/ParentHeader';
import { AppText } from '../../components/AppText';
import { ChildAvatar } from '../../components/ChildAvatar';
import { colors } from '../../theme/tokens';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { formatDateTime, formatLongDate, formatTime, todayStr } from '../../lib/date';
import { fetchChildren, fetchNotifications, type Child, type ParentNotification } from '../../lib/parent';

const RECENT_LIMIT = 3;

export default function ParentHomePage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const guardian = useAppStore((s) => s.parentGuardian);
  const setParentUnreadCount = useAppStore((s) => s.setParentUnreadCount);
  const [children, setChildren] = useState<Child[] | null>(null);
  const [recent, setRecent] = useState<ParentNotification[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [childList, page] = await Promise.all([fetchChildren(), fetchNotifications()]);
      setChildren(childList);
      setRecent(page.notifications.slice(0, RECENT_LIMIT));
      setParentUnreadCount(page.unreadCount);
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    }
  }, [setParentUnreadCount]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const statusLine = (child: Child) => {
    if (child.today_status === 'present' && child.arrived_at) {
      return { text: t.parent.todayPresent(formatTime(child.arrived_at, language)), color: colors.attendanceSuccess, icon: 'check-circle' as const };
    }
    if (child.today_status === 'absent') {
      return { text: t.parent.todayAbsent, color: colors.error, icon: 'cancel' as const };
    }
    return { text: t.parent.todayNotRecorded, color: colors.onSurfaceVariant, icon: 'schedule' as const };
  };

  return (
    <View className="flex-1 bg-background">
      <ParentHeader title={t.parent.homeTitle} showActions />
      <ScrollView
        contentContainerClassName="px-container-margin pt-lg pb-24"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }>
        <AppText weight="extrabold" className="text-3xl text-on-surface">
          {t.parent.greeting(guardian?.name?.split(' ')[0] ?? '')}
        </AppText>
        <AppText className="text-base text-on-surface-variant mt-1">{formatLongDate(todayStr(), language)}</AppText>
        {guardian?.school && (
          <AppText weight="medium" className="text-sm text-primary mt-1">
            {guardian.school.name}
          </AppText>
        )}

        {children === null && !loadFailed && <ActivityIndicator color={colors.primary} className="mt-lg" />}

        {loadFailed && children === null && (
          <Pressable onPress={load} className="mt-lg bg-surface-container rounded-xl p-sm items-center active:opacity-80">
            <AppText className="text-sm text-on-surface-variant">{t.parent.loadError}</AppText>
            <AppText weight="bold" className="text-sm text-primary mt-1">
              {t.parent.retry}
            </AppText>
          </Pressable>
        )}

        {children !== null && (
          <>
            <AppText weight="medium" className="mt-lg text-on-surface-variant text-xs uppercase tracking-wider">
              {t.parent.childrenHeading}
            </AppText>

            {children.length === 0 ? (
              <View className="mt-sm bg-surface-container rounded-xl p-sm">
                <AppText className="text-sm text-on-surface-variant text-center">{t.parent.noChildren}</AppText>
              </View>
            ) : (
              <View className="mt-sm gap-sm">
                {children.map((child, index) => {
                  const status = statusLine(child);
                  return (
                    <Pressable
                      key={child.id}
                      onPress={() => router.push({ pathname: '/parent/child/[id]', params: { id: String(child.id) } })}
                      className="flex-row items-center gap-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-sm active:opacity-80">
                      <ChildAvatar name={child.name} photoUrl={child.photo_url} accentIndex={index} />
                      <View className="flex-1">
                        <AppText weight="bold" className="text-base text-on-surface" numberOfLines={1}>
                          {child.name}
                        </AppText>
                        {child.class_name && (
                          <AppText className="text-sm text-on-surface-variant" numberOfLines={1}>
                            {child.class_name}
                          </AppText>
                        )}
                        <View className="flex-row items-center gap-1 mt-1">
                          <MaterialIcons name={status.icon} size={14} color={status.color} />
                          <AppText weight="medium" className="text-xs" style={{ color: status.color }}>
                            {status.text}
                          </AppText>
                        </View>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
                    </Pressable>
                  );
                })}
              </View>
            )}

            <View className="mt-lg flex-row items-center justify-between">
              <AppText weight="medium" className="text-on-surface-variant text-xs uppercase tracking-wider">
                {t.parent.recentHeading}
              </AppText>
              {recent.length > 0 && (
                <Pressable onPress={() => router.push('/parent/notifications')} hitSlop={8}>
                  <AppText weight="bold" className="text-xs text-primary">
                    {t.parent.viewAll}
                  </AppText>
                </Pressable>
              )}
            </View>

            {recent.length === 0 ? (
              <View className="mt-sm bg-surface-container rounded-xl p-sm">
                <AppText className="text-sm text-on-surface-variant text-center">{t.parent.noNotifications}</AppText>
              </View>
            ) : (
              <View className="mt-sm rounded-lg border border-outline-variant bg-surface-container-lowest">
                {recent.map((notification, index) => (
                  <View
                    key={notification.id}
                    className={`flex-row gap-sm p-sm ${index > 0 ? 'border-t border-outline-variant' : ''}`}>
                    <View className={`w-2 h-2 rounded-full mt-1.5 ${notification.read_at ? 'bg-transparent' : 'bg-accent'}`} />
                    <View className="flex-1">
                      <AppText className="text-sm text-on-surface">{notification.message}</AppText>
                      {notification.created_at && (
                        <AppText className="text-xs text-on-surface-variant mt-0.5">
                          {formatDateTime(notification.created_at, language)}
                        </AppText>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
