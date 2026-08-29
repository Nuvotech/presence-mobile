import type { AuthUser } from "../auth";
import type { ClassInfo, RosterStudent } from "../../data/classes";
import { AVATAR_COLORS, initialsFor } from "../avatar";
import { studentPhotoUri } from "../../data/students";

export type MockTeacher = {
  email: string;
  password: string;
  user: AuthUser;
};

export const MOCK_TEACHERS: MockTeacher[] = [
  {
    email: "presley@school.cd",
    password: "password123",
    user: {
      id: 1,
      name: "Presley Tshomba",
      email: "presley@school.cd",
      role: "teacher",
      school: { id: 1, name: "École Nuvotech" },
    },
  },
  {
    email: "admin@school.cd",
    password: "password123",
    user: {
      id: 2,
      name: "Admin User",
      email: "admin@school.cd",
      role: "admin",
      school: { id: 1, name: "École Nuvotech" },
    },
  },
];

export const MOCK_CLASSES: ClassInfo[] = [
  { id: "1", qrCode: "CLASS-6EME-A", name: "6eme A", roster: [] },
  { id: "2", qrCode: "CLASS-5EME-B", name: "5eme B", roster: [] },
  { id: "3", qrCode: "CLASS-4EME-A", name: "4eme A", roster: [] },
];

type StudentSeed = { id: number; name: string; guardian: string; img?: boolean };

const buildRoster = (seeds: StudentSeed[]): RosterStudent[] =>
  seeds.map((seed, index) => ({
    id: seed.id,
    name: seed.name,
    initials: initialsFor(seed.name),
    color: AVATAR_COLORS[index % AVATAR_COLORS.length],
    img: seed.img ? studentPhotoUri : undefined,
    qrToken: `STU-${seed.id}-QR`,
    guardianName: seed.guardian,
    guardianContact: `guardian.${seed.id}@example.org`,
  }));

export type TimetableSlot = { classId: string; start: string; end: string };

// Keyed by JS day-of-week (0 = Sunday .. 6 = Saturday).
export const MOCK_TIMETABLE: Record<number, TimetableSlot[]> = {
  0: [],
  1: [
    { classId: "1", start: "08:00", end: "09:00" },
    { classId: "2", start: "09:15", end: "10:15" },
    { classId: "3", start: "10:30", end: "11:30" },
  ],
  2: [
    { classId: "3", start: "08:00", end: "09:00" },
    { classId: "1", start: "09:15", end: "10:15" },
  ],
  3: [{ classId: "2", start: "08:00", end: "09:00" }],
  4: [
    { classId: "1", start: "08:00", end: "09:00" },
    { classId: "3", start: "09:15", end: "10:15" },
    { classId: "2", start: "10:30", end: "11:30" },
  ],
  5: [
    { classId: "3", start: "08:00", end: "09:00" },
    { classId: "1", start: "09:15", end: "10:15" },
  ],
  6: [],
};

export const MOCK_STUDENTS: Record<string, RosterStudent[]> = {
  "1": buildRoster([
    { id: 101, name: "Amir Hirthe", guardian: "Bernita Hirthe" },
    { id: 102, name: "Remington Boyle", guardian: "Devante Boyle" },
    { id: 103, name: "Christina Walsh", guardian: "Reagan Walsh" },
    { id: 104, name: "Shane Yundt", guardian: "Yazmin Yundt" },
    { id: 105, name: "Aria Anderson", guardian: "Grayce Anderson", img: true },
    { id: 106, name: "Benjamin Carter", guardian: "Chanel Carter" },
  ]),
  "2": buildRoster([
    { id: 201, name: "Chloe Lewis", guardian: "Madonna Lewis" },
    { id: 202, name: "David Wong", guardian: "Kyla Wong", img: true },
    { id: 203, name: "Elena Fischer", guardian: "Reagan Fischer" },
    { id: 204, name: "Henry Smith", guardian: "Bernita Smith" },
    { id: 205, name: "Isabella Miller", guardian: "Shane Miller" },
  ]),
  "3": buildRoster([
    { id: 301, name: "Julian Anderson", guardian: "Kyla Anderson" },
    { id: 302, name: "Kayla Brooks", guardian: "Amir Brooks" },
    { id: 303, name: "Liam Foster", guardian: "Christina Foster" },
    { id: 304, name: "Maya Okafor", guardian: "Devante Okafor" },
    { id: 305, name: "Noah Kessler", guardian: "Grayce Kessler" },
    { id: 306, name: "Olivia Chen", guardian: "Remington Chen" },
    { id: 307, name: "Pierre Dubois", guardian: "Yazmin Dubois" },
  ]),
};
