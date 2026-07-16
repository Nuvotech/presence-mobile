import { View, Image, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { AppText } from '../components/AppText';
import { colors } from '../theme/tokens';
import { useAppStore } from '../store/useAppStore';

export default function ProfilePage() {
  const router = useRouter();
  const teacher = useAppStore((s) => s.teacher);
  const sessions = useAppStore((s) => s.sessions);
  const classesCovered = new Set(sessions.map((s) => s.classId)).size;

  return (
    <View className="flex-1 bg-background">
      <Header title="Teacher Profile" backButton />
      <ScrollView contentContainerClassName="px-container-margin pt-lg pb-24" keyboardShouldPersistTaps="handled">
        <View className="items-center">
          <View className="w-28 h-28 rounded-[999px] overflow-hidden border border-outline-variant bg-surface-container mb-sm">
            <Image source={{ uri: teacher.avatarUri }} className="w-full h-full" />
          </View>
          <AppText weight="bold" className="text-2xl text-on-surface">
            {teacher.name}
          </AppText>
          <AppText className="text-sm text-on-surface-variant mt-1">{teacher.email}</AppText>
          <View className="mt-2 px-2 py-0.5 bg-secondary-container rounded self-center">
            <AppText weight="bold" className="text-xs text-on-secondary-container">
              Teacher
            </AppText>
          </View>
        </View>

        <View className="mt-lg flex-row gap-sm">
          <View className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-sm items-center">
            <AppText weight="bold" className="text-2xl text-on-surface">
              {sessions.length}
            </AppText>
            <AppText className="text-xs text-on-surface-variant text-center mt-1">Sessions checked in</AppText>
          </View>
          <View className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-sm items-center">
            <AppText weight="bold" className="text-2xl text-on-surface">
              {classesCovered}
            </AppText>
            <AppText className="text-xs text-on-surface-variant text-center mt-1">Classes covered</AppText>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/history')}
          className="mt-md bg-surface-container-lowest border border-outline-variant rounded-xl p-sm flex-row items-center justify-between active:opacity-80">
          <View className="flex-row items-center gap-sm">
            <MaterialIcons name="history" size={22} color={colors.onSurfaceVariant} />
            <AppText weight="bold" className="text-on-surface">
              View History
            </AppText>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </Pressable>

        <Pressable onPress={() => router.replace('/login')} className="mt-lg self-center">
          <AppText weight="medium" className="text-sm text-on-surface-variant underline">
            Log out
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}
