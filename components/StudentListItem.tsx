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
          <AppText className="text-sm text-on-surface-variant">Arrived at {time}</AppText>
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
  onMarkPresent,
}: RowProps & { onMarkPresent?: () => void }) {
  const router = useRouter();

  const openIdCard = () =>
    router.push({
      pathname: '/id-card',
      params: {
        name: student.name,
        grade,
        studentId: studentIdFor(student.id),
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
          <AppText className="text-sm text-error">Unaccounted for</AppText>
        </View>
      </View>
      {onMarkPresent && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onMarkPresent();
          }}
          className="px-4 py-2 border border-outline-variant rounded-lg active:bg-surface-container">
          <AppText weight="bold" className="text-on-surface">
            Mark Present
          </AppText>
        </Pressable>
      )}
    </Pressable>
  );
}
