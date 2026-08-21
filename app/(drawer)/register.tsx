import { useState } from "react";
import { View, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Header } from "../../components/Header";
import { AppText } from "../../components/AppText";
import {
  PresentStudentRow,
  AbsentStudentRow,
} from "../../components/StudentListItem";
import { PrimaryButton } from "../../components/Buttons";
import { colors } from "../../theme/tokens";
import { useAppStore } from "../../store/useAppStore";
import { useTranslation } from "../../lib/i18n/useTranslation";
import { formatDisplayDate } from "../../lib/date";

type Tab = "present" | "absent";

export default function AttendanceRegister() {
  const [tab, setTab] = useState<Tab>("present");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const session = useAppStore((s) => s.activeSession());
  const markStudentPresent = useAppStore((s) => s.markStudentPresent);
  const markStudentAbsent = useAppStore((s) => s.markStudentAbsent);
  const submitRegister = useAppStore((s) => s.submitRegister);
  const classes = useAppStore((s) => s.classes);
  const subjects = useAppStore((s) => s.subjects);
  const studentsByClass = useAppStore((s) => s.studentsByClass);
  const studentsLoadingClassId = useAppStore((s) => s.studentsLoadingClassId);

  const classInfo = session
    ? classes.find((c) => c.id === session.classId)
    : undefined;
  const roster = session ? (studentsByClass[session.classId] ?? []) : [];

  if (!session || !classInfo) {
    return (
      <View className="flex-1 bg-background">
        <Header title={t.register.headerTitle} backButton />
        <View className="flex-1 items-center justify-center px-container-margin gap-md">
          <MaterialIcons
            name="assignment-late"
            size={48}
            color={colors.onSurfaceVariant}
          />
          <AppText className="text-base text-on-surface-variant text-center">
            {t.register.noActiveClass}
          </AppText>
          <PrimaryButton
            label={t.register.backToHome}
            onPress={() => router.replace("/home")}
          />
        </View>
      </View>
    );
  }

  const presentStudents = roster.filter(
    (s) => session.attendance[s.id]?.present,
  );
  const absentStudents = roster.filter(
    (s) => !session.attendance[s.id]?.present,
  );
  const total = roster.length;
  const rosterLoading = studentsLoadingClassId === session.classId;
  const isComplete = total > 0 && roster.every((s) => session.attendance[s.id]);
  const isSubmitted = session.submittedAt !== null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await submitRegister(session.id);
      if (result.success) {
        Alert.alert(t.register.submitSuccessTitle, t.register.submitSuccessMessage);
      } else {
        Alert.alert(
          t.register.submitFailTitle,
          result.failedCount > 0
            ? t.register.submitFailPartial(result.failedCount)
            : t.register.submitFailSession,
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Header title={t.register.headerTitle} backButton />
      <ScrollView className="flex-1" contentContainerClassName={isComplete ? "pb-40" : "pb-24"}>
        <View className="px-container-margin pt-lg pb-sm">
          <View className="flex-row justify-between items-start mb-1">
            <View className="flex-1 pr-2">
              <AppText
                weight="medium"
                className="text-on-surface-variant text-xs uppercase tracking-wider mb-1"
              >
                {t.register.attendanceSheet}
              </AppText>
              <AppText weight="bold" className="text-2xl text-on-surface">
                {classInfo.name}
              </AppText>
              <AppText className="text-base text-on-surface-variant mt-1">
                {formatDisplayDate(session.date)}
              </AppText>
              <View className="mt-2 self-start bg-primary px-3 py-1 rounded-[999px] flex-row items-center gap-1.5">
                <MaterialIcons
                  name="menu-book"
                  size={14}
                  color={colors.onPrimary}
                />
                <AppText
                  weight="bold"
                  className="text-xs text-on-primary"
                  numberOfLines={1}
                >
                  {subjects.find((sub) => sub.code === session.subjectCode)?.label ?? session.subjectCode}
                </AppText>
              </View>
            </View>
            <View className="bg-primary px-3 py-1.5 rounded-[999px] flex-row items-center gap-2 shrink-0">
              <AppText weight="bold" className="text-on-primary">
                {presentStudents.length}/{total}
              </AppText>
              <AppText className="text-xs text-on-primary opacity-80">
                {t.common.presentSuffix}
              </AppText>
            </View>
          </View>
        </View>

        <View className="pt-1 pb-sm px-container-margin">
          <View className="relative justify-center mb-sm">
            <MaterialIcons
              name="search"
              size={20}
              color={colors.onSurfaceVariant}
              style={{ position: "absolute", left: 12, zIndex: 1 }}
            />
            <TextInput
              className="w-full h-12 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-hanken text-on-surface"
              placeholder={t.register.searchPlaceholder}
              placeholderTextColor={colors.outline}
            />
          </View>
          <View className="flex-row p-1 bg-surface-container rounded-xl">
            <Pressable
              onPress={() => setTab("present")}
              className={`flex-1 py-2 items-center rounded-lg ${tab === "present" ? "bg-surface-container-lowest" : ""}`}
            >
              <AppText
                weight="bold"
                className={
                  tab === "present" ? "text-primary" : "text-on-surface-variant"
                }
              >
                {t.register.presentTab(presentStudents.length)}
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => setTab("absent")}
              className={`flex-1 py-2 items-center rounded-lg ${tab === "absent" ? "bg-surface-container-lowest" : ""}`}
            >
              <AppText
                weight="bold"
                className={
                  tab === "absent" ? "text-primary" : "text-on-surface-variant"
                }
              >
                {t.register.absentTab(absentStudents.length)}
              </AppText>
            </Pressable>
          </View>
        </View>

        <View className="px-container-margin gap-md mt-1">
          {rosterLoading && roster.length === 0 && (
            <AppText className="text-sm text-on-surface-variant text-center py-lg">
              {t.register.loadingStudents}
            </AppText>
          )}
          {tab === "present"
            ? presentStudents.map((student) => (
                <PresentStudentRow
                  key={student.id}
                  student={student}
                  grade={classInfo.name}
                  time={session.attendance[student.id]?.time}
                />
              ))
            : absentStudents.map((student) => (
                <AbsentStudentRow
                  key={student.id}
                  student={student}
                  grade={classInfo.name}
                  isAbsent={session.attendance[student.id]?.absent}
                  onMarkPresent={() =>
                    markStudentPresent(
                      session.id,
                      student.id,
                      new Date().toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    )
                  }
                  onMarkAbsent={() => markStudentAbsent(session.id, student.id)}
                />
              ))}
        </View>
      </ScrollView>
      <Pressable
        onPress={() => router.push("/scanner")}
        className={`absolute right-6 w-14 h-14 bg-primary rounded-[999px] items-center justify-center active:opacity-90 ${
          isComplete ? "bottom-24" : "bottom-6"
        }`}
        style={{
          elevation: 4,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <MaterialIcons
          name="qr-code-scanner"
          size={26}
          color={colors.onPrimary}
        />
      </Pressable>

      {isComplete && (
        <View className="absolute left-0 right-0 bottom-0 bg-surface border-t border-outline-variant p-container-margin">
          <PrimaryButton
            label={
              submitting
                ? t.register.submitting
                : isSubmitted
                  ? t.register.submittedUpdate
                  : t.register.submitRegister
            }
            icon={isSubmitted ? "check-circle" : "cloud-upload"}
            onPress={handleSubmit}
            disabled={submitting}
          />
        </View>
      )}
    </View>
  );
}
