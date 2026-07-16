import '../global.css';
import { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
} from '@expo-google-fonts/hanken-grotesk';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
  });
  const ready = fontsLoaded || !!fontsError;

  const onLayoutRootView = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync();
    }
  }, [ready]);

  useEffect(() => {
    if (fontsError) {
      console.error('Font loading failed, continuing without custom fonts:', fontsError);
    }
    onLayoutRootView().catch((err) => console.error('Failed to hide splash screen:', err));
  }, [onLayoutRootView, fontsError]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View className="flex-1 bg-background">
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="home" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="class-scanner" />
            <Stack.Screen name="register" />
            <Stack.Screen name="scanner" />
            <Stack.Screen name="id-card" />
            <Stack.Screen name="register-student" />
            <Stack.Screen name="history" />
            <Stack.Screen name="history/[id]" />
            <Stack.Screen
              name="scan-result/success"
              options={{ presentation: 'fullScreenModal', animation: 'fade' }}
            />
            <Stack.Screen
              name="scan-result/duplicate"
              options={{ presentation: 'fullScreenModal', animation: 'fade' }}
            />
            <Stack.Screen
              name="scan-result/error"
              options={{ presentation: 'fullScreenModal', animation: 'fade' }}
            />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
