import { View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { colors } from '../theme/tokens';
import { studentPhotoUri } from '../data/students';

const qrGrid = [
  [1, 1, 0, 1, 1],
  [1, 0, 1, 0, 1],
  [0, 1, 1, 1, 0],
  [1, 0, 1, 0, 1],
  [1, 1, 0, 1, 1],
];

type IDCardProps = {
  name?: string;
  grade?: string;
  studentId?: string;
  photoUri?: string;
  initials?: string;
  color?: string;
};

export function IDCard({
  name = 'Thabo Mokoena',
  grade = 'Grade 5B',
  studentId = 'SC-2024-8841',
  photoUri,
  initials,
  color = 'bg-secondary-container',
}: IDCardProps) {
  const resolvedPhotoUri = photoUri ?? (initials ? undefined : studentPhotoUri);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      rotateY.value = (e.translationX / 150) * -8;
      rotateX.value = (e.translationY / 150) * 8;
    })
    .onEnd(() => {
      rotateX.value = withSpring(0);
      rotateY.value = withSpring(0);
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={cardAnimatedStyle}
        className="w-[300px] h-[480px] bg-white rounded-2xl border border-surface-variant overflow-hidden">
        <LinearGradient
          colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
          style={{ position: 'absolute', inset: 0, zIndex: 10 }}
        />

        <View className="pt-sm px-sm pb-xs items-center">
          <View className="flex-row items-center gap-1 mb-md">
            <MaterialIcons name="watch" size={28} color={colors.primary} />
            <AppText weight="extrabold" className="text-xl text-primary">
              SchoolClock
            </AppText>
          </View>
        </View>

        <View className="px-sm flex-row items-start gap-sm mt-xs">
          <View className="w-28 h-28 bg-surface-container-low border border-outline-variant rounded overflow-hidden items-center justify-center">
            {resolvedPhotoUri ? (
              <Image source={{ uri: resolvedPhotoUri }} className="w-full h-full" />
            ) : (
              <View className={`w-full h-full items-center justify-center ${color}`}>
                <AppText weight="bold" className="text-3xl">
                  {initials}
                </AppText>
              </View>
            )}
          </View>
          <View className="pt-xs flex-1">
            <AppText weight="semibold" className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">
              Student
            </AppText>
            <AppText weight="bold" className="text-xl text-on-surface leading-tight">
              {name}
            </AppText>
            <View className="mt-xs px-2 py-0.5 bg-secondary-container rounded self-start">
              <AppText weight="bold" className="text-xs text-on-secondary-container">
                {grade}
              </AppText>
            </View>
            <AppText className="text-xs text-on-surface-variant mt-sm">ID: {studentId}</AppText>
          </View>
        </View>

        <View className="flex-grow justify-end px-sm">
          <View className="h-px bg-outline-variant w-full my-sm" />
        </View>

        <View className="px-sm pb-sm flex-row justify-between items-end">
          <AppText className="text-[10px] text-on-surface-variant leading-tight max-w-[120px]">
            Property of SchoolClock Institution.
          </AppText>
          <View className="p-1 bg-white border-2 border-primary rounded-lg">
            <View className="w-20 h-20 bg-white flex-row flex-wrap p-1">
              {qrGrid.flatMap((row, ri) =>
                row.map((cell, ci) => (
                  <View
                    key={`${ri}-${ci}`}
                    style={{ width: '20%', height: '20%' }}
                    className={cell ? 'bg-primary' : 'bg-white'}
                  />
                ))
              )}
            </View>
          </View>
        </View>

        <View className="h-10 bg-primary items-center justify-center px-sm mt-auto">
          <AppText className="text-[11px] text-white/90 text-center">
            Scan each morning at the door
          </AppText>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
