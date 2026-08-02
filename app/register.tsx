import { useState } from "react";
import { View, Pressable, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Header } from "../components/Header";
import { AppText } from "../components/AppText";
import {
  PresentStudentRow,
  AbsentStudentRow,
} from "../components/StudentListItem";
import { PrimaryButton } from "../components/Buttons";
import { colors } from "../theme/tokens";
import { classes } from "../data/classes";
import { useAppStore } from "../store/useAppStore";
import { formatDisplayDate } from "../lib/date";
import { subjectLabel } from "../data/subjects";

type Tab = "present" | "absent";

export default function AttendanceRegister() {
  const [tab, setTab] = useState<Tab>("present");
  const router = useRouter();
  const session = useAppStore((s) => s.todaysSession());
  const markStudentPresent = useAppStore((s) => s.markStudentPresent);

  const classInfo = session
    ? classes.find((c) => c.id === session.classId)
    : undefined;

  if (!session || !classInfo) {
    return (
      <View className="flex-1 bg-background">
        <Header title="Register" backButton />
        <View className="flex-1 items-center justify-center px-container-margin gap-md">
          <MaterialIcons
            name="assignment-late"
            size={48}
            color={colors.onSurfaceVariant}
          />
          <AppText className="text-base text-on-surface-variant text-center">
            No active class checked in today.
          </AppText>
          <PrimaryButton
            label="Back to Home"
            onPress={() => router.replace("/home")}
          />
        </View>
      </View>
    );
  }

  const presentStudents = classInfo.roster.filter(
    (s) => session.attendance[s.id]?.present,
  );
  const absentStudents = classInfo.roster.filter(
    (s) => !session.attendance[s.id]?.present,
  );
  const total = classInfo.roster.length;

  return (
    <View className="flex-1 bg-background">
      <Header title="Register" backButton />
      <ScrollView className="flex-1" contentContainerClassName="pb-24">
        <View className="px-container-margin pt-lg pb-sm">
          <View className="flex-row justify-between items-start mb-1">
            <View className="flex-1 pr-2">
              <AppText
                weight="medium"
                className="text-on-surface-variant text-xs uppercase tracking-wider mb-1"
              >
                Attendance Sheet
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
                  {session.subjectCode} · {subjectLabel(session.subjectCode)}
                </AppText>
              </View>
            </View>
            <View className="bg-primary px-3 py-1.5 rounded-[999px] flex-row items-center gap-2 shrink-0">
              <AppText weight="bold" className="text-on-primary">
                {presentStudents.length}/{total}
              </AppText>
              <AppText className="text-xs text-on-primary opacity-80">
                present
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
              placeholder="Search students..."
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
                Present ({presentStudents.length})
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
                Not Yet Arrived ({absentStudents.length})
              </AppText>
            </Pressable>
          </View>
        </View>

        <View className="px-container-margin gap-md mt-1">
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
                />
              ))}
        </View>
      </ScrollView>
      <Pressable
        onPress={() => router.push("/scanner")}
        className="absolute right-6 bottom-6 w-14 h-14 bg-primary rounded-[999px] items-center justify-center active:opacity-90"
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
    </View>
  );
}
