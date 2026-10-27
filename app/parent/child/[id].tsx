import { useCallback, useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ParentHeader } from '../../../components/ParentHeader';
import { AppText } from '../../../components/AppText';
import { ChildAvatar } from '../../../components/ChildAvatar';
import { colors } from '../../../theme/tokens';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import { formatLongDate, formatTime } from '../../../lib/date';
import { fetchChildAttendance, type AttendancePage, type ChildAttendance } from '../../../lib/parent';

export default function ParentChildPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const childId = Number(id);
  const { t, language } = useTranslation();
  const [summary, setSummary] = useState<Omit<AttendancePage, 'records' | 'hasMore'> | null>(null);
  const [records, setRecords] = useState<ChildAttendance[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const loadFirstPage = useCallback(async () => {
    try {
      const result = await fetchChildAttendance(childId, 1);
      setSummary({ child: result.child, present: result.present, absent: result.absent });
      setRecords(result.records);
      setPage(1);
      setHasMore(result.hasMore);
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    }
  }, [childId]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFirstPage();
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchChildAttendance(childId, page + 1);
      setRecords((current) => [...current, ...result.records]);
      setPage(page + 1);
      setHasMore(result.hasMore);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ParentHeader title={t.parent.historyTitle} backButton />

      {summary === null ? (
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
          data={records}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="px-container-margin pt-lg pb-24"
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />
          }
          ListHeaderComponent={
            <View className="mb-md">
              <View className="flex-row items-center gap-sm">
                <ChildAvatar name={summary.child.name} photoUrl={summary.child.photo_url} accentIndex={0} size="lg" />
                <View className="flex-1">
                  <AppText weight="extrabold" className="text-2xl text-on-surface" numberOfLines={1}>
                    {summary.child.name}
                  </AppText>
                  {summary.child.class_name && (
                    <AppText className="text-sm text-on-surface-variant">{summary.child.class_name}</AppText>
                  )}
                </View>
              </View>

              <View className="flex-row gap-sm mt-md">
                <View className="flex-1 rounded-lg bg-tertiary-fixed p-sm">
                  <AppText weight="extrabold" className="text-2xl text-on-tertiary-fixed-variant">
                    {summary.present}
                  </AppText>
                  <AppText weight="medium" className="text-xs text-on-tertiary-fixed-variant">
                    {t.parent.presentLabel}
                  </AppText>
                </View>
                <View className="flex-1 rounded-lg bg-error-container p-sm">
                  <AppText weight="extrabold" className="text-2xl text-on-error-container">
                    {summary.absent}
                  </AppText>
                  <AppText weight="medium" className="text-xs text-on-error-container">
                    {t.parent.absentLabel}
                  </AppText>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View className="bg-surface-container rounded-xl p-sm">
              <AppText className="text-sm text-on-surface-variant text-center">{t.parent.noRecords}</AppText>
            </View>
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} className="my-sm" /> : null}
          renderItem={({ item }) => {
            const present = item.status === 'present';
            return (
              <View className="flex-row items-center gap-sm py-sm border-b border-outline-variant">
                <MaterialIcons
                  name={present ? 'check-circle' : 'cancel'}
                  size={20}
                  color={present ? colors.attendanceSuccess : colors.error}
                />
                <View className="flex-1">
                  <AppText weight="medium" className="text-sm text-on-surface">
                    {formatLongDate(item.date, language)}
                  </AppText>
                  {item.subject && <AppText className="text-xs text-on-surface-variant">{item.subject}</AppText>}
                </View>
                <AppText weight="medium" className="text-xs text-on-surface-variant">
                  {present
                    ? item.arrived_at
                      ? t.parent.arrivedAt(formatTime(item.arrived_at, language))
                      : t.parent.statusPresent
                    : t.parent.statusAbsent}
                </AppText>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
