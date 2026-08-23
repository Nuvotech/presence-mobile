import { useEffect, useMemo, useState } from "react";
import {
  View,
  Image,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Header } from "../../components/Header";
import { AppText } from "../../components/AppText";
import { PrimaryButton, OutlineButton } from "../../components/Buttons";
import { SubjectPickerModal } from "../../components/SubjectPickerModal";
import { colors } from "../../theme/tokens";
import { useAppStore } from "../../store/useAppStore";
import { useTranslation } from "../../lib/i18n/useTranslation";
import { avatarUriFor } from "../../lib/avatar";
import { todayStr, formatDisplayDate } from "../../lib/date";
import type { ClassInfo } from "../../data/classes";

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const authUser = useAppStore((s) => s.authUser);
  const sessions = useAppStore((s) => s.sessions);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const sessionsForSelectedDate = useMemo(
    () => sessions.filter((s) => s.date === selectedDate),
    [sessions, selectedDate],
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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [fetchClasses, fetchSubjects]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchClasses(), fetchSubjects()]);
    } finally {
      setRefreshing(false);
    }
  };

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

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (event.type === "set" && date) {
      setSelectedDate(date.toISOString().slice(0, 10));
    }
  };

  const openDatePicker = () => {
    const value = new Date(`${selectedDate}T00:00:00`);
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value,
        mode: "date",
        onChange: handleDateChange,
      });
    } else {
      setShowDatePicker(true);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Header title={t.home.headerTitle} />
      <ScrollView
        contentContainerClassName="px-container-margin pt-lg pb-24"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-sm flex-row items-center gap-sm custom-shadow">
          <View className="w-12 h-12 rounded-[999px] overflow-hidden border border-outline-variant bg-surface-container">
            <Image
              source={{ uri: avatarUriFor(authUser?.name ?? "") }}
              className="w-full h-full"
            />
          </View>
          <View className="flex-1">
            <AppText
              weight="bold"
              className="text-base text-on-surface"
              numberOfLines={1}
            >
              {authUser?.name}
            </AppText>
            <AppText
              className="text-xs text-on-surface-variant"
              numberOfLines={1}
            >
              {authUser?.email}
            </AppText>
            {authUser?.school && (
              <AppText
                className="text-xs text-primary mt-0.5"
                numberOfLines={1}
              >
                {authUser.school.name}
              </AppText>
            )}
          </View>
          <View className="px-2 py-0.5 bg-secondary-container rounded">
            <AppText
              weight="bold"
              className="text-xs text-on-secondary-container"
            >
              {authUser?.role === "admin" ? t.common.roleAdmin : t.common.roleTeacher}
            </AppText>
          </View>
        </View>

        <View className="mt-md flex-row items-center justify-between">
          <AppText
            weight="medium"
            className="text-on-surface-variant text-xs uppercase tracking-wider"
          >
            {selectedDate === todayStr()
              ? t.home.today
              : formatDisplayDate(selectedDate)}
          </AppText>
          <View className="flex-row items-center gap-1">
            {selectedDate !== todayStr() && (
              <Pressable
                onPress={() => {
                  setShowDatePicker(false);
                  setSelectedDate(todayStr());
                }}
                className="px-2 py-1 rounded-full bg-surface-container active:opacity-70"
              >
                <AppText weight="bold" className="text-xs text-primary">
                  {t.home.today}
                </AppText>
              </Pressable>
            )}
            <Pressable
              onPress={openDatePicker}
              accessibilityLabel={t.home.selectDateLabel}
              className="p-1.5 -mr-1.5 rounded-full active:bg-surface-container"
            >
              <MaterialIcons
                name="calendar-today"
                size={18}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
          </View>
        </View>

        {Platform.OS === "ios" && showDatePicker && (
          <DateTimePicker
            value={new Date(`${selectedDate}T00:00:00`)}
            mode="date"
            display="inline"
            onChange={handleDateChange}
          />
        )}

        {sessionsForSelectedDate.length > 0 ? (
          <View className="mt-sm gap-sm">
            {sessionsForSelectedDate.map((session) => {
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
          <View className="mt-sm bg-surface-container rounded-xl p-sm">
            <AppText className="text-sm text-on-surface-variant text-center">
              {selectedDate === todayStr()
                ? t.home.noSessionsToday
                : t.home.noSessionsOnDate}
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
