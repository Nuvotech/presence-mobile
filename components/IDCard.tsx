import { View, Image } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { MaterialIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { AppText } from "./AppText";
import { colors } from "../theme/tokens";
import { useTranslation } from "../lib/i18n/useTranslation";

const QR_SIZE = 168;

type IDCardProps = {
  name?: string;
  grade?: string;
  studentId?: string;
  qrToken?: string;
  photoUri?: string;
  initials?: string;
  color?: string;
};

export function IDCard({
  name = "Thabo Mokoena",
  grade = "Grade 5B",
  studentId = "SC-2024-8841",
  qrToken,
  photoUri,
  initials = "??",
  color = "bg-secondary-container",
}: IDCardProps) {
  const { t } = useTranslation();
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
        className="w-[300px] bg-white rounded-2xl border border-surface-variant overflow-hidden"
      >
        <View className="flex-row items-center gap-sm px-sm pt-sm pb-2">
          <View className="w-11 h-11 rounded-[999px] overflow-hidden border border-outline-variant/50 bg-surface-container-low items-center justify-center">
            {photoUri ? (
              <Image source={{ uri: photoUri }} className="w-full h-full" />
            ) : (
              <View className={`w-full h-full items-center justify-center ${color}`}>
                <AppText weight="bold" className="text-base">
                  {initials}
                </AppText>
              </View>
            )}
          </View>
          <View className="flex-1">
            <AppText
              weight="bold"
              className="text-base text-on-surface leading-tight"
              numberOfLines={1}
            >
              {name}
            </AppText>
            <View className="mt-0.5 px-2 py-0.5 bg-secondary-container rounded self-start">
              <AppText weight="bold" className="text-[11px] text-on-secondary-container">
                {grade}
              </AppText>
            </View>
          </View>
        </View>

        <View className="h-px bg-outline-variant mx-sm" />

        <View className="items-center py-md px-sm">
          {qrToken ? (
            <View className="p-sm bg-white rounded-xl border border-outline-variant/60">
              <QRCode
                value={qrToken}
                size={QR_SIZE}
                color={colors.primary}
                backgroundColor="#ffffff"
                ecl="H"
              />
            </View>
          ) : (
            <View
              style={{ width: QR_SIZE, height: QR_SIZE }}
              className="items-center justify-center bg-surface-container-low rounded-xl border border-outline-variant/60 p-sm"
            >
              <MaterialIcons name="qr-code-2" size={40} color={colors.outline} />
              <AppText className="text-xs text-on-surface-variant text-center mt-1">
                {t.idCard.qrUnavailable}
              </AppText>
            </View>
          )}
          <AppText
            weight="medium"
            className="text-xs text-on-surface-variant mt-sm tracking-wide"
          >
            {studentId}
          </AppText>
        </View>

        <View className="bg-surface-container-low px-sm py-2">
          <AppText className="text-[10px] text-on-surface-variant text-center leading-tight">
            {t.idCard.presentEachMorning}
          </AppText>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
