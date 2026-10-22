import { useMemo } from "react";
import { View, Image, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { AppText } from "../../components/AppText";
import { colors, accentFor } from "../../theme/tokens";
import { useAppStore } from "../../store/useAppStore";
import { useTranslation } from "../../lib/i18n/useTranslation";
import { studentIdFor } from "../../lib/students";

export default function StudentPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { studentId, classId, sessionId } = useLocalSearchParams<{
    studentId: string;
    classId: string;
    sessionId?: string;
  }>();

  const classes = useAppStore((s) => s.classes);
  const studentsByClass = useAppStore((s) => s.studentsByClass);
  const sessions = useAppStore((s) => s.sessions);
  const markStudentPresent = useAppStore((s) => s.markStudentPresent);
  const markStudentAbsent = useAppStore((s) => s.markStudentAbsent);

  const classInfo = classes.find((c) => c.id === classId);
  const student = (studentsByClass[classId] ?? []).find((s) => String(s.id) === studentId);
  const activeSession = sessionId ? sessions.find((s) => s.id === sessionId) : undefined;

  const { rate, recordedCount, lastTen } = useMemo(() => {
    const submitted = sessions
      .filter((s) => s.classId === classId && s.submittedAt !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
    const numericId = Number(studentId);
    const presentCount = submitted.filter((s) => s.attendance[numericId]?.present).length;
    return {
      rate: submitted.length > 0 ? Math.round((presentCount / submitted.length) * 100) : null,
      recordedCount: submitted.length,
      lastTen: submitted.slice(-10).map((s) => !!s.attendance[numericId]?.present),
    };
  }, [sessions, classId, studentId]);

  if (!student || !classInfo) {
    return (
      <View className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top }} className="flex-row items-center gap-sm px-container-margin py-sm">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-surface-container items-center justify-center">
            <MaterialIcons name="arrow-back" size={20} color={colors.onSurface} />
          </Pressable>
          <AppText weight="bold" className="text-xl text-on-surface">
            {t.student.headerTitle}
          </AppText>
        </View>
      </View>
    );
  }

  const accent = accentFor(student.color);
  const present = !!activeSession?.attendance[student.id]?.present;
  const absent = !!activeSession?.attendance[student.id]?.absent;

  const openIdCard = () =>
    router.push({
      pathname: "/id-card",
      params: {
        name: student.name,
        grade: classInfo.name,
        studentId: studentIdFor(student.id),
        qrToken: student.qrToken,
        ...(student.img ? { img: student.img } : { initials: student.initials, color: student.color }),
      },
    });

  const markPresent = () => {
    if (!activeSession) return;
    markStudentPresent(
      activeSession.id,
      student.id,
      new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    );
  };

  const markAbsent = () => {
    if (!activeSession) return;
    markStudentAbsent(activeSession.id, student.id);
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="flex-row items-center gap-sm px-container-margin py-sm">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-surface-container items-center justify-center">
          <MaterialIcons name="arrow-back" size={20} color={colors.onSurface} />
        </Pressable>
        <AppText weight="bold" className="text-xl text-on-surface">
          {t.student.headerTitle}
        </AppText>
      </View>

      <ScrollView contentContainerClassName="px-container-margin pb-8 gap-md" className="flex-1">
        <View className={`${student.color} rounded-2xl p-md`}>
          <View className="flex-row items-center gap-sm">
            {student.img ? (
              <View className="w-15 h-15 rounded-xl overflow-hidden bg-white" style={{ width: 60, height: 60 }}>
                <Image source={{ uri: student.img }} className="w-full h-full" />
              </View>
            ) : (
              <View className="rounded-xl bg-white items-center justify-center" style={{ width: 60, height: 60 }}>
                <AppText weight="bold" className={`text-lg ${accent.onText}`}>
                  {student.initials}
                </AppText>
              </View>
            )}
            <View className="flex-1">
              <AppText weight="extrabold" className={`text-xl ${accent.onText}`} numberOfLines={1}>
                {student.name}
              </AppText>
              <AppText className={`text-sm ${accent.onText} opacity-80 mt-0.5`} numberOfLines={1}>
                {classInfo.name} · {studentIdFor(student.id)}
              </AppText>
            </View>
          </View>
          <View className="flex-row gap-sm mt-md">
            {activeSession && !present && (
              <Pressable onPress={markPresent} className="flex-1 bg-white rounded-lg p-sm items-center">
                <AppText weight="bold" className={`text-sm ${accent.onText}`}>
                  {t.student.markPresent}
                </AppText>
              </Pressable>
            )}
            <Pressable onPress={openIdCard} className="flex-1 bg-white/45 rounded-lg p-sm items-center">
              <AppText weight="bold" className={`text-sm ${accent.onText}`}>
                {t.student.idCard}
              </AppText>
            </Pressable>
          </View>
        </View>

        <View className="flex-row gap-sm">
          <View className="flex-1 bg-surface-container-low rounded-xl p-md">
            <AppText weight="extrabold" className="text-2xl text-on-surface">
              {rate !== null ? `${rate}%` : "—"}
            </AppText>
            <AppText className="text-xs text-on-surface-variant mt-1">{t.student.attendanceRate}</AppText>
          </View>
          <View className="flex-1 bg-surface-container-low rounded-xl p-md">
            <AppText weight="extrabold" className="text-2xl text-on-surface">
              {recordedCount}
            </AppText>
            <AppText className="text-xs text-on-surface-variant mt-1">{t.student.sessionsRecorded}</AppText>
          </View>
        </View>

        <View className="gap-sm">
          <AppText weight="bold" className="text-xs text-on-surface-variant tracking-wider">
            {t.student.lastSessions}
          </AppText>
          {lastTen.length > 0 ? (
            <View className="flex-row gap-1.5">
              {lastTen.map((wasPresent, index) => (
                <View
                  key={index}
                  className={`flex-1 rounded ${wasPresent ? "bg-tertiary-fixed" : "bg-avatar-pink"}`}
                  style={{ height: 34 }}
                />
              ))}
            </View>
          ) : (
            <AppText className="text-sm text-on-surface-variant">{t.student.noSessionsYet}</AppText>
          )}
        </View>

        <View className="gap-2">
          <View className="bg-surface-container-low rounded-lg p-sm flex-row items-center gap-sm">
            <View className="w-9 h-9 rounded-lg bg-avatar-sky items-center justify-center">
              <MaterialIcons name="alternate-email" size={18} color={colors.onAvatarSky} />
            </View>
            <View className="flex-1">
              <AppText weight="bold" className="text-sm text-on-surface">
                {t.student.guardian}
              </AppText>
              <AppText className="text-xs text-on-surface-variant" numberOfLines={1}>
                {student.guardianName ?? t.student.noGuardianInfo}
                {student.guardianContact ? ` · ${student.guardianContact}` : ""}
              </AppText>
            </View>
          </View>
          {activeSession && !present && (
            <Pressable
              onPress={markAbsent}
              disabled={absent}
              className="bg-surface-container-low rounded-lg p-sm flex-row items-center gap-sm active:opacity-80">
              <View className="w-9 h-9 rounded-lg bg-secondary-fixed-dim items-center justify-center">
                <MaterialIcons name="priority-high" size={18} color={colors.onSecondaryFixedVariant} />
              </View>
              <View className="flex-1">
                <AppText weight="bold" className="text-sm text-on-surface">
                  {absent ? t.studentListItem.markedAbsent : t.studentListItem.markAbsentLabel}
                </AppText>
              </View>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
