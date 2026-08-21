import { useCallback, useEffect, useRef, useState } from 'react';
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
import { Header } from '../../components/Header';
import { AppText } from '../../components/AppText';
import { SubjectPickerModal } from '../../components/SubjectPickerModal';
import { colors } from '../../theme/tokens';
import type { ClassInfo } from '../../data/classes';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../lib/i18n/useTranslation';

const FRAME_SIZE = 256;

export default function ClassScannerPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const activeSubjectCode = useAppStore((s) => s.activeSubjectCode);
  const setActiveSubject = useAppStore((s) => s.setActiveSubject);
  const checkInClass = useAppStore((s) => s.checkInClass);
  const classes = useAppStore((s) => s.classes);
  const fetchClasses = useAppStore((s) => s.fetchClasses);
  const fetchStudentsForClass = useAppStore((s) => s.fetchStudentsForClass);
  const subjects = useAppStore((s) => s.subjects);
  const fetchSubjects = useAppStore((s) => s.fetchSubjects);
  const [pendingClass, setPendingClass] = useState<ClassInfo | null>(null);
  const [subjectPickerVisible, setSubjectPickerVisible] = useState(false);
  const [scanError, setScanError] = useState(false);
  const scanLineY = useSharedValue(0);
  const busyRef = useRef(false);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [fetchClasses, fetchSubjects]);

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

  const checkInAndProceed = useCallback(
    (classInfo: ClassInfo) => {
      if (activeSubjectCode) {
        checkInClass(classInfo, activeSubjectCode);
        fetchStudentsForClass(classInfo.id);
        router.replace('/register');
      } else if (subjects.length === 1) {
        checkInClass(classInfo, subjects[0].code);
        fetchStudentsForClass(classInfo.id);
        router.replace('/register');
      } else {
        setPendingClass(classInfo);
        setSubjectPickerVisible(true);
      }
    },
    [activeSubjectCode, subjects, checkInClass, fetchStudentsForClass, router]
  );

  const handleBarcodeScanned = useCallback(
    ({ data }: BarcodeScanningResult) => {
      if (busyRef.current || classes.length === 0) return;
      busyRef.current = true;

      const classInfo = classes.find((c) => c.qrCode === data);
      if (!classInfo) {
        setScanError(true);
        busyRef.current = false;
        setTimeout(() => setScanError(false), 2000);
        return;
      }

      checkInAndProceed(classInfo);
    },
    [classes, checkInAndProceed]
  );

  const handleSelectSubject = (code: string) => {
    setActiveSubject(code);
    setSubjectPickerVisible(false);
    if (pendingClass) {
      checkInClass(pendingClass, code);
      fetchStudentsForClass(pendingClass.id);
      router.replace('/register');
      setPendingClass(null);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Header title={t.classScanner.headerTitle} backButton />
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
                  ? t.common.cameraDeniedMessage
                  : t.common.cameraPromptMessage}
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
          <AppText
            weight="medium"
            className={`text-sm text-white py-2 px-4 rounded-full overflow-hidden ${scanError ? 'bg-error' : 'bg-black/40'}`}>
            {scanError ? t.classScanner.scanErrorMessage : t.classScanner.scanHint}
          </AppText>
        </View>
      </View>

      <SubjectPickerModal
        visible={subjectPickerVisible}
        subjects={subjects}
        onSelect={handleSelectSubject}
        onClose={() => {
          setSubjectPickerVisible(false);
          setPendingClass(null);
          router.back();
        }}
      />
    </View>
  );
}
