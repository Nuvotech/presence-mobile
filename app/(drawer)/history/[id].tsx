import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../../components/Header';
import { AppText } from '../../../components/AppText';
import { StaticStudentRow } from '../../../components/StudentListItem';
import { RegisterHero } from '../../../components/RegisterHero';
import { useAppStore } from '../../../store/useAppStore';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import { formatDisplayDate } from '../../../lib/date';

export default function HistorySessionDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const classes = useAppStore((s) => s.classes);
  const studentsByClass = useAppStore((s) => s.studentsByClass);
  const session = useAppStore((s) => s.sessions.find((sess) => sess.id === id));
  const classInfo = session ? classes.find((c) => c.id === session.classId) : undefined;

  if (!session || !classInfo) {
    return (
      <View className="flex-1 bg-background">
        <Header title={t.historyDetail.headerTitle} backButton />
        <View className="flex-1 items-center justify-center px-container-margin">
          <AppText className="text-base text-on-surface-variant text-center">{t.historyDetail.notFound}</AppText>
        </View>
      </View>
    );
  }

  const roster = studentsByClass[session.classId] ?? [];
  const presentStudents = roster.filter((s) => session.attendance[s.id]?.present);
  const absentStudents = roster.filter((s) => !session.attendance[s.id]?.present);

  return (
    <View className="flex-1 bg-background">
      <ScrollView style={{ paddingTop: insets.top }} contentContainerClassName="pb-24">
        <RegisterHero
          className={classInfo.name}
          present={presentStudents.length}
          total={roster.length}
          dateLabel={formatDisplayDate(session.date)}
          presentOfTotal={t.register.presentOfTotal}
          onBack={() => router.back()}
        />

        {presentStudents.length > 0 && (
          <View className="px-container-margin mt-md gap-md">
            <AppText weight="bold" className="text-sm text-on-surface-variant uppercase tracking-wider">
              {t.historyDetail.present}
            </AppText>
            {presentStudents.map((student) => (
              <StaticStudentRow
                key={student.id}
                student={student}
                classId={session.classId}
                present
                time={session.attendance[student.id]?.time}
              />
            ))}
          </View>
        )}

        {absentStudents.length > 0 && (
          <View className="px-container-margin mt-md gap-md">
            <AppText weight="bold" className="text-sm text-on-surface-variant uppercase tracking-wider">
              {t.historyDetail.absent}
            </AppText>
            {absentStudents.map((student) => (
              <StaticStudentRow key={student.id} student={student} classId={session.classId} present={false} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
