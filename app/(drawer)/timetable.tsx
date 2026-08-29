import { useMemo, useRef, useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { AppText } from "../../components/AppText";
import { colors, PASTEL_ACCENTS } from "../../theme/tokens";
import { useAppStore } from "../../store/useAppStore";
import { useTranslation } from "../../lib/i18n/useTranslation";
import { MOCK_TIMETABLE, type TimetableSlot } from "../../lib/mock/data";
import { todayStr } from "../../lib/date";
import type { ClassInfo } from "../../data/classes";

const DOW_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

const pad2 = (n: number) => String(n).padStart(2, "0");
const isoOf = (year: number, month: number, day: number) => `${year}-${pad2(month + 1)}-${pad2(day)}`;
const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

function DaySection({
  iso,
  label,
  classes,
}: {
  iso: string;
  label: string;
  classes: ClassInfo[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const date = new Date(`${iso}T00:00:00`);
  const slots = MOCK_TIMETABLE[date.getDay()] ?? [];

  return (
    <View className="gap-sm">
      <AppText weight="bold" className="text-sm text-on-surface-variant">
        {label} · {t.timetable.classCount(slots.length)}
      </AppText>

      {slots.length === 0 ? (
        <View className="bg-surface-container-low rounded-xl p-lg items-center">
          <AppText className="text-sm text-on-surface-variant">{t.timetable.noClassesScheduled}</AppText>
        </View>
      ) : (
        slots.map((slot: TimetableSlot, index: number) => {
          const classInfo = classes.find((c) => c.id === slot.classId);
          const classIndex = classes.findIndex((c) => c.id === slot.classId);
          const accent = PASTEL_ACCENTS[(classIndex >= 0 ? classIndex : index) % PASTEL_ACCENTS.length];
          const code = (classInfo?.name.match(/\d+|[A-Za-z]/g) ?? []).slice(0, 2).join("").toUpperCase();

          return (
            <Pressable
              key={`${slot.classId}-${slot.start}`}
              onPress={() => router.push("/register")}
              className={`${accent.bg} rounded-lg p-sm flex-row items-center gap-sm`}>
              <View className="w-11 h-11 rounded-full bg-white items-center justify-center">
                <AppText weight="bold" className={`text-sm ${accent.onText}`}>
                  {code}
                </AppText>
              </View>
              <View className="flex-1">
                <AppText weight="bold" className={accent.onText} numberOfLines={1}>
                  {classInfo?.name ?? slot.classId}
                </AppText>
              </View>
              <View className="items-end">
                <AppText weight="bold" className={`text-sm ${accent.onText}`}>
                  {slot.start}
                </AppText>
                <AppText className={`text-xs ${accent.onText} opacity-75 mt-0.5`}>{slot.end}</AppText>
              </View>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

export default function TimetablePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const classes = useAppStore((s) => s.classes);
  const strip = useRef<ScrollView>(null);

  const today = new Date(`${todayStr()}T00:00:00`);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  // null = default view (Today + Tomorrow sections); set once a specific day is tapped.
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const CELL_STRIDE = 52; // w-11 (44) + gap-2 (8)

  const scrollToDay = (day: number) => {
    const x = Math.max(0, (day - 1) * CELL_STRIDE - CELL_STRIDE * 2);
    strip.current?.scrollTo({ x, animated: true });
  };

  const goToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    setSelectedIso(null);
    scrollToDay(today.getDate());
  };

  const changeMonth = (delta: number) => {
    let month = viewMonth + delta;
    let year = viewYear;
    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }
    setViewMonth(month);
    setViewYear(year);
    setSelectedIso(null);
    strip.current?.scrollTo({ x: 0, animated: true });
  };

  const days = useMemo(
    () => Array.from({ length: daysInMonth(viewYear, viewMonth) }, (_, i) => i + 1),
    [viewYear, viewMonth],
  );

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", { month: "long" }) + ` ${viewYear}`;
  const isDefaultTodayView = selectedIso === null && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const tomorrowIso = addDays(todayStr(), 1);

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="px-container-margin pt-sm pb-1">
        <View className="flex-row items-center gap-sm">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-surface-container items-center justify-center">
            <MaterialIcons name="arrow-back" size={20} color={colors.onSurface} />
          </Pressable>
          <AppText weight="bold" className="text-xl text-on-surface flex-1">
            {t.timetable.headerTitle}
          </AppText>
        </View>

        <View className="flex-row items-center justify-between mt-sm">
          <Pressable
            onPress={() => changeMonth(-1)}
            accessibilityLabel={t.timetable.previousMonth}
            className="w-11 h-11 rounded-full bg-surface-container items-center justify-center active:opacity-70">
            <MaterialIcons name="chevron-left" size={26} color={colors.onSurface} />
          </Pressable>
          <AppText weight="extrabold" className="text-lg text-on-surface" style={{ textAlign: "center" }}>
            {monthLabel}
          </AppText>
          <Pressable
            onPress={() => changeMonth(1)}
            accessibilityLabel={t.timetable.nextMonth}
            className="w-11 h-11 rounded-full bg-surface-container items-center justify-center active:opacity-70">
            <MaterialIcons name="chevron-right" size={26} color={colors.onSurface} />
          </Pressable>
        </View>
      </View>

      <View className="flex-row items-stretch gap-2 px-container-margin py-sm border-b border-outline-variant">
        <Pressable
          onPress={goToday}
          className={`px-3 rounded-xl items-center justify-center ${isDefaultTodayView ? "bg-primary" : "bg-surface-container"}`}>
          <AppText weight="bold" className={`text-[11px] ${isDefaultTodayView ? "text-on-primary" : "text-on-surface"}`}>
            {t.timetable.today}
          </AppText>
        </Pressable>
        <ScrollView ref={strip} horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          {days.map((day) => {
            const iso = isoOf(viewYear, viewMonth, day);
            const date = new Date(viewYear, viewMonth, day);
            const active = selectedIso ? iso === selectedIso : iso === todayStr();
            const busy = (MOCK_TIMETABLE[date.getDay()] ?? []).length > 0;
            return (
              <Pressable
                key={iso}
                onPress={() => setSelectedIso(iso)}
                className={`w-11 py-1.5 rounded-xl items-center gap-0.5 ${active ? "bg-primary" : "bg-surface-container-low"}`}>
                <AppText
                  weight="bold"
                  className={`text-[10px] tracking-wider ${active ? "text-on-primary opacity-70" : "text-on-surface-variant"}`}>
                  {DOW_LETTERS[date.getDay()]}
                </AppText>
                <AppText weight="bold" className={`text-base ${active ? "text-on-primary" : "text-on-surface"}`}>
                  {day}
                </AppText>
                <View
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: busy ? (active ? colors.onPrimary : colors.accent) : "transparent" }}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerClassName="px-container-margin pt-sm pb-24 gap-md" className="flex-1">
        {selectedIso === null ? (
          <>
            <DaySection iso={todayStr()} label={t.timetable.today} classes={classes} />
            <DaySection iso={tomorrowIso} label={t.timetable.tomorrow} classes={classes} />
          </>
        ) : (
          <DaySection
            iso={selectedIso}
            label={
              selectedIso === todayStr()
                ? t.timetable.today
                : new Date(`${selectedIso}T00:00:00`).toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
            }
            classes={classes}
          />
        )}
      </ScrollView>
    </View>
  );
}
