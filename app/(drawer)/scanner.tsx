import { useCallback, useEffect, useRef } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AppText } from '../../components/AppText';
import { ScanFrame } from '../../components/ScanFrame';
import { colors } from '../../theme/tokens';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { scanFailureReason, scanStudent, type ScanFailureReason } from '../../lib/sessions';

const formatTime = (iso: string | null) =>
  new Date(iso ?? Date.now()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export default function ScannerPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const session = useAppStore((s) => s.activeSession());
  const markStudentPresent = useAppStore((s) => s.markStudentPresent);
  const ensureSessionOpen = useAppStore((s) => s.ensureSessionOpen);
  const classes = useAppStore((s) => s.classes);
  const studentsByClass = useAppStore((s) => s.studentsByClass);
  const busyRef = useRef(false);

  const classInfo = session ? classes.find((c) => c.id === session.classId) : undefined;
  const roster = session ? (studentsByClass[session.classId] ?? []) : [];
  const presentCount = session ? Object.values(session.attendance).filter((a) => a.present).length : 0;
  const total = roster.length;

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

      const showError = (reason: ScanFailureReason) =>
        router.push({ pathname: '/scan-result/error', params: { reason } });

      try {
        const remoteId = await ensureSessionOpen(session.id);
        if (remoteId === null) {
          showError('session_unavailable');
          return;
        }

        const result = await scanStudent(remoteId, data);

        if (result.status === 'not_found' || !result.student) {
          showError(result.reason ?? 'invalid_card');
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
      } catch (error) {
        showError(scanFailureReason(error));
      }
    },
    [session, classInfo, ensureSessionOpen, markStudentPresent, router]
  );

  return (
    <View className="flex-1 bg-background">
      {classInfo ? (
        <View className="flex-1 bg-primary relative overflow-hidden">
          {permission?.granted && (
            <CameraView
              style={{ position: 'absolute', inset: 0 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarcodeScanned}
            />
          )}

          <View style={{ paddingTop: insets.top }} className="px-container-margin pt-sm pb-2 flex-row items-center gap-sm">
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-white/15 items-center justify-center">
              <MaterialIcons name="arrow-back" size={20} color="#ffffff" />
            </Pressable>
            <AppText weight="extrabold" className="text-lg text-white flex-1" numberOfLines={1}>
              {t.scanner.scanningClass(classInfo.name)}
            </AppText>
            <View className="bg-tertiary-fixed px-3 py-1.5 rounded-md">
              <AppText weight="extrabold" className="text-xs text-on-tertiary-fixed-variant">
                {presentCount}/{total}
              </AppText>
            </View>
          </View>

          <View className="flex-1 items-center justify-center gap-md px-container-margin">
            <ScanFrame />

            <View className="items-center gap-1 mt-2">
              <AppText weight="extrabold" className="text-lg text-white">
                {t.scanner.holdSteady}
              </AppText>
              <AppText className="text-sm text-white/60 text-center" style={{ maxWidth: 250 }}>
                {t.scanner.holdSteadySubtitle}
              </AppText>
            </View>

            {!permission?.granted && (
              <Pressable onPress={requestPermission} className="bg-white/10 px-4 py-3 rounded-xl mt-2">
                <AppText className="text-white text-sm text-center">
                  {permission && !permission.canAskAgain
                    ? t.common.cameraDeniedMessage
                    : t.common.cameraPromptMessage}
                </AppText>
              </Pressable>
            )}
          </View>

          <View style={{ paddingBottom: insets.bottom + 16 }} className="px-container-margin gap-sm">
            <View className="bg-white/10 p-sm rounded-lg flex-row items-center justify-between">
              <View className="flex-row items-center gap-sm">
                <View className="w-11 h-11 rounded-full bg-white/15 items-center justify-center">
                  <MaterialIcons name="group" size={20} color="#ffffff" />
                </View>
                <View>
                  <AppText weight="bold" className="text-white">
                    {t.scanner.studentsScannedCount(presentCount)}
                  </AppText>
                  <AppText className="text-xs text-white/60">{t.scanner.scannedToday}</AppText>
                </View>
              </View>
              <View className="items-end">
                <AppText className="text-xs text-white/60">{t.scanner.goalLabel(total)}</AppText>
                <View className="w-24 h-2 bg-white/15 rounded-full mt-2 overflow-hidden">
                  <View
                    className="h-full bg-accent"
                    style={{ width: `${total ? Math.round((presentCount / total) * 100) : 0}%` }}
                  />
                </View>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/register')}
              className="w-full bg-tertiary-fixed h-12 rounded-lg flex-row items-center justify-center gap-2 active:opacity-90">
              <MaterialIcons name="list-alt" size={20} color={colors.onTertiaryFixedVariant} />
              <AppText weight="bold" className="text-on-tertiary-fixed-variant">
                {t.scanner.viewRegister}
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <Header title={t.scanner.headerTitle} backButton />
          <View className="flex-1 items-center justify-center px-container-margin gap-md">
            <MaterialIcons name="assignment-late" size={48} color={colors.onSurfaceVariant} />
            <AppText className="text-base text-on-surface-variant text-center">
              {t.register.noActiveClass}
            </AppText>
          </View>
        </>
      )}
    </View>
  );
}
