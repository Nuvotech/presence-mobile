import { useState } from "react";
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { AppText } from "../components/AppText";
import { PrimaryButton } from "../components/Buttons";
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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-container-margin pt-md pb-lg">
          <View className="flex-1 min-h-0" style={{ maxHeight: 70 }} />

          <View className="flex-row items-center gap-sm">
            <Animated.Image
              source={{ uri: logoUri }}
              className="h-16 w-16 rounded-xl"
            />
            <View>
              <AppText weight="extrabold" className="text-lg text-on-surface tracking-tight">
                {t.login.wordmark}
              </AppText>
              <AppText className="text-xs text-on-surface-variant mt-0.5">
                {t.login.subtitle}
              </AppText>
            </View>
          </View>

          <AppText weight="bold" className="text-xs text-on-tertiary-fixed-variant tracking-widest mt-8">
            {t.login.eyebrow}
          </AppText>
          <AppText weight="extrabold" className="text-3xl text-on-surface tracking-tight leading-9 mt-2">
            {t.login.headline}
          </AppText>
          <AppText className="text-sm text-on-surface-variant mt-2 max-w-[280px]">
            {t.login.tagline}
          </AppText>

          <View className="gap-2.5 mt-6">
            <View className="rounded-lg bg-surface-container flex-row items-center gap-3 px-4 py-3">
              <MaterialIcons name="mail-outline" size={20} color={colors.outline} />
              <View className="flex-1">
                <AppText weight="bold" className="text-[10px] text-on-surface-variant tracking-widest">
                  {t.login.emailLabel.toUpperCase()}
                </AppText>
                <TextInput
                  className="text-[14.5px] font-archivo-bold text-on-surface -mt-0.5 p-0"
                  placeholder={t.login.emailPlaceholder}
                  placeholderTextColor={colors.outline}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View className="rounded-lg bg-surface-container flex-row items-center gap-3 px-4 py-3">
              <MaterialIcons name="lock-outline" size={20} color={colors.outline} />
              <View className="flex-1">
                <AppText weight="bold" className="text-[10px] text-on-surface-variant tracking-widest">
                  {t.login.passwordLabel.toUpperCase()}
                </AppText>
                <TextInput
                  className="text-base font-archivo-extrabold text-on-surface -mt-0.5 p-0"
                  style={{ letterSpacing: showPassword ? 0 : 3 }}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              <Pressable onPress={() => setShowPassword((v) => !v)}>
                <AppText weight="extrabold" className="text-xs text-on-tertiary-fixed-variant">
                  {showPassword ? t.login.hidePassword : t.login.showPassword}
                </AppText>
              </Pressable>
            </View>

            {error && <AppText className="text-sm text-error">{error}</AppText>}

            <PrimaryButton
              label={t.login.submit}
              onPress={handleLogin}
              loading={isLoading}
              className="w-full mt-1"
            />
          </View>

          <AppText weight="medium" className="mt-md text-sm text-on-surface-variant text-center underline">
            {t.login.forgotPassword}
          </AppText>

          <View className="flex-1 min-h-2.5" />

          <View className="flex-row gap-2">
            <View className="flex-1 h-1.5 rounded-full bg-secondary-container" />
            <View className="flex-1 h-1.5 rounded-full bg-tertiary-fixed" />
            <View className="flex-1 h-1.5 rounded-full bg-avatar-gold" />
            <View className="flex-1 h-1.5 rounded-full bg-avatar-sky" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
