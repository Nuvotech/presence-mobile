import { View, Image, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { AppText } from '../components/AppText';
import { PrimaryButton, OutlineButton } from '../components/Buttons';
import { colors } from '../theme/tokens';
import { useAppStore } from '../store/useAppStore';
import { formatDisplayDate } from '../lib/date';

export default function HomePage() {
  const router = useRouter();
  const teacher = useAppStore((s) => s.teacher);
  const todaysSession = useAppStore((s) => s.todaysSession());

  const presentCount = todaysSession
    ? Object.values(todaysSession.attendance).filter((a) => a.present).length
    : 0;

  return (
    <View className="flex-1 bg-background">
      <Header title="Home" />
      <ScrollView contentContainerClassName="px-container-margin pt-lg pb-24" keyboardShouldPersistTaps="handled">
        <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg items-center custom-shadow">
          <View className="w-24 h-24 rounded-[999px] overflow-hidden border border-outline-variant bg-surface-container mb-sm">
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

        {todaysSession ? (
          <Pressable
            onPress={() => router.push('/register')}
            className="mt-md bg-surface-container-lowest border border-outline-variant rounded-xl p-sm flex-row items-center justify-between active:opacity-80">
            <View className="flex-row items-center gap-sm flex-1">
              <View className="w-12 h-12 rounded-[999px] bg-secondary-container items-center justify-center">
                <MaterialIcons name="assignment" size={22} color={colors.onSecondaryContainer} />
              </View>
              <View className="flex-1">
                <AppText weight="bold" className="text-on-surface">
                  Today: {todaysSession.className}
                </AppText>
                <AppText className="text-sm text-on-surface-variant">
                  {formatDisplayDate(todaysSession.date)} · {presentCount} present
                </AppText>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
        ) : (
          <View className="mt-md bg-surface-container rounded-xl p-sm">
            <AppText className="text-sm text-on-surface-variant text-center">
              No class checked in yet today. Scan a class to get started.
            </AppText>
          </View>
        )}

        <View className="mt-lg gap-sm">
          <PrimaryButton
            label="Scan a Class"
            icon="qr-code-scanner"
            onPress={() => router.push('/class-scanner')}
          />
          <OutlineButton label="History" icon="history" onPress={() => router.push('/history')} />
        </View>

        <Pressable onPress={() => router.replace('/login')} className="mt-lg self-center">
          <AppText weight="medium" className="text-sm text-on-surface-variant underline">
            Log out
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}
