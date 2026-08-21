import { useState } from "react";
import { View, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { AppText } from "../components/AppText";
import { TextField } from "../components/TextField";
import { colors } from "../theme/tokens";
import { logoUri } from "../data/students";
import { useAppStore } from "../store/useAppStore";
import { useTranslation } from "../lib/i18n/useTranslation";
import { AuthError, fetchMe, login as apiLogin } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const spin = useSharedValue(0);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    spin.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
    );

    try {
      await apiLogin(email.trim(), password);
      const authUser = await fetchMe();
      setAuthUser(authUser);

      router.replace("/home");
    } catch (err) {
      if (err instanceof AuthError) {
        setError(
          err.code === "invalid_credentials"
            ? t.login.invalidCredentialsError
            : t.login.networkError,
        );
      } else {
        setError(t.login.genericError);
      }
    } finally {
      spin.value = 0;
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 items-center justify-center px-container-margin"
      >
        <View className="w-full max-w-[400px] bg-surface-container-lowest border border-surface-variant rounded-xl p-lg items-center">
          <View className="items-center mb-xl">
            <Animated.Image
              source={{ uri: logoUri }}
              className="h-16 w-16 mb-4"
            />
            <AppText
              weight="bold"
              className="text-2xl text-primary tracking-tight"
            >
              {t.login.wordmark}
            </AppText>
            <AppText className="text-base text-on-surface-variant mt-1">
              {t.login.subtitle}
            </AppText>
          </View>

          <View className="w-full gap-md">
            <TextField
              label={t.login.emailLabel}
              icon="mail"
              placeholder={t.login.emailPlaceholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextField
              label={t.login.passwordLabel}
              icon="lock"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error && (
              <AppText className="text-sm text-error">{error}</AppText>
            )}

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-primary rounded-lg items-center justify-center flex-row active:opacity-90"
            >
              {isLoading ? (
                <Animated.View style={spinnerStyle}>
                  <MaterialIcons
                    name="sync"
                    size={22}
                    color={colors.onPrimary}
                  />
                </Animated.View>
              ) : (
                <AppText weight="bold" className="text-on-primary text-base">
                  {t.login.submit}
                </AppText>
              )}
            </Pressable>
          </View>

          <AppText
            weight="medium"
            className="mt-lg text-sm text-on-surface-variant underline"
          >
            {t.login.forgotPassword}
          </AppText>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
