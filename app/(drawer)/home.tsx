import { useEffect, useMemo, useState } from "react";
import {
  View,
  Image,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Header } from "../../components/Header";
import { AppText } from "../../components/AppText";
import { PrimaryButton, OutlineButton } from "../../components/Buttons";
import { SubjectPickerModal } from "../../components/SubjectPickerModal";
import { colors } from "../../theme/tokens";
import { useAppStore } from "../../store/useAppStore";
import { useTranslation } from "../../lib/i18n/useTranslation";
import { avatarUriFor } from "../../lib/avatar";
import { todayStr } from "../../lib/date";
import type { ClassInfo } from "../../data/classes";

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const authUser = useAppStore((s) => s.authUser);
  const sessions = useAppStore((s) => s.sessions);
  const todaysSessions = useMemo(
    () => sessions.filter((s) => s.date === todayStr()),
    [sessions],
  );
  const checkInClass = useAppStore((s) => s.checkInClass);
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  const logout = useAppStore((s) => s.logout);
  const activeSubjectCode = useAppStore((s) => s.activeSubjectCode);
  const setActiveSubject = useAppStore((s) => s.setActiveSubject);
  const classes = useAppStore((s) => s.classes);
  const classesLoading = useAppStore((s) => s.classesLoading);
  const fetchClasses = useAppStore((s) => s.fetchClasses);
  const fetchStudentsForClass = useAppStore((s) => s.fetchStudentsForClass);
  const subjects = useAppStore((s) => s.subjects);
  const fetchSubjects = useAppStore((s) => s.fetchSubjects);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [subjectPickerVisible, setSubjectPickerVisible] = useState(false);
  const [pendingClass, setPendingClass] = useState<ClassInfo | null>(null);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [fetchClasses, fetchSubjects]);

  const finishCheckIn = (classInfo: ClassInfo, subjectCode: string) => {
    checkInClass(classInfo, subjectCode);
    fetchStudentsForClass(classInfo.id);
    router.push("/register");
  };

  const handleSelectClass = (classInfo: ClassInfo) => {
    setPickerVisible(false);
    if (activeSubjectCode) {
      finishCheckIn(classInfo, activeSubjectCode);
      return;
    }
    if (subjects.length <= 1) {
      finishCheckIn(classInfo, subjects[0]?.code ?? "");
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
      <Header title={t.home.headerTitle} />
      <ScrollView
        contentContainerClassName="px-container-margin pt-lg pb-24"
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg items-center custom-shadow">
          <View className="w-24 h-24 rounded-[999px] overflow-hidden border border-outline-variant bg-surface-container mb-sm">
            <Image
              source={{ uri: avatarUriFor(authUser?.name ?? "") }}
              className="w-full h-full"
            />
          </View>
          <AppText weight="bold" className="text-2xl text-on-surface">
            {authUser?.name}
          </AppText>
          <AppText className="text-sm text-on-surface-variant mt-1">
            {authUser?.email}
          </AppText>
          <View className="mt-2 px-2 py-0.5 bg-secondary-container rounded self-center">
            <AppText
              weight="bold"
              className="text-xs text-on-secondary-container"
            >
              {authUser?.role === "admin" ? t.common.roleAdmin : t.common.roleTeacher}
            </AppText>
          </View>
        </View>

        {todaysSessions.length > 0 ? (
          <View className="mt-md gap-sm">
            <AppText
              weight="medium"
              className="text-on-surface-variant text-xs uppercase tracking-wider"
            >
              {t.home.today}
            </AppText>
            {todaysSessions.map((session) => {
              const presentCount = Object.values(session.attendance).filter(
                (a) => a.present,
              ).length;
              return (
                <Pressable
                  key={session.id}
                  onPress={() => {
                    setActiveSession(session.id);
                    router.push("/register");
                  }}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-sm flex-row items-center justify-between active:opacity-80"
                >
                  <View className="flex-row items-center gap-sm flex-1">
                    <View className="w-12 h-12 rounded-[999px] bg-secondary-container items-center justify-center">
                      <MaterialIcons
                        name="assignment"
                        size={22}
                        color={colors.onSecondaryContainer}
                      />
                    </View>
                    <View className="flex-1">
                      <AppText weight="bold" className="text-on-surface">
                        {session.className}
                      </AppText>
                      <AppText className="text-sm text-on-surface-variant">
                        {subjects.find(
                          (sub) => sub.code === session.subjectCode,
                        )?.label ?? session.subjectCode}{" "}
                        · {t.common.presentCount(presentCount)}
                      </AppText>
                    </View>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.onSurfaceVariant}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View className="mt-md bg-surface-container rounded-xl p-sm">
            <AppText className="text-sm text-on-surface-variant text-center">
              {t.home.noSessionsToday}
            </AppText>
          </View>
        )}

        <View className="mt-lg gap-sm">
          <View className="flex-row gap-sm">
            <PrimaryButton
              label={t.home.scanClass}
              icon="qr-code-scanner"
              onPress={() => router.push("/class-scanner")}
              className="flex-1"
            />
            <OutlineButton
              label={t.home.chooseClass}
              icon="list"
              onPress={() => setPickerVisible(true)}
              className="flex-1"
            />
          </View>
          <OutlineButton
            label={t.home.historyButton}
            icon="history"
            onPress={() => router.push("/history")}
          />
        </View>

        <Pressable
          onPress={() => {
            logout();
            router.replace("/login");
          }}
          className="mt-lg self-center"
        >
          <AppText
            weight="medium"
            className="text-sm text-on-surface-variant underline"
          >
            {t.common.logout}
          </AppText>
        </Pressable>
      </ScrollView>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setPickerVisible(false)}
        >
          <Pressable
            className="bg-surface-container-lowest rounded-t-xl px-container-margin pt-lg pb-8"
            onPress={(e) => e.stopPropagation()}
          >
            <AppText weight="bold" className="text-lg text-on-surface mb-md">
              {t.home.selectClassModalTitle}
            </AppText>
            {classesLoading && (
              <ActivityIndicator color={colors.primary} className="my-md" />
            )}
            {!classesLoading && classes.length === 0 && (
              <AppText className="text-sm text-on-surface-variant text-center my-md">
                {t.home.noClassesAvailable}
              </AppText>
            )}
            {classes.map((classInfo) => (
              <Pressable
                key={classInfo.id}
                onPress={() => handleSelectClass(classInfo)}
                className="flex-row items-center justify-between py-3 border-b border-outline-variant active:opacity-70"
              >
                <AppText weight="medium" className="text-base text-on-surface">
                  {classInfo.name}
                </AppText>
                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color={colors.onSurfaceVariant}
                />
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <SubjectPickerModal
        visible={subjectPickerVisible}
        subjects={subjects}
        onSelect={handleSelectSubject}
        onClose={() => {
          setSubjectPickerVisible(false);
          setPendingClass(null);
        }}
      />
    </View>
  );
}
