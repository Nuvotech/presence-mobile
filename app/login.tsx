import { useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { AppText } from '../components/AppText';
import { TextField } from '../components/TextField';
import { colors } from '../theme/tokens';
import { logoUri } from '../data/students';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const spin = useSharedValue(0);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const handleLogin = () => {
    setIsLoading(true);
    spin.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1);
    setTimeout(() => router.replace('/home'), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center px-container-margin">
        <View className="w-full max-w-[400px] bg-surface-container-lowest border border-surface-variant rounded-xl p-lg items-center">
          <View className="items-center mb-xl">
            <Animated.Image source={{ uri: logoUri }} className="h-16 w-16 mb-4" />
            <AppText weight="bold" className="text-2xl text-primary tracking-tight">
              SchoolClock
            </AppText>
            <AppText className="text-base text-on-surface-variant mt-1">Teacher Portal Access</AppText>
          </View>

          <View className="w-full gap-md">
            <TextField
              label="Teacher Email"
              icon="mail"
              placeholder="name@school.edu"
              defaultValue="henderson@school.edu"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextField label="Password" icon="lock" secureTextEntry defaultValue="password123" />

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-primary rounded-lg items-center justify-center flex-row active:opacity-90">
              {isLoading ? (
                <Animated.View style={spinnerStyle}>
                  <MaterialIcons name="sync" size={22} color={colors.onPrimary} />
                </Animated.View>
              ) : (
                <AppText weight="bold" className="text-on-primary text-base">
                  Log In
                </AppText>
              )}
            </Pressable>
          </View>

          <AppText weight="medium" className="mt-lg text-sm text-on-surface-variant underline">
            Forgot password?
          </AppText>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
