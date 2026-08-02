import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ClassInfo } from '../data/classes';
import { teachers, type Teacher } from '../data/teachers';
import { todayStr } from '../lib/date';

export type AttendanceRecord = { present: boolean; time?: string };

export type ClassSession = {
  id: string;
  classId: string;
  className: string;
  date: string;
  subjectCode: string;
  attendance: Record<number, AttendanceRecord>;
};

type AppState = {
  teacher: Teacher;
  activeSubjectCode: string | null;
  sessions: ClassSession[];
  todaysSession: () => ClassSession | undefined;
  setTeacher: (teacherId: string) => void;
  setActiveSubject: (code: string) => void;
  checkInClass: (classInfo: ClassInfo, subjectCode: string) => ClassSession;
  markStudentPresent: (sessionId: string, studentId: number, time: string) => void;
};

const subjectForSingleSubjectTeacher = (teacher: Teacher) =>
  teacher.subjects.length === 1 ? teacher.subjects[0].code : null;

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], Pick<AppState, 'sessions' | 'teacher' | 'activeSubjectCode'>>(
    (set, get) => ({
      teacher: teachers[0],
      activeSubjectCode: subjectForSingleSubjectTeacher(teachers[0]),

      sessions: [],

      todaysSession: () => get().sessions.find((s) => s.date === todayStr()),

      setTeacher: (teacherId) => {
        const teacher = teachers.find((t) => t.id === teacherId) ?? teachers[0];
        set({ teacher, activeSubjectCode: subjectForSingleSubjectTeacher(teacher) });
      },

      setActiveSubject: (code) => set({ activeSubjectCode: code }),

      checkInClass: (classInfo, subjectCode) => {
        const today = todayStr();
        const existingToday = get().sessions.find((s) => s.date === today);
        if (existingToday) return existingToday;

        const session: ClassSession = {
          id: `${classInfo.id}-${today}`,
          classId: classInfo.id,
          className: classInfo.name,
          date: today,
          subjectCode,
          attendance: {},
        };
        set((state) => ({ sessions: [...state.sessions, session] }));
        return session;
      },

      markStudentPresent: (sessionId, studentId, time) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, attendance: { ...s.attendance, [studentId]: { present: true, time } } }
              : s
          ),
        }));
      },
    }),
    {
      name: 'schoolclock-sessions',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        teacher: state.teacher,
        activeSubjectCode: state.activeSubjectCode,
      }),
    }
  )
);
