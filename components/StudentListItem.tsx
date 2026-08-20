import { View, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '../theme/tokens';
import type { RosterStudent } from '../data/classes';

const studentIdFor = (id: number) => `SC-2024-88${String(id).padStart(2, '0')}`;

type RowProps = {
  student: RosterStudent;
  grade: string;
};

export function PresentStudentRow({ student, grade, time }: RowProps & { time?: string }) {
  const router = useRouter();

  const openIdCard = () =>
    router.push({
      pathname: '/id-card',
      params: {
        name: student.name,
        grade,
        studentId: studentIdFor(student.id),
        qrToken: student.qrToken,
        ...(student.img ? { img: student.img } : { initials: student.initials, color: student.color }),
      },
    });

  return (
    <Pressable
      onPress={openIdCard}
      className="bg-surface-container-lowest rounded-xl p-sm flex-row items-center justify-between border border-outline-variant/30 active:opacity-80">
      <View className="flex-row items-center gap-sm">
        {student.img ? (
          <View className="w-12 h-12 rounded-[999px] overflow-hidden border border-outline-variant/50">
            <Image source={{ uri: student.img }} className="w-full h-full" />
          </View>
        ) : (
          <View className={`w-12 h-12 rounded-[999px] ${student.color} items-center justify-center`}>
            <AppText weight="bold" className="text-xl">
              {student.initials}
            </AppText>
          </View>
        )}
        <View>
          <AppText weight="bold" className="text-on-surface">
            {student.name}
          </AppText>
          <AppText className="text-sm text-on-surface-variant">Arrivé à {time}</AppText>
        </View>
      </View>
      <View className="w-8 h-8 rounded-[999px] bg-[#E8F5E9] items-center justify-center">
        <MaterialIcons name="check-circle" size={20} color="#2E7D32" />
      </View>
    </Pressable>
  );
}

export function AbsentStudentRow({
  student,
  grade,
  isAbsent,
  onMarkPresent,
  onMarkAbsent,
}: RowProps & { isAbsent?: boolean; onMarkPresent?: () => void; onMarkAbsent?: () => void }) {
  const router = useRouter();

  const openIdCard = () =>
    router.push({
      pathname: '/id-card',
      params: {
        name: student.name,
        grade,
        studentId: studentIdFor(student.id),
        qrToken: student.qrToken,
        ...(student.img ? { img: student.img } : { initials: student.initials, color: student.color }),
      },
    });

  return (
    <Pressable
      onPress={openIdCard}
      className="bg-surface-container-lowest rounded-xl p-sm flex-row items-center justify-between border border-outline-variant/30 active:opacity-80">
      <View className="flex-row items-center gap-sm">
        {student.img ? (
          <View className="w-12 h-12 rounded-[999px] overflow-hidden border border-outline-variant/50">
            <Image source={{ uri: student.img }} className="w-full h-full" />
          </View>
        ) : (
          <View className={`w-12 h-12 rounded-[999px] ${student.color} items-center justify-center`}>
            <AppText weight="bold" className="text-xl">
              {student.initials}
            </AppText>
          </View>
        )}
        <View>
          <AppText weight="bold" className="text-on-surface">
            {student.name}
          </AppText>
          <AppText className="text-sm text-error">
            {isAbsent ? 'Marqué absent' : 'Non comptabilisé'}
          </AppText>
        </View>
      </View>
      {(onMarkPresent || onMarkAbsent) && (
        <View className="flex-row gap-2">
          {onMarkPresent && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onMarkPresent();
              }}
              accessibilityLabel="Marquer présent"
              className="w-9 h-9 items-center justify-center border border-outline-variant rounded-lg active:bg-surface-container">
              <MaterialIcons name="check" size={18} color={colors.onSurface} />
            </Pressable>
          )}
          {onMarkAbsent && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onMarkAbsent();
              }}
              accessibilityLabel="Marquer absent"
              className={`w-9 h-9 items-center justify-center border rounded-lg active:bg-error-container ${
                isAbsent ? 'bg-error-container border-error' : 'border-outline-variant'
              }`}>
              <MaterialIcons name="close" size={18} color={isAbsent ? colors.onErrorContainer : colors.error} />
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}
