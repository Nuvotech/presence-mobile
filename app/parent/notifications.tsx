import { useCallback, useState } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ParentHeader } from '../../components/ParentHeader';
import { AppText } from '../../components/AppText';
import { colors } from '../../theme/tokens';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { formatDateTime } from '../../lib/date';
import { fetchNotifications, markNotificationsRead, type ParentNotification } from '../../lib/parent';

// Opening the inbox marks everything read on the server (clearing the
// badge), while this visit keeps highlighting what was new.
export default function ParentNotificationsPage() {
  const { t, language } = useTranslation();
  const setParentUnreadCount = useAppStore((s) => s.setParentUnreadCount);
  const [notifications, setNotifications] = useState<ParentNotification[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const loadFirstPage = useCallback(async () => {
    try {
      const result = await fetchNotifications(1);
      setNotifications(result.notifications);
      setPage(1);
      setHasMore(result.hasMore);
      setLoadFailed(false);

      if (result.unreadCount > 0) {
        setParentUnreadCount(await markNotificationsRead());
      }
    } catch {
      setLoadFailed(true);
    }
  }, [setParentUnreadCount]);

  useFocusEffect(
    useCallback(() => {
      loadFirstPage();
    }, [loadFirstPage]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFirstPage();
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchNotifications(page + 1);
      setNotifications((current) => [...(current ?? []), ...result.notifications]);
      setPage(page + 1);
      setHasMore(result.hasMore);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ParentHeader title={t.parent.notificationsTitle} backButton />

      {notifications === null ? (
        loadFailed ? (
          <Pressable onPress={loadFirstPage} className="m-container-margin bg-surface-container rounded-xl p-sm items-center">
            <AppText className="text-sm text-on-surface-variant">{t.parent.loadError}</AppText>
            <AppText weight="bold" className="text-sm text-primary mt-1">
              {t.parent.retry}
            </AppText>
          </Pressable>
        ) : (
          <ActivityIndicator color={colors.primary} className="mt-lg" />
        )
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="px-container-margin pt-sm pb-24"
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View className="mt-sm bg-surface-container rounded-xl p-sm">
              <AppText className="text-sm text-on-surface-variant text-center">{t.parent.noNotifications}</AppText>
            </View>
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} className="my-sm" /> : undefined}
          renderItem={({ item }) => (
            <View className="flex-row gap-sm py-sm border-b border-outline-variant">
              <View className={`w-2 h-2 rounded-full mt-1.5 ${item.read_at ? 'bg-transparent' : 'bg-accent'}`} />
              <View className="flex-1">
                <View className="flex-row items-center justify-between gap-2">
                  <AppText weight="bold" className="text-sm text-on-surface flex-1" numberOfLines={1}>
                    {item.student.name}
                  </AppText>
                  {item.created_at && (
                    <AppText className="text-xs text-on-surface-variant">{formatDateTime(item.created_at, language)}</AppText>
                  )}
                </View>
                <AppText className="text-sm text-on-surface-variant mt-0.5">{item.message}</AppText>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
