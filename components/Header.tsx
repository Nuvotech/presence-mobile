import { View, Pressable, Image } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../lib/i18n/useTranslation';
import { colors } from '../theme/tokens';
import { avatarUriFor } from '../lib/avatar';

type HeaderProps = {
  title?: string;
  backButton?: boolean;
};

export function Header({ title, backButton = false }: HeaderProps) {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<Record<string, object | undefined>>>();
  const insets = useSafeAreaInsets();
  const authUser = useAppStore((s) => s.authUser);
  const { t } = useTranslation();
  const avatarUri = avatarUriFor(authUser?.name ?? '');
  return (
    <View className="w-full bg-surface border-b border-outline-variant" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-container-margin h-16">
        <View className="flex-row items-center gap-2 flex-1">
          {backButton ? (
            <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-surface-container">
              <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => navigation.openDrawer()}
              className="p-2 -ml-2 rounded-full active:bg-surface-container">
              <MaterialIcons name="menu" size={24} color={colors.primary} />
            </Pressable>
          )}
          <AppText weight="bold" className="text-xl text-primary ml-2" numberOfLines={1}>
            {title ?? t.common.appTitle}
          </AppText>
        </View>
        <Pressable
          onPress={() => router.push('/profile')}
          className="w-10 h-10 rounded-[999px] bg-surface-container overflow-hidden border border-outline-variant active:opacity-80">
          <Image source={{ uri: avatarUri }} className="w-full h-full" />
        </Pressable>
      </View>
    </View>
  );
}
