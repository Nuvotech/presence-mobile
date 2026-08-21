import { View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { AppText } from '../../../components/AppText';
import { PresentStudentRow, AbsentStudentRow } from '../../../components/StudentListItem';
import { colors } from '../../../theme/tokens';
import { useAppStore } from '../../../store/useAppStore';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import { formatDisplayDate } from '../../../lib/date';

export default function HistorySessionDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const classes = useAppStore((s) => s.classes);
  const studentsByClass = useAppStore((s) => s.studentsByClass);
  const subjects = useAppStore((s) => s.subjects);
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
      <Header title={t.historyDetail.headerTitle} backButton />
      <ScrollView contentContainerClassName="pb-24">
        <View className="px-container-margin pt-lg pb-sm">
          <AppText weight="medium" className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">
            {formatDisplayDate(session.date)}
          </AppText>
          <AppText weight="bold" className="text-2xl text-on-surface">
            {classInfo.name}
          </AppText>
          <AppText className="text-sm text-on-surface-variant mt-1">
            {subjects.find((sub) => sub.code === session.subjectCode)?.label ?? session.subjectCode}
          </AppText>
          <View className="mt-2 self-start bg-surface-container px-3 py-1.5 rounded-[999px] flex-row items-center gap-2">
            <MaterialIcons name="check-circle" size={16} color={colors.onSurfaceVariant} />
            <AppText weight="bold" className="text-sm text-on-surface">
              {presentStudents.length}/{roster.length} {t.common.presentSuffix}
            </AppText>
          </View>
        </View>

        {presentStudents.length > 0 && (
          <View className="px-container-margin mt-md gap-md">
            <AppText weight="bold" className="text-sm text-on-surface-variant uppercase tracking-wider">
              {t.historyDetail.present}
            </AppText>
            {presentStudents.map((student) => (
              <PresentStudentRow
                key={student.id}
                student={student}
                grade={classInfo.name}
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
              <AbsentStudentRow key={student.id} student={student} grade={classInfo.name} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
