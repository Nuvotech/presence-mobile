import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ParentHeader } from '../../components/ParentHeader';
import { AppText } from '../../components/AppText';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { colors } from '../../theme/tokens';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { parentLogout } from '../../lib/parent';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <AppText className="text-sm text-on-surface-variant">{label}</AppText>
      <AppText weight="medium" className="text-sm text-on-surface">
        {value}
      </AppText>
    </View>
  );
}

export default function ParentAccountPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const guardian = useAppStore((s) => s.parentGuardian);
  const pushToken = useAppStore((s) => s.parentPushToken);
  const setParentGuardian = useAppStore((s) => s.setParentGuardian);

  const handleLogout = async () => {
    try {
      await parentLogout(pushToken);
    } catch {
      // The local session is cleared regardless.
    }
    setParentGuardian(null);
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-background">
      <ParentHeader title={t.parent.accountTitle} backButton />
      <ScrollView contentContainerClassName="px-container-margin pt-lg pb-24">
        <AppText weight="extrabold" className="text-2xl text-on-surface">
          {guardian?.name}
        </AppText>

        <View className="mt-md rounded-lg border border-outline-variant bg-surface-container-lowest px-sm">
          {guardian?.school && <InfoRow label={t.parent.schoolLabel} value={guardian.school.name} />}
          <View className="h-px bg-outline-variant" />
          <InfoRow label={t.parent.phoneLabel} value={guardian?.phone ?? ''} />
        </View>

        <View className="mt-md rounded-lg border border-outline-variant bg-surface-container-lowest px-sm">
          <View className="flex-row items-center justify-between py-3">
            <AppText className="text-sm text-on-surface-variant">{t.parent.languageLabel}</AppText>
            <LanguageSwitcher />
          </View>
          <View className="h-px bg-outline-variant" />
          <Pressable
            onPress={() => router.push('/parent/password')}
            className="flex-row items-center justify-between py-3 active:opacity-70">
            <AppText weight="medium" className="text-sm text-on-surface">
              {t.parent.changePassword}
            </AppText>
            <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <Pressable onPress={handleLogout} className="mt-lg flex-row items-center justify-center gap-2 py-3 active:opacity-70">
          <MaterialIcons name="logout" size={20} color={colors.error} />
          <AppText weight="bold" className="text-sm text-error">
            {t.parent.logout}
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}
