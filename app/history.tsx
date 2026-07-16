import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { AppText } from '../components/AppText';
import { colors } from '../theme/tokens';
import { classes } from '../data/classes';
import { useAppStore } from '../store/useAppStore';
import { formatDisplayDate, isToday } from '../lib/date';

export default function HistoryPage() {
  const router = useRouter();
  const sessions = useAppStore((s) => s.sessions);
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View className="flex-1 bg-background">
      <Header title="History" backButton />
      <ScrollView contentContainerClassName="px-container-margin pt-lg pb-24 gap-md">
        {sorted.length === 0 && (
          <View className="items-center justify-center py-xl gap-md">
            <MaterialIcons name="history" size={48} color={colors.onSurfaceVariant} />
            <AppText className="text-base text-on-surface-variant text-center">
              No classes checked into yet.
            </AppText>
          </View>
        )}

        {sorted.map((session) => {
          const total = classes.find((c) => c.id === session.classId)?.roster.length ?? 0;
          const present = Object.values(session.attendance).filter((a) => a.present).length;
          const today = isToday(session.date);

          return (
            <Pressable
              key={session.id}
              onPress={() => router.push(today ? '/register' : { pathname: '/history/[id]', params: { id: session.id } })}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-sm flex-row items-center justify-between active:opacity-80">
              <View className="flex-row items-center gap-sm flex-1">
                <View className="w-12 h-12 rounded-[999px] bg-secondary-container items-center justify-center">
                  <MaterialIcons name="assignment" size={22} color={colors.onSecondaryContainer} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <AppText weight="bold" className="text-on-surface">
                      {session.className}
                    </AppText>
                    {today && (
                      <View className="px-2 py-0.5 bg-primary rounded">
                        <AppText weight="bold" className="text-[10px] text-on-primary">
                          TODAY
                        </AppText>
                      </View>
                    )}
                  </View>
                  <AppText className="text-sm text-on-surface-variant">
                    {formatDisplayDate(session.date)} · {present}/{total} present
                  </AppText>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
