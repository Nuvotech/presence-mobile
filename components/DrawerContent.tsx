import { View, Pressable, Image } from 'react-native';
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../lib/i18n/useTranslation';
import { colors } from '../theme/tokens';
import { avatarUriFor } from '../lib/avatar';

type NavItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
};

function NavItem({ icon, label, onPress }: NavItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-sm px-container-margin py-3 active:bg-surface-container">
      <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center">
        <MaterialIcons name={icon} size={20} color={colors.onSurfaceVariant} />
      </View>
      <AppText weight="medium" className="text-base text-on-surface">
        {label}
      </AppText>
    </Pressable>
  );
}

export function DrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const authUser = useAppStore((s) => s.authUser);
  const logout = useAppStore((s) => s.logout);

  const go = (path: '/home' | '/history' | '/profile') => {
    props.navigation.closeDrawer();
    router.push(path);
  };

  const handleLogout = () => {
    props.navigation.closeDrawer();
    logout();
    router.replace('/login');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerClassName="flex-1 bg-surface" scrollEnabled={false}>
      <View className="flex-1">
        <View className="flex-row items-center gap-sm px-container-margin pt-md pb-lg border-b border-outline-variant">
          <View className="w-12 h-12 rounded-full overflow-hidden bg-surface-container">
            <Image source={{ uri: avatarUriFor(authUser?.name ?? '') }} className="w-full h-full" />
          </View>
          <View className="flex-1">
            <AppText weight="bold" className="text-base text-on-surface" numberOfLines={1}>
              {authUser?.name}
            </AppText>
            <AppText className="text-xs text-on-surface-variant" numberOfLines={1}>
              {authUser?.email}
            </AppText>
          </View>
        </View>

        <View className="mt-sm">
          <NavItem icon="home" label={t.drawer.home} onPress={() => go('/home')} />
          <NavItem icon="history" label={t.drawer.history} onPress={() => go('/history')} />
          <NavItem icon="person" label={t.drawer.profile} onPress={() => go('/profile')} />
        </View>
      </View>

      <View className="px-container-margin pb-lg gap-md">
        <LanguageSwitcher />
        <Pressable onPress={handleLogout} className="flex-row items-center gap-sm py-2 active:opacity-70">
          <MaterialIcons name="logout" size={20} color={colors.onSurfaceVariant} />
          <AppText weight="medium" className="text-sm text-on-surface-variant">
            {t.drawer.logout}
          </AppText>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}
