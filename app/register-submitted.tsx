import { useMemo } from "react";
import { View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { AppText } from "../components/AppText";
import { colors } from "../theme/tokens";
import { useAppStore } from "../store/useAppStore";
import { useTranslation } from "../lib/i18n/useTranslation";
import { formatDisplayDate } from "../lib/date";
import { MOCK_TIMETABLE } from "../lib/mock/data";

export default function RegisterSubmittedPage() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const authUser = useAppStore((s) => s.authUser);
  const sessions = useAppStore((s) => s.sessions);
  const classes = useAppStore((s) => s.classes);
  const studentsByClass = useAppStore((s) => s.studentsByClass);
  const setActiveSession = useAppStore((s) => s.setActiveSession);

  const session = sessions.find((s) => s.id === sessionId);
  const classInfo = session ? classes.find((c) => c.id === session.classId) : undefined;
  const roster = session ? (studentsByClass[session.classId] ?? []) : [];
  const present = session ? Object.values(session.attendance).filter((a) => a.present).length : 0;
  const absent = Math.max(0, roster.length - present);

  const nextClassInfo = useMemo(() => {
    if (!session) return null;
    const dow = new Date(`${session.date}T00:00:00`).getDay();
    const todaySlots = [...(MOCK_TIMETABLE[dow] ?? [])].sort((a, b) => a.start.localeCompare(b.start));
    const currentIndex = todaySlots.findIndex((slot) => slot.classId === session.classId);
    const nextSlot = currentIndex >= 0 ? todaySlots[currentIndex + 1] : undefined;
    if (!nextSlot) return null;
    const nextClass = classes.find((c) => c.id === nextSlot.classId);
    return nextClass ? { name: nextClass.name, start: nextSlot.start } : null;
  }, [session, classes]);

  if (!session || !classInfo) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-container-margin">
        <AppText className="text-base text-on-surface-variant text-center">
          {t.historyDetail.notFound}
        </AppText>
      </SafeAreaView>
    );
  }

  const submittedTime = session.submittedAt
    ? new Date(session.submittedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : "";

  const goEdit = () => {
    setActiveSession(session.id);
    router.replace("/register");
  };

  const goHome = () => router.replace("/home");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center px-container-margin gap-md">
        <View className="bg-tertiary-fixed rounded-3xl p-lg">
          <View className="w-14 h-14 rounded-xl bg-white items-center justify-center">
            <MaterialIcons name="check" size={26} color={colors.onTertiaryFixedVariant} />
          </View>
          <AppText weight="extrabold" className="text-2xl text-on-tertiary-fixed-variant tracking-tight mt-md">
            {t.register.submittedHeadline}
          </AppText>
          <AppText className="text-sm text-on-tertiary-fixed-variant/85 mt-2">
            {t.register.submittedSummary(classInfo.name, formatDisplayDate(session.date), present, absent)}
          </AppText>
        </View>

        <View className="bg-surface-container-low rounded-2xl p-md gap-sm">
          <View className="flex-row items-center justify-between">
            <AppText className="text-sm text-on-surface-variant">{t.register.markedBy}</AppText>
            <AppText weight="bold" className="text-sm text-on-surface">
              {authUser?.name ?? ""}
            </AppText>
          </View>
          <View className="flex-row items-center justify-between">
            <AppText className="text-sm text-on-surface-variant">{t.register.submittedAtLabel}</AppText>
            <AppText weight="bold" className="text-sm text-on-surface">
              {submittedTime}
            </AppText>
          </View>
          <View className="flex-row items-center justify-between">
            <AppText className="text-sm text-on-surface-variant">{t.register.nextClassLabel}</AppText>
            <AppText weight="bold" className="text-sm text-on-surface">
              {nextClassInfo ? `${nextClassInfo.name} · ${nextClassInfo.start}` : t.register.noMoreClassesToday}
            </AppText>
          </View>
        </View>

        <View className="flex-row gap-sm">
          <Pressable onPress={goEdit} className="flex-1 bg-surface-container rounded-2xl p-md items-center">
            <AppText weight="bold" className="text-sm text-on-surface">
              {t.register.editAction}
            </AppText>
          </Pressable>
          <Pressable onPress={goHome} className="flex-1 bg-primary rounded-2xl p-md items-center">
            <AppText weight="bold" className="text-sm text-on-primary">
              {t.register.doneAction}
            </AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
