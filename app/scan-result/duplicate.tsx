import { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { colors } from '../../theme/tokens';
import { useTranslation } from '../../lib/i18n/useTranslation';

export default function DuplicateWarning() {
  const router = useRouter();
  const { t } = useTranslation();
  const { name, time } = useLocalSearchParams<{ name?: string; time?: string }>();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(0.6, { duration: 800 }), withTiming(1, { duration: 800 })), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <SafeAreaView className="flex-1 bg-warning items-center justify-between px-container-margin py-xl">
      <View className="flex-row items-center justify-between w-full h-16">
        <Pressable onPress={() => router.replace('/scanner')} className="p-2 -ml-2 rounded-full active:bg-white/10">
          <MaterialIcons name="close" size={28} color="#ffffff" />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="qr-code-scanner" size={20} color="#ffffff" />
          <AppText weight="bold" className="text-xl text-white">
            {t.scanResult.duplicateTitle}
          </AppText>
        </View>
        <View className="w-10" />
      </View>

      <View className="items-center">
        <Animated.View style={pulseStyle} className="mb-lg p-8 bg-white/20 rounded-[999px]">
          <MaterialIcons name="warning" size={96} color="#ffffff" />
        </Animated.View>
        <AppText weight="extrabold" className="text-[32px] text-white mb-2">
          {name}
        </AppText>
        <AppText className="text-lg text-white/90 text-center max-w-[280px]">
          {t.scanResult.duplicateAlreadyMarked(time ?? '')}
        </AppText>

        <View className="mt-8 bg-white/10 border border-white/20 p-sm rounded-xl w-full">
          <View className="flex-row items-center justify-between">
            <View>
              <AppText className="text-[10px] uppercase tracking-wider text-white/70">{t.scanResult.duplicateStatusLabel}</AppText>
              <AppText weight="bold" className="text-lg text-white">
                {t.scanResult.duplicateStatusValue}
              </AppText>
            </View>
            <View className="h-10 w-10 items-center justify-center bg-white rounded-[999px]">
              <MaterialIcons name="history" size={20} color={colors.warning} />
            </View>
          </View>
        </View>
      </View>

      <View className="w-full gap-sm">
        <Pressable
          onPress={() => router.replace('/scanner')}
          className="w-full h-14 bg-white rounded-xl flex-row items-center justify-center gap-2 active:opacity-90">
          <MaterialIcons name="qr-code-scanner" size={20} color={colors.warning} />
          <AppText weight="bold" className="text-warning">
            {t.scanResult.duplicateScanNext}
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/register')}
          className="w-full h-14 border-2 border-white/40 rounded-xl flex-row items-center justify-center gap-2 active:bg-white/10">
          <MaterialIcons name="edit" size={20} color="#ffffff" />
          <AppText weight="bold" className="text-white">
            {t.scanResult.duplicateForce}
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
