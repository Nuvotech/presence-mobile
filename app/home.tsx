import { useState } from 'react';
import { View, Image, Pressable, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { AppText } from '../components/AppText';
import { PrimaryButton, OutlineButton } from '../components/Buttons';
import { SubjectPickerModal } from '../components/SubjectPickerModal';
import { colors } from '../theme/tokens';
import { useAppStore } from '../store/useAppStore';
import { formatDisplayDate } from '../lib/date';
import { classes, type ClassInfo } from '../data/classes';
import { subjectLabel } from '../data/subjects';

export default function HomePage() {
  const router = useRouter();
  const teacher = useAppStore((s) => s.teacher);
  const todaysSession = useAppStore((s) => s.todaysSession());
  const checkInClass = useAppStore((s) => s.checkInClass);
  const activeSubjectCode = useAppStore((s) => s.activeSubjectCode);
  const setActiveSubject = useAppStore((s) => s.setActiveSubject);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [subjectPickerVisible, setSubjectPickerVisible] = useState(false);
  const [pendingClass, setPendingClass] = useState<ClassInfo | null>(null);

  const presentCount = todaysSession
    ? Object.values(todaysSession.attendance).filter((a) => a.present).length
    : 0;

  const finishCheckIn = (classInfo: ClassInfo, subjectCode: string) => {
    checkInClass(classInfo, subjectCode);
    router.push('/register');
  };

  const handleSelectClass = (classInfo: ClassInfo) => {
    setPickerVisible(false);
    if (activeSubjectCode) {
      finishCheckIn(classInfo, activeSubjectCode);
      return;
    }
    if (teacher.subjects.length <= 1) {
      finishCheckIn(classInfo, teacher.subjects[0]?.code ?? '');
      return;
    }
    setPendingClass(classInfo);
    setSubjectPickerVisible(true);
  };

  const handleSelectSubject = (code: string) => {
    setActiveSubject(code);
    setSubjectPickerVisible(false);
    if (pendingClass) {
      finishCheckIn(pendingClass, code);
      setPendingClass(null);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Header title="Home" />
      <ScrollView contentContainerClassName="px-container-margin pt-lg pb-24" keyboardShouldPersistTaps="handled">
        <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg items-center custom-shadow">
          <View className="w-24 h-24 rounded-[999px] overflow-hidden border border-outline-variant bg-surface-container mb-sm">
            <Image source={{ uri: teacher.avatarUri }} className="w-full h-full" />
          </View>
          <AppText weight="bold" className="text-2xl text-on-surface">
            {teacher.name}
          </AppText>
          <AppText className="text-sm text-on-surface-variant mt-1">{teacher.email}</AppText>
          <View className="mt-2 px-2 py-0.5 bg-secondary-container rounded self-center">
            <AppText weight="bold" className="text-xs text-on-secondary-container">
              Teacher
            </AppText>
          </View>
        </View>

        {todaysSession ? (
          <Pressable
            onPress={() => router.push('/register')}
            className="mt-md bg-surface-container-lowest border border-outline-variant rounded-xl p-sm flex-row items-center justify-between active:opacity-80">
            <View className="flex-row items-center gap-sm flex-1">
              <View className="w-12 h-12 rounded-[999px] bg-secondary-container items-center justify-center">
                <MaterialIcons name="assignment" size={22} color={colors.onSecondaryContainer} />
              </View>
              <View className="flex-1">
                <AppText weight="bold" className="text-on-surface">
                  Today: {todaysSession.className}
                </AppText>
                <AppText className="text-sm text-on-surface-variant">
                  {formatDisplayDate(todaysSession.date)} · {subjectLabel(todaysSession.subjectCode)} ·{' '}
                  {presentCount} present
                </AppText>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
        ) : (
          <View className="mt-md bg-surface-container rounded-xl p-sm">
            <AppText className="text-sm text-on-surface-variant text-center">
              No class checked in yet today. Scan a class to get started.
            </AppText>
          </View>
        )}

        <View className="mt-lg gap-sm">
          <View className="flex-row gap-sm">
            <PrimaryButton
              label="Scan a Class"
              icon="qr-code-scanner"
              onPress={() => router.push('/class-scanner')}
              className="flex-1"
            />
            <OutlineButton
              label="Select a Class"
              icon="list"
              onPress={() => setPickerVisible(true)}
              className="flex-1"
            />
          </View>
          <OutlineButton label="History" icon="history" onPress={() => router.push('/history')} />
        </View>

        <Pressable onPress={() => router.replace('/login')} className="mt-lg self-center">
          <AppText weight="medium" className="text-sm text-on-surface-variant underline">
            Log out
          </AppText>
        </Pressable>
      </ScrollView>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}>
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setPickerVisible(false)}>
          <Pressable
            className="bg-surface-container-lowest rounded-t-xl px-container-margin pt-lg pb-8"
            onPress={(e) => e.stopPropagation()}>
            <AppText weight="bold" className="text-lg text-on-surface mb-md">
              Select a Class
            </AppText>
            {classes.map((classInfo) => (
              <Pressable
                key={classInfo.id}
                onPress={() => handleSelectClass(classInfo)}
                className="flex-row items-center justify-between py-3 border-b border-outline-variant active:opacity-70">
                <View>
                  <AppText weight="medium" className="text-base text-on-surface">
                    {classInfo.name}
                  </AppText>
                  <AppText className="text-sm text-on-surface-variant">
                    {classInfo.roster.length} students
                  </AppText>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <SubjectPickerModal
        visible={subjectPickerVisible}
        subjects={teacher.subjects}
        onSelect={handleSelectSubject}
        onClose={() => {
          setSubjectPickerVisible(false);
          setPendingClass(null);
        }}
      />
    </View>
  );
}
