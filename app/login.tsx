import { useEffect, useState } from "react";
import {
  View,
  Image,
  Pressable,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { AppText } from "../components/AppText";
import { PrimaryButton } from "../components/Buttons";
import { TextField } from "../components/TextField";
import { colors } from "../theme/tokens";
import { logoUri } from "../data/students";
import { useAppStore } from "../store/useAppStore";
import { useTranslation } from "../lib/i18n/useTranslation";
import { SegmentedControl } from "../components/SegmentedControl";
import { AuthError, fetchMe, login as apiLogin } from "../lib/auth";
import { parentLogin } from "../lib/parent";

type LoginMode = "staff" | "parent";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const setParentGuardian = useAppStore((s) => s.setParentGuardian);
  const [mode, setMode] = useState<LoginMode>("staff");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () =>
      setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "parent") {
        const guardian = await parentLogin(phone.trim(), password);
        setParentGuardian(guardian);

        router.replace(
          guardian.must_change_password ? "/parent/password" : "/parent/home",
        );
        return;
      }

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
        behavior="padding"
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-container-margin py-lg"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <Image
            source={logoUri}
            className={`self-center ${isKeyboardVisible ? "h-20" : "h-56"}`}
            style={{ aspectRatio: 508 / 670 }}
            resizeMode="contain"
          />

          <SegmentedControl<LoginMode>
            segments={[
              { key: "staff", label: t.login.staffMode },
              { key: "parent", label: t.login.parentMode },
            ]}
            value={mode}
            onChange={(next) => {
              setMode(next);
              setError(null);
            }}
            className="mt-6"
          />

          <View className="mt-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <AppText weight="extrabold" className="text-xl text-on-surface">
              {mode === "parent" ? t.login.parentSubtitle : t.login.subtitle}
            </AppText>
            <AppText className="text-sm text-on-surface-variant mt-1">
              {mode === "parent" ? t.login.parentTagline : t.login.tagline}
            </AppText>

            <View className="gap-4 mt-6">
              {mode === "parent" ? (
                <TextField
                  label={t.login.phoneLabel}
                  placeholder={t.login.phonePlaceholder}
                  value={phone}
                  onChangeText={setPhone}
                  autoComplete="tel"
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              ) : (
                <TextField
                  label={t.login.emailLabel}
                  placeholder={t.login.emailPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              )}

              <View className="relative">
                <TextField
                  label={t.login.passwordLabel}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  className="pr-12"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? t.login.hidePassword : t.login.showPassword
                  }
                  hitSlop={8}
                  className="absolute right-0 bottom-0 h-12 w-12 items-center justify-center"
                >
                  <MaterialIcons
                    name={showPassword ? "visibility-off" : "visibility"}
                    size={20}
                    color={colors.outline}
                  />
                </Pressable>
              </View>

              {error && (
                <View className="flex-row items-center gap-2 rounded-lg bg-error-container px-3 py-2.5">
                  <MaterialIcons
                    name="error-outline"
                    size={18}
                    color={colors.error}
                  />
                  <AppText className="flex-1 text-sm text-error">{error}</AppText>
                </View>
              )}

              <PrimaryButton
                label={t.login.submit}
                onPress={handleLogin}
                loading={isLoading}
                className="w-full mt-2"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
