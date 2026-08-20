import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { AppText } from '../components/AppText';
import { colors } from '../theme/tokens';
import { useAppStore } from '../store/useAppStore';
import { formatDisplayDate, isToday } from '../lib/date';

export default function HistoryPage() {
  const router = useRouter();
  const sessions = useAppStore((s) => s.sessions);
  const studentsByClass = useAppStore((s) => s.studentsByClass);
  const subjects = useAppStore((s) => s.subjects);
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  const fetchStudentsForClass = useAppStore((s) => s.fetchStudentsForClass);
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View className="flex-1 bg-background">
      <Header title="Historique" backButton />
      <ScrollView contentContainerClassName="px-container-margin pt-lg pb-24 gap-md">
        {sorted.length === 0 && (
          <View className="items-center justify-center py-xl gap-md">
            <MaterialIcons name="history" size={48} color={colors.onSurfaceVariant} />
            <AppText className="text-base text-on-surface-variant text-center">
              Aucune classe enregistrée pour le moment.
            </AppText>
          </View>
        )}

        {sorted.map((session) => {
          const total = studentsByClass[session.classId]?.length ?? 0;
          const present = Object.values(session.attendance).filter((a) => a.present).length;
          const today = isToday(session.date);

          return (
            <Pressable
              key={session.id}
              onPress={() => {
                if (today) {
                  setActiveSession(session.id);
                  fetchStudentsForClass(session.classId);
                  router.push('/register');
                } else {
                  router.push({ pathname: '/history/[id]', params: { id: session.id } });
                }
              }}
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
                          AUJOURD'HUI
                        </AppText>
                      </View>
                    )}
                  </View>
                  <AppText className="text-sm text-on-surface-variant">
                    {formatDisplayDate(session.date)} ·{' '}
                    {subjects.find((sub) => sub.code === session.subjectCode)?.label ?? session.subjectCode} ·{' '}
                    {present}/{total} présents
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
