import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AppText } from '../../components/AppText';
import { SessionRow } from '../../components/SessionRow';
import { colors } from '../../theme/tokens';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { formatDisplayDate, isToday } from '../../lib/date';

export default function HistoryPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const sessions = useAppStore((s) => s.sessions);
  const studentsByClass = useAppStore((s) => s.studentsByClass);
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  const fetchStudentsForClass = useAppStore((s) => s.fetchStudentsForClass);
  const subjects = useAppStore((s) => s.subjects);
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View className="flex-1 bg-background">
      <Header title={t.history.headerTitle} backButton />
      <ScrollView contentContainerClassName="px-container-margin pt-lg pb-24 gap-md">
        {sorted.length === 0 && (
          <View className="items-center justify-center py-xl gap-md">
            <MaterialIcons name="history" size={48} color={colors.onSurfaceVariant} />
            <AppText className="text-base text-on-surface-variant text-center">
              {t.history.emptyState}
            </AppText>
          </View>
        )}

        {sorted.map((session, index) => {
          const total = studentsByClass[session.classId]?.length ?? 0;
          const present = Object.values(session.attendance).filter((a) => a.present).length;
          const today = isToday(session.date);
          const codeMatch = session.className.match(/\d+|[A-Za-z]/g) ?? [];
          const code = codeMatch.slice(0, 2).join('').toUpperCase() || session.className.slice(0, 2).toUpperCase();

          return (
            <SessionRow
              key={session.id}
              code={code}
              accentIndex={index}
              title={session.className}
              subtitle={`${formatDisplayDate(session.date)} · ${subjects.find((sub) => sub.code === session.subjectCode)?.label ?? session.subjectCode} · ${present}/${total} ${t.common.presentSuffix}`}
              badgeLabel={today ? t.history.today : undefined}
              right={{ type: 'chevron' }}
              onPress={() => {
                if (today) {
                  setActiveSession(session.id);
                  fetchStudentsForClass(session.classId);
                  router.push('/register');
                } else {
                  router.push({ pathname: '/history/[id]', params: { id: session.id } });
                }
              }}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
