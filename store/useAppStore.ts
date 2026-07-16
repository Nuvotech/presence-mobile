import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ClassInfo } from '../data/classes';
import { todayStr } from '../lib/date';

export type AttendanceRecord = { present: boolean; time?: string };

export type ClassSession = {
  id: string;
  classId: string;
  className: string;
  date: string;
  attendance: Record<number, AttendanceRecord>;
};

type AppState = {
  teacher: { name: string; email: string; avatarUri: string };
  sessions: ClassSession[];
  todaysSession: () => ClassSession | undefined;
  checkInClass: (classInfo: ClassInfo) => ClassSession;
  markStudentPresent: (sessionId: string, studentId: number, time: string) => void;
};

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], Pick<AppState, 'sessions'>>(
    (set, get) => ({
      teacher: {
        name: 'Ms. Henderson',
        email: 'henderson@school.edu',
        avatarUri:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAHsl0QC6UjlQGvDrywRyTFyp5_CRwjPYp0WvLyDy3ly6B8AiNbs73a9cEWY_pXRkBfYmAwAw6MdRN3lCITFfjVxVs-JTjw9KR293NzVJU25pGQZT_PhDtByseY9VcaYxLHxQ7NY0HoRnYshlx5dMO3pQQA6UvU1O8ZW05Pam4oKnC0kKIg1O7d7qg6WUqpES57ThV9KdIaTjEIS6BFtN6tUlb-neeL555cjLXf7bocj4a0GiR7J9Cyrg',
      },

      sessions: [],

      todaysSession: () => get().sessions.find((s) => s.date === todayStr()),

      checkInClass: (classInfo) => {
        const today = todayStr();
        const existingToday = get().sessions.find((s) => s.date === today);
        if (existingToday) return existingToday;

        const session: ClassSession = {
          id: `${classInfo.id}-${today}`,
          classId: classInfo.id,
          className: classInfo.name,
          date: today,
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
      partialize: (state) => ({ sessions: state.sessions }),
    }
  )
);
