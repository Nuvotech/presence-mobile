import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../../components/AppText';
import { ScanFrame } from '../../components/ScanFrame';
import { SubjectPickerModal } from '../../components/SubjectPickerModal';
import type { ClassInfo } from '../../data/classes';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../lib/i18n/useTranslation';

export default function ClassScannerPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
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
  const busyRef = useRef(false);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [fetchClasses, fetchSubjects]);

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
          {t.classScanner.headerTitle}
        </AppText>
      </View>

      <View className="flex-1 items-center justify-center gap-md px-container-margin">
        <ScanFrame />

        <View className="items-center gap-1 mt-2">
          <AppText weight="extrabold" className="text-lg text-white">
            {t.classScanner.headline}
          </AppText>
          <AppText className="text-sm text-white/60 text-center" style={{ maxWidth: 250 }}>
            {scanError ? t.classScanner.scanErrorMessage : t.classScanner.scanHint}
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

      <View style={{ height: insets.bottom + 24 }} />

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
