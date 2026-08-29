import { View, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from './AppText';
import { accentFor } from '../theme/tokens';
import { useTranslation } from '../lib/i18n/useTranslation';
import type { RosterStudent } from '../data/classes';

type StudentRowProps = {
  student: RosterStudent;
  classId: string;
  sessionId: string;
  present: boolean;
  time?: string;
  onToggle: () => void;
};

export function StudentRow({ student, classId, sessionId, present, time, onToggle }: StudentRowProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const accent = accentFor(student.color);

  const openStudent = () =>
    router.push({
      pathname: '/student',
      params: { studentId: String(student.id), classId, sessionId },
    });

  return (
    <Pressable
      onPress={openStudent}
      className={`${present ? student.color : 'bg-surface-container-low'} rounded-lg p-sm flex-row items-center justify-between active:opacity-80`}>
      <View className="flex-row items-center gap-sm flex-1">
        {student.img ? (
          <View className="w-12 h-12 rounded-full overflow-hidden bg-white">
            <Image source={{ uri: student.img }} className="w-full h-full" />
          </View>
        ) : (
          <View className="w-12 h-12 rounded-full bg-white items-center justify-center">
            <AppText weight="bold" className={`text-xl ${present ? accent.onText : 'text-outline'}`}>
              {student.initials}
            </AppText>
          </View>
        )}
        <View className="flex-1">
          <AppText weight="bold" className={present ? 'text-on-surface' : 'text-on-surface-variant'} numberOfLines={1}>
            {student.name}
          </AppText>
          <AppText className="text-sm text-on-surface-variant" numberOfLines={1}>
            {present ? t.studentListItem.arrivedAt(time ?? '') : t.studentListItem.tapToMarkPresent}
          </AppText>
        </View>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        accessibilityLabel={present ? t.studentListItem.markWaitingLabel : t.studentListItem.markPresentLabel}
        className="w-8 h-8 rounded-full bg-white items-center justify-center">
        <AppText weight="bold" className={present ? accent.onText : 'text-outline'}>
          {present ? '✓' : '+'}
        </AppText>
      </Pressable>
    </Pressable>
  );
}

// Read-only variant for historical/submitted records — no mark toggle, since
// past attendance shouldn't be edited from a list row.
type StaticStudentRowProps = {
  student: RosterStudent;
  classId: string;
  present: boolean;
  time?: string;
};

export function StaticStudentRow({ student, classId, present, time }: StaticStudentRowProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const accent = accentFor(student.color);

  const openStudent = () =>
    router.push({
      pathname: '/student',
      params: { studentId: String(student.id), classId },
    });

  return (
    <Pressable
      onPress={openStudent}
      className={`${present ? student.color : 'bg-surface-container-low'} rounded-lg p-sm flex-row items-center justify-between active:opacity-80`}>
      <View className="flex-row items-center gap-sm flex-1">
        {student.img ? (
          <View className="w-12 h-12 rounded-full overflow-hidden bg-white">
            <Image source={{ uri: student.img }} className="w-full h-full" />
          </View>
        ) : (
          <View className="w-12 h-12 rounded-full bg-white items-center justify-center">
            <AppText weight="bold" className={`text-xl ${present ? accent.onText : 'text-outline'}`}>
              {student.initials}
            </AppText>
          </View>
        )}
        <View className="flex-1">
          <AppText weight="bold" className={present ? 'text-on-surface' : 'text-on-surface-variant'} numberOfLines={1}>
            {student.name}
          </AppText>
          <AppText className="text-sm text-on-surface-variant" numberOfLines={1}>
            {present ? t.studentListItem.arrivedAt(time ?? '') : t.historyDetail.absent}
          </AppText>
        </View>
      </View>
      {present && (
        <View className="w-8 h-8 rounded-full bg-white items-center justify-center">
          <AppText weight="bold" className={accent.onText}>
            ✓
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
