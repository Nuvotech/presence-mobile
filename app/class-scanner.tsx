import { useCallback, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Header } from '../components/Header';
import { AppText } from '../components/AppText';
import { colors } from '../theme/tokens';
import { classes } from '../data/classes';
import { useAppStore } from '../store/useAppStore';

const FRAME_SIZE = 256;

export default function ClassScannerPage() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const checkInClass = useAppStore((s) => s.checkInClass);
  const scanLineY = useSharedValue(0);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  useEffect(() => {
    scanLineY.value = withRepeat(withTiming(FRAME_SIZE, { duration: 2000, easing: Easing.linear }), -1, false);
  }, [scanLineY]);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        const classInfo = classes[Math.floor(Math.random() * classes.length)];
        checkInClass(classInfo);
        router.replace('/register');
      }, 2500);
      return () => clearTimeout(timer);
    }, [router, checkInClass])
  );

  return (
    <View className="flex-1 bg-background">
      <Header title="Scan a Class" backButton />
      <View className="flex-1 bg-black items-center justify-center relative overflow-hidden">
        {permission?.granted ? (
          <CameraView style={{ position: 'absolute', inset: 0 }} facing="back" />
        ) : (
          <View className="absolute inset-0 bg-[#0a0a0a] items-center justify-center opacity-60">
            <MaterialIcons name="qr-code-scanner" size={140} color={colors.surfaceVariant} />
          </View>
        )}

        {!permission?.granted && (
          <Pressable
            onPress={requestPermission}
            className="absolute top-6 self-center bg-white/10 px-4 py-2 rounded-full">
            <AppText className="text-white text-sm">Tap to enable camera access</AppText>
          </Pressable>
        )}

        <View className="w-64 h-64 relative z-10 rounded-lg overflow-hidden" style={{ borderWidth: 2, borderColor: 'white' }}>
          <Animated.View
            className="h-0.5 bg-white absolute w-full left-0 top-0"
            style={[scanLineStyle, { shadowColor: '#fff', shadowOpacity: 1, shadowRadius: 10 }]}
          />
          <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
          <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
          <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
          <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
        </View>

        <View className="absolute bottom-12 self-center z-20 px-container-margin">
          <AppText weight="medium" className="text-sm text-white bg-black/40 py-2 px-4 rounded-full overflow-hidden">
            Align the class QR code within the frame
          </AppText>
        </View>
      </View>
    </View>
  );
}
