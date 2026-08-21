import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { useTranslation } from '../../lib/i18n/useTranslation';

export default function SuccessFeedback() {
  const router = useRouter();
  const { t } = useTranslation();
  const { name, grade, time } = useLocalSearchParams<{ name?: string; grade?: string; time?: string }>();
  const iconScale = useSharedValue(0.8);
  const iconOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const pillOpacity = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.2)) });
    iconOpacity.value = withTiming(1, { duration: 300 });
    textOpacity.value = withDelay(150, withTiming(1, { duration: 400 }));
    pillOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
  }, [iconScale, iconOpacity, textOpacity, pillOpacity]);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const pillStyle = useAnimatedStyle(() => ({ opacity: pillOpacity.value }));

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => router.replace('/scanner'), 2500);
      return () => clearTimeout(timer);
    }, [router])
  );

  return (
    <SafeAreaView className="flex-1 bg-attendance-success items-center justify-center px-container-margin">
      <Animated.View
        style={iconStyle}
        className="bg-white/20 rounded-[999px] p-md mb-8"
        >
        <MaterialIcons name="check-circle" size={96} color="#ffffff" />
      </Animated.View>
      <Animated.View style={textStyle} className="items-center gap-1">
        <AppText weight="bold" className="text-[32px] text-white leading-tight">
          {name}
        </AppText>
        <AppText className="text-xl text-white/90">{grade}</AppText>
        <AppText weight="bold" className="text-2xl text-white/80 mt-2">
          {time}
        </AppText>
      </Animated.View>
      <Animated.View style={pillStyle} className="mt-12">
        <View className="flex-row items-center gap-2 bg-white/10 px-sm py-xs rounded-full border border-white/20">
          <MaterialIcons name="notifications-active" size={16} color="#ffffff" />
          <AppText weight="medium" className="text-xs uppercase tracking-widest text-white">
            {t.scanResult.parentNotified}
          </AppText>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
