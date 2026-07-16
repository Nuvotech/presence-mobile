import { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AppText } from '../../components/AppText';

export default function ErrorFeedback() {
  const router = useRouter();
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-16, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );
  }, [bounce]);

  const bounceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bounce.value }] }));

  return (
    <SafeAreaView className="flex-1 bg-[#ef4444] items-center justify-center px-container-margin">
      <Animated.View style={bounceStyle} className="mb-8">
        <MaterialIcons name="cancel" size={120} color="#ffffff" />
      </Animated.View>
      <AppText weight="bold" className="text-[32px] text-white mb-2 text-center">
        Card not recognized.
      </AppText>
      <AppText className="text-lg text-white/90 mb-12 text-center">
        Please check the card or contact the office.
      </AppText>

      <View className="w-full max-w-xs gap-4">
        <Pressable
          onPress={() => router.replace('/scanner')}
          className="w-full h-14 bg-white rounded-xl flex-row items-center justify-center gap-2 active:opacity-90">
          <MaterialIcons name="arrow-back" size={20} color="#ef4444" />
          <AppText weight="bold" className="text-[#ef4444]">
            Try Again
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/register')}
          className="w-full h-12 border border-white/40 rounded-xl items-center justify-center active:bg-white/10">
          <AppText weight="bold" className="text-white">
            Dismiss
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
