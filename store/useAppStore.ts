import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ClassInfo, RosterStudent } from "../data/classes";
import type { Subject } from "../data/subjects";
import { todayStr } from "../lib/date";
import { baseURL } from "../lib/api";
import type { AuthUser } from "../lib/auth";
import type { Guardian } from "../lib/parent";
import { fetchClasses as fetchClassesRequest } from "../lib/classes";
import { fetchStudentsForClass as fetchStudentsForClassRequest } from "../lib/students";
import { fetchMySubjects } from "../lib/subjects";
import {
  openSession,
  markAttendance as markAttendanceRequest,
} from "../lib/sessions";

export type Language = "en" | "fr";

export type AttendanceRecord = { present: boolean; absent?: boolean; time?: string };

export type ClassSession = {
  id: string;
  classId: string;
  className: string;
  date: string;
  subjectCode: string;
  attendance: Record<number, AttendanceRecord>;
  remoteId: number | null;
  submittedAt: string | null;
};

// Which server + account the cached rosters and sessions came from. Their ids
// only mean something on that server, for that teacher.
const cacheOwnerFor = (authUser: AuthUser) => `${baseURL}#${authUser.id}`;

type AppState = {
  authUser: AuthUser | null;
  cacheOwner: string | null;
  parentGuardian: Guardian | null;
  parentPushToken: string | null;
  parentUnreadCount: number;
  setParentGuardian: (guardian: Guardian | null) => void;
  setParentPushToken: (token: string | null) => void;
  setParentUnreadCount: (count: number) => void;
  activeSubjectCode: string | null;
  activeSessionId: string | null;
  language: Language;
  sessions: ClassSession[];
  classes: ClassInfo[];
  classesLoading: boolean;
  studentsByClass: Record<string, RosterStudent[]>;
  studentsLoadingClassId: string | null;
  subjects: Subject[];
  subjectsLoading: boolean;
  activeSession: () => ClassSession | undefined;
  setAuthUser: (authUser: AuthUser | null) => void;
  setActiveSubject: (code: string) => void;
  setActiveSession: (sessionId: string) => void;
  setLanguage: (language: Language) => void;
  logout: () => void;
  fetchClasses: () => Promise<void>;
  fetchStudentsForClass: (classId: string, force?: boolean) => Promise<void>;
  fetchSubjects: () => Promise<void>;
  checkInClass: (
    classInfo: ClassInfo,
    subjectCode: string,
  ) => ClassSession | undefined;
  markStudentPresent: (
    sessionId: string,
    studentId: number,
    time: string,
  ) => void;
  markStudentAbsent: (sessionId: string, studentId: number) => void;
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
      | "cacheOwner"
      | "parentGuardian"
      | "parentPushToken"
      | "activeSubjectCode"
      | "activeSessionId"
      | "studentsByClass"
      | "language"
    >
  >(
    (set, get) => ({
      authUser: null,
      cacheOwner: null,
      parentGuardian: null,
      parentPushToken: null,
      parentUnreadCount: 0,
      activeSubjectCode: null,
      activeSessionId: null,
      language: "fr",

      sessions: [],
      classes: [],
      classesLoading: false,
      studentsByClass: {},
      studentsLoadingClassId: null,
      subjects: [],
      subjectsLoading: false,

      activeSession: () => {
        const session = get().sessions.find(
          (s) => s.id === get().activeSessionId,
        );
        return session?.date === todayStr() ? session : undefined;
      },

      setAuthUser: (authUser) => {
        if (!authUser) {
          set({ authUser });
          return;
        }

        const cacheOwner = cacheOwnerFor(authUser);
        if (cacheOwner === get().cacheOwner) {
          set({ authUser });
          return;
        }

        // A different account or server: the cached session and student ids
        // belong to another database, so submitting them would be rejected.
        set({
          authUser,
          cacheOwner,
          sessions: [],
          studentsByClass: {},
          classes: [],
          subjects: [],
          activeSessionId: null,
          activeSubjectCode: null,
        });
      },

      setParentGuardian: (parentGuardian) =>
        set(parentGuardian ? { parentGuardian } : { parentGuardian, parentUnreadCount: 0 }),

      setParentPushToken: (parentPushToken) => set({ parentPushToken }),

      setParentUnreadCount: (parentUnreadCount) => set({ parentUnreadCount }),

      setActiveSubject: (code) => set({ activeSubjectCode: code }),

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

      fetchSubjects: async () => {
        set({ subjectsLoading: true });
        try {
          const subjects = await fetchMySubjects();
          set((state) => ({
            subjects,
            // A previously-selected subject may no longer be assigned to
            // this teacher (or its id may have shifted) — don't keep
            // auto-selecting a subject that's no longer valid.
            activeSubjectCode: subjects.some(
              (subject) => subject.code === state.activeSubjectCode,
            )
              ? state.activeSubjectCode
              : null,
          }));
        } finally {
          set({ subjectsLoading: false });
        }
      },

      checkInClass: (classInfo, subjectCode) => {
        if (!subjectCode) return undefined;

        const today = todayStr();
        const existing = get().sessions.find(
          (s) =>
            s.classId === classInfo.id &&
            s.subjectCode === subjectCode &&
            s.date === today,
        );
        if (existing) {
          set({ activeSessionId: existing.id });
          return existing;
        }

        const sessionId = `${classInfo.id}-${subjectCode}-${today}`;
        const session: ClassSession = {
          id: sessionId,
          classId: classInfo.id,
          className: classInfo.name,
          date: today,
          subjectCode,
          attendance: {},
          remoteId: null,
          submittedAt: null,
        };
        set((state) => ({
          sessions: [...state.sessions, session],
          activeSessionId: sessionId,
        }));

        openSession(classInfo.id, subjectCode)
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
          const remoteId = await openSession(session.classId, session.subjectCode);
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

        const entries = Object.entries(session.attendance) as [
          string,
          AttendanceRecord,
        ][];

        const results = await Promise.allSettled(
          entries.map(([studentId, record]) =>
            markAttendanceRequest(
              remoteId,
              Number(studentId),
              record.present ? "present" : "absent",
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

      markStudentAbsent: (sessionId, studentId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  attendance: {
                    ...s.attendance,
                    [studentId]: { present: false, absent: true },
                  },
                  submittedAt: null,
                }
              : s,
          ),
        }));
      },
    }),
    {
      name: "Present-sessions",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        authUser: state.authUser,
        cacheOwner: state.cacheOwner,
        parentGuardian: state.parentGuardian,
        parentPushToken: state.parentPushToken,
        activeSubjectCode: state.activeSubjectCode,
        activeSessionId: state.activeSessionId,
        studentsByClass: state.studentsByClass,
        language: state.language,
      }),
    },
  ),
);
