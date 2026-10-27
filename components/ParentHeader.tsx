import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/tokens';

type ParentHeaderProps = {
  title: string;
  backButton?: boolean;
  showActions?: boolean;
};

// The parent section's header: no drawer, just back (or nothing), a title,
// and on top-level screens a notifications bell with unread badge + account.
export function ParentHeader({ title, backButton = false, showActions = false }: ParentHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const unreadCount = useAppStore((s) => s.parentUnreadCount);

  return (
    <View className="w-full bg-surface border-b border-outline-variant" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-container-margin h-16">
        <View className="flex-row items-center gap-2 flex-1">
          {backButton && (
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-surface-container items-center justify-center active:opacity-80">
              <MaterialIcons name="arrow-back" size={22} color={colors.primary} />
            </Pressable>
          )}
          <AppText weight="bold" className={`text-xl text-primary ${backButton ? 'ml-2' : ''}`} numberOfLines={1}>
            {title}
          </AppText>
        </View>

        {showActions && (
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push('/parent/notifications')}
              accessibilityRole="button"
              className="w-10 h-10 rounded-full bg-surface-container items-center justify-center active:opacity-80">
              <MaterialIcons name="notifications-none" size={22} color={colors.primary} />
              {unreadCount > 0 && (
                <View className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-error items-center justify-center">
                  <AppText weight="bold" className="text-[10px] text-on-error">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </AppText>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => router.push('/parent/account')}
              accessibilityRole="button"
              className="w-10 h-10 rounded-full bg-surface-container items-center justify-center active:opacity-80">
              <MaterialIcons name="person-outline" size={22} color={colors.primary} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
