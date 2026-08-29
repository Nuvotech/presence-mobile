import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/tokens';

const OUTER_SIZE = 250;
const INNER_SIZE = 170;

export function ScanFrame() {
  const scanLineY = useSharedValue(0);

  useEffect(() => {
    scanLineY.value = withRepeat(
      withTiming(INNER_SIZE, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [scanLineY]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  return (
    <View
      style={{ width: OUTER_SIZE, height: OUTER_SIZE, backgroundColor: '#3B3350' }}
      className="rounded-[36px] items-center justify-center overflow-hidden">
      <View
        style={{ width: INNER_SIZE, height: INNER_SIZE, borderWidth: 3, borderColor: colors.tertiaryFixed }}
        className="rounded-[22px] overflow-hidden relative">
        <Animated.View
          style={[
            scanLineStyle,
            { shadowColor: colors.tertiaryFixed, shadowOpacity: 1, shadowRadius: 10 },
          ]}
          className="h-[3px] bg-tertiary-fixed absolute w-full left-0 top-0 rounded-full"
        />
      </View>
    </View>
  );
}
