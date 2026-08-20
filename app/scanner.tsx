import { useCallback, useEffect, useRef } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
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
import { useAppStore } from '../store/useAppStore';
import { scanStudent } from '../lib/sessions';

const FRAME_SIZE = 256;

const formatTime = (iso: string | null) =>
  new Date(iso ?? Date.now()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export default function ScannerPage() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const session = useAppStore((s) => s.activeSession());
  const markStudentPresent = useAppStore((s) => s.markStudentPresent);
  const ensureSessionOpen = useAppStore((s) => s.ensureSessionOpen);
  const classes = useAppStore((s) => s.classes);
  const studentsByClass = useAppStore((s) => s.studentsByClass);
  const scanLineY = useSharedValue(0);
  const busyRef = useRef(false);

  const classInfo = session ? classes.find((c) => c.id === session.classId) : undefined;
  const roster = session ? (studentsByClass[session.classId] ?? []) : [];
  const presentCount = session ? Object.values(session.attendance).filter((a) => a.present).length : 0;
  const total = roster.length;

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  useEffect(() => {
    scanLineY.value = withRepeat(withTiming(FRAME_SIZE, { duration: 2000, easing: Easing.linear }), -1, false);
  }, [scanLineY]);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useFocusEffect(
    useCallback(() => {
      busyRef.current = false;
      return () => {
        busyRef.current = true;
      };
    }, [])
  );

  const handleBarcodeScanned = useCallback(
    async ({ data }: BarcodeScanningResult) => {
      if (busyRef.current || !session) return;
      busyRef.current = true;

      try {
        const remoteId = await ensureSessionOpen(session.id);
        if (remoteId === null) {
          router.push('/scan-result/error');
          return;
        }

        const result = await scanStudent(remoteId, data);

        if (result.status === 'not_found' || !result.student) {
          router.push('/scan-result/error');
          return;
        }

        const time = formatTime(result.record?.arrived_at ?? null);

        if (result.status === 'duplicate') {
          router.push({
            pathname: '/scan-result/duplicate',
            params: { name: result.student.name, time },
          });
          return;
        }

        markStudentPresent(session.id, result.student.id, time);
        router.push({
          pathname: '/scan-result/success',
          params: { name: result.student.name, grade: classInfo?.name ?? '', time },
        });
      } catch {
        router.push('/scan-result/error');
      }
    },
    [session, classInfo, ensureSessionOpen, markStudentPresent, router]
  );

  return (
    <View className="flex-1 bg-background">
      <Header title="Scanner un élève" backButton />
      <View className="flex-1 bg-black items-center justify-center relative overflow-hidden">
        {permission?.granted ? (
          <CameraView
            style={{ position: 'absolute', inset: 0 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
        ) : (
          <View className="absolute inset-0 bg-[#0a0a0a] items-center justify-center opacity-60">
            <MaterialIcons name="qr-code-scanner" size={140} color={colors.surfaceVariant} />
          </View>
        )}

        {!permission?.granted && (
          <View className="absolute inset-0 items-center justify-center px-container-margin" pointerEvents="box-none">
            <Pressable
              onPress={requestPermission}
              className="bg-white/10 px-4 py-3 rounded-xl">
              <AppText className="text-white text-sm text-center">
                {permission && !permission.canAskAgain
                  ? "Accès à la caméra refusé. Activez-le dans les réglages de l'appareil pour scanner."
                  : "Appuyez pour activer l'accès à la caméra"}
              </AppText>
            </Pressable>
          </View>
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
            Alignez le code QR dans le cadre
          </AppText>
        </View>
      </View>

      <View className="bg-surface p-container-margin gap-sm">
        <View className="bg-surface-container-lowest border border-outline-variant p-sm rounded-xl flex-row items-center justify-between">
          <View className="flex-row items-center gap-sm">
            <View className="w-12 h-12 rounded-[999px] bg-secondary-container items-center justify-center">
              <MaterialIcons name="group" size={22} color={colors.onSecondaryContainer} />
            </View>
            <View>
              <AppText weight="bold" className="text-primary">
                {presentCount} élèves
              </AppText>
              <AppText className="text-sm text-on-surface-variant">Scannés aujourd'hui</AppText>
            </View>
          </View>
          <View className="items-end">
            <AppText className="text-sm text-on-primary-container">Objectif : {total}</AppText>
            <View className="w-24 h-2 bg-surface-container-high rounded-full mt-2 overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{ width: `${total ? Math.round((presentCount / total) * 100) : 0}%` }}
              />
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/register')}
          className="w-full bg-primary h-12 rounded-xl flex-row items-center justify-center gap-2 active:opacity-90">
          <MaterialIcons name="list-alt" size={20} color={colors.onPrimary} />
          <AppText weight="bold" className="text-on-primary">
            Voir le registre
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
