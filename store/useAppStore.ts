import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ClassInfo, RosterStudent } from "../data/classes";
import { todayStr } from "../lib/date";
import type { AuthUser } from "../lib/auth";
import { fetchClasses as fetchClassesRequest } from "../lib/classes";
import { fetchStudentsForClass as fetchStudentsForClassRequest } from "../lib/students";
import {
  openSession,
  markAttendance as markAttendanceRequest,
} from "../lib/sessions";

export type Language = "en" | "fr";

export type AttendanceRecord = { present: boolean; time?: string };

export type ClassSession = {
  id: string;
  classId: string;
  className: string;
  date: string;
  attendance: Record<number, AttendanceRecord>;
  remoteId: number | null;
  submittedAt: string | null;
};

type AppState = {
  authUser: AuthUser | null;
  activeSessionId: string | null;
  language: Language;
  sessions: ClassSession[];
  classes: ClassInfo[];
  classesLoading: boolean;
  studentsByClass: Record<string, RosterStudent[]>;
  studentsLoadingClassId: string | null;
  activeSession: () => ClassSession | undefined;
  setAuthUser: (authUser: AuthUser | null) => void;
  setActiveSession: (sessionId: string) => void;
  setLanguage: (language: Language) => void;
  logout: () => void;
  fetchClasses: () => Promise<void>;
  fetchStudentsForClass: (classId: string, force?: boolean) => Promise<void>;
  checkInClass: (classInfo: ClassInfo) => ClassSession | undefined;
  markStudentPresent: (
    sessionId: string,
    studentId: number,
    time: string,
  ) => void;
  unmarkStudent: (sessionId: string, studentId: number) => void;
  ensureSessionOpen: (sessionId: string) => Promise<number | null>;
  submitRegister: (
    sessionId: string,
  ) => Promise<{ success: boolean; failedCount: number }>;
};

export const useAppStore = create<AppState>()(
  persist<
    AppState,
    [],
    [],
    Pick<
      AppState,
      | "sessions"
      | "authUser"
      | "activeSessionId"
      | "studentsByClass"
      | "language"
    >
  >(
    (set, get) => ({
      authUser: null,
      activeSessionId: null,
      language: "fr",

      sessions: [],
      classes: [],
      classesLoading: false,
      studentsByClass: {},
      studentsLoadingClassId: null,

      activeSession: () => {
        const session = get().sessions.find(
          (s) => s.id === get().activeSessionId,
        );
        return session?.date === todayStr() ? session : undefined;
      },

      setAuthUser: (authUser) => set({ authUser }),

      setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

      setLanguage: (language) => set({ language }),

      logout: () => set({ authUser: null, activeSessionId: null }),

      fetchClasses: async () => {
        set({ classesLoading: true });
        try {
          const classes = await fetchClassesRequest();
          set({ classes });
        } finally {
          set({ classesLoading: false });
        }
      },

      fetchStudentsForClass: async (classId, force = false) => {
        if (!force && get().studentsByClass[classId]) return;

        set({ studentsLoadingClassId: classId });
        try {
          const students = await fetchStudentsForClassRequest(classId);
          set((state) => ({
            studentsByClass: { ...state.studentsByClass, [classId]: students },
          }));
        } finally {
          set({ studentsLoadingClassId: null });
        }
      },

      checkInClass: (classInfo) => {
        const today = todayStr();
        const existing = get().sessions.find(
          (s) => s.classId === classInfo.id && s.date === today,
        );
        if (existing) {
          set({ activeSessionId: existing.id });
          return existing;
        }

        const sessionId = `${classInfo.id}-${today}`;
        const session: ClassSession = {
          id: sessionId,
          classId: classInfo.id,
          className: classInfo.name,
          date: today,
          attendance: {},
          remoteId: null,
          submittedAt: null,
        };
        set((state) => ({
          sessions: [...state.sessions, session],
          activeSessionId: sessionId,
        }));

        openSession(classInfo.id)
          .then((remoteId) => {
            set((state) => ({
              sessions: state.sessions.map((s) =>
                s.id === sessionId ? { ...s, remoteId } : s,
              ),
            }));
          })
          .catch(() => {
            // remoteId stays null; submitRegister retries opening the session.
          });

        return session;
      },

      ensureSessionOpen: async (sessionId) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        if (!session) return null;
        if (session.remoteId !== null) return session.remoteId;

        try {
          const remoteId = await openSession(session.classId);
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === sessionId ? { ...s, remoteId } : s,
            ),
          }));
          return remoteId;
        } catch {
          return null;
        }
      },

      submitRegister: async (sessionId) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        if (!session) return { success: false, failedCount: 0 };

        const remoteId = await get().ensureSessionOpen(sessionId);
        if (remoteId === null) return { success: false, failedCount: 0 };

        const roster = get().studentsByClass[session.classId] ?? [];

        const results = await Promise.allSettled(
          roster.map((student) =>
            markAttendanceRequest(
              remoteId,
              student.id,
              session.attendance[student.id]?.present ? "present" : "absent",
            ),
          ),
        );

        const failedCount = results.filter((r) => r.status === "rejected").length;

        if (failedCount === 0) {
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === sessionId
                ? { ...s, submittedAt: new Date().toISOString() }
                : s,
            ),
          }));
        }

        return { success: failedCount === 0, failedCount };
      },

      markStudentPresent: (sessionId, studentId, time) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  attendance: {
                    ...s.attendance,
                    [studentId]: { present: true, time },
                  },
                  submittedAt: null,
                }
              : s,
          ),
        }));
      },

      unmarkStudent: (sessionId, studentId) => {
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const attendance = { ...s.attendance };
            delete attendance[studentId];
            return { ...s, attendance, submittedAt: null };
          }),
        }));
      },
    }),
    {
      name: "Present-sessions",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        authUser: state.authUser,
        activeSessionId: state.activeSessionId,
        studentsByClass: state.studentsByClass,
        language: state.language,
      }),
    },
  ),
);
