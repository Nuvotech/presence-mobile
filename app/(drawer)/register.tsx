import { useState } from "react";
import { View, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Header } from "../../components/Header";
import { AppText } from "../../components/AppText";
import { StudentRow } from "../../components/StudentListItem";
import { PrimaryButton } from "../../components/Buttons";
import { SegmentedControl } from "../../components/SegmentedControl";
import { RegisterHero } from "../../components/RegisterHero";
import { colors } from "../../theme/tokens";
import { useAppStore } from "../../store/useAppStore";
import { useTranslation } from "../../lib/i18n/useTranslation";
import { formatDisplayDate } from "../../lib/date";

type Tab = "present" | "waiting";

export default function AttendanceRegister() {
  const [tab, setTab] = useState<Tab>("present");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const session = useAppStore((s) => s.activeSession());
  const markStudentPresent = useAppStore((s) => s.markStudentPresent);
  const unmarkStudent = useAppStore((s) => s.unmarkStudent);
  const submitRegister = useAppStore((s) => s.submitRegister);
  const classes = useAppStore((s) => s.classes);
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
  const waitingStudents = roster.filter(
    (s) => !session.attendance[s.id]?.present,
  );
  const total = roster.length;
  const rosterLoading = studentsLoadingClassId === session.classId;
  const isSubmitted = session.submittedAt !== null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await submitRegister(session.id);
      if (result.success) {
        router.push({ pathname: "/register-submitted", params: { sessionId: session.id } });
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

  const visibleStudents = tab === "present" ? presentStudents : waitingStudents;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        style={{ paddingTop: insets.top }}
        contentContainerClassName="pb-40">
        <RegisterHero
          className={classInfo.name}
          present={presentStudents.length}
          total={total}
          dateLabel={formatDisplayDate(session.date)}
          presentOfTotal={t.register.presentOfTotal}
          onBack={() => router.back()}
        />

        <View className="pt-1 pb-sm px-container-margin">
          <View className="relative justify-center mb-sm">
            <MaterialIcons
              name="search"
              size={20}
              color={colors.onSurfaceVariant}
              style={{ position: "absolute", left: 12, zIndex: 1 }}
            />
            <TextInput
              className="w-full h-12 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-archivo text-on-surface"
              placeholder={t.register.searchPlaceholder}
              placeholderTextColor={colors.outline}
            />
          </View>
          <SegmentedControl
            segments={[
              { key: "present", label: t.register.presentTab(presentStudents.length) },
              { key: "waiting", label: t.register.waitingTab(waitingStudents.length) },
            ]}
            value={tab}
            onChange={setTab}
          />
        </View>

        <View className="px-container-margin gap-md mt-1">
          {rosterLoading && roster.length === 0 && (
            <AppText className="text-sm text-on-surface-variant text-center py-lg">
              {t.register.loadingStudents}
            </AppText>
          )}
          {visibleStudents.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              classId={session.classId}
              sessionId={session.id}
              present={!!session.attendance[student.id]?.present}
              time={session.attendance[student.id]?.time}
              onToggle={() =>
                session.attendance[student.id]?.present
                  ? unmarkStudent(session.id, student.id)
                  : markStudentPresent(
                      session.id,
                      student.id,
                      new Date().toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    )
              }
            />
          ))}
        </View>
      </ScrollView>
      <Pressable
        onPress={() => router.push("/scanner")}
        className="absolute right-6 bottom-24 w-14 h-14 bg-attendance-success rounded-full items-center justify-center active:opacity-90"
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

      <View className="absolute left-0 right-0 bottom-0 bg-background p-container-margin">
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
    </View>
  );
}
