import { View, Image, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AppText } from '../../components/AppText';
import { colors } from '../../theme/tokens';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { avatarUriFor } from '../../lib/avatar';

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const authUser = useAppStore((s) => s.authUser);
  const sessions = useAppStore((s) => s.sessions);
  const logout = useAppStore((s) => s.logout);
  const classesCovered = new Set(sessions.map((s) => s.classId)).size;

  return (
    <View className="flex-1 bg-background">
      <Header title={t.profile.headerTitle} backButton />
      <ScrollView contentContainerClassName="px-container-margin pt-lg pb-24" keyboardShouldPersistTaps="handled">
        <View className="items-center">
          <View className="w-28 h-28 rounded-[999px] overflow-hidden border border-outline-variant bg-surface-container mb-sm">
            <Image source={{ uri: avatarUriFor(authUser?.name ?? '') }} className="w-full h-full" />
          </View>
          <AppText weight="bold" className="text-2xl text-on-surface">
            {authUser?.name}
          </AppText>
          <AppText className="text-sm text-on-surface-variant mt-1">{authUser?.email}</AppText>
          <View className="mt-2 px-2 py-0.5 bg-secondary-container rounded self-center">
            <AppText weight="bold" className="text-xs text-on-secondary-container">
              {authUser?.role === 'admin' ? t.common.roleAdmin : t.common.roleTeacher}
            </AppText>
          </View>
        </View>

        <View className="mt-lg flex-row gap-sm">
          <View className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-sm items-center">
            <AppText weight="bold" className="text-2xl text-on-surface">
              {sessions.length}
            </AppText>
            <AppText className="text-xs text-on-surface-variant text-center mt-1">{t.profile.sessionsRecorded}</AppText>
          </View>
          <View className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-sm items-center">
            <AppText weight="bold" className="text-2xl text-on-surface">
              {classesCovered}
            </AppText>
            <AppText className="text-xs text-on-surface-variant text-center mt-1">{t.profile.classesCovered}</AppText>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/history')}
          className="mt-md bg-surface-container-lowest border border-outline-variant rounded-xl p-sm flex-row items-center justify-between active:opacity-80">
          <View className="flex-row items-center gap-sm">
            <MaterialIcons name="history" size={22} color={colors.onSurfaceVariant} />
            <AppText weight="bold" className="text-on-surface">
              {t.profile.viewHistory}
            </AppText>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </Pressable>

        <Pressable
          onPress={() => {
            logout();
            router.replace('/login');
          }}
          className="mt-lg self-center">
          <AppText weight="medium" className="text-sm text-on-surface-variant underline">
            {t.common.logout}
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}
