import type { AttendanceStatus, ScanResult } from "../sessions";
import { MOCK_STUDENTS } from "./data";

type MockAttendanceEntry = { status: AttendanceStatus; arrivedAt: string | null };

type MockSessionRecord = {
  id: number;
  classId: string;
  date: string;
  attendance: Map<number, MockAttendanceEntry>;
};

let nextSessionId = 1;
const sessionsById = new Map<number, MockSessionRecord>();

const todayKey = () => new Date().toISOString().slice(0, 10);

export function mockOpenSession(classId: string): number {
  const date = todayKey();
  const existing = [...sessionsById.values()].find(
    (s) => s.classId === classId && s.date === date,
  );
  if (existing) return existing.id;

  const session: MockSessionRecord = {
    id: nextSessionId++,
    classId,
    date,
    attendance: new Map(),
  };
  sessionsById.set(session.id, session);
  return session.id;
}

export function mockMarkAttendance(
  sessionId: number,
  studentId: number,
  status: AttendanceStatus,
): void {
  const session = sessionsById.get(sessionId);
  if (!session) return;
  session.attendance.set(studentId, {
    status,
    arrivedAt: status === "present" ? new Date().toISOString() : null,
  });
}

export function mockScanStudent(sessionId: number, qrToken: string): ScanResult {
  const session = sessionsById.get(sessionId);
  const roster = session ? (MOCK_STUDENTS[session.classId] ?? []) : [];
  const student = roster.find((s) => s.qrToken === qrToken) ?? null;

  if (!session || !student) {
    return { status: "not_found", student: null, record: null };
  }

  const existing = session.attendance.get(student.id);
  const scanStudent = {
    id: student.id,
    class_id: Number(session.classId),
    name: student.name,
    guardian_name: student.guardianName ?? `Guardian of ${student.name}`,
    guardian_whatsapp: student.guardianContact ?? "",
    qr_token: student.qrToken,
    photo_url: student.img ?? null,
  };

  if (existing) {
    return {
      status: "duplicate",
      student: scanStudent,
      record: {
        id: student.id,
        session_id: sessionId,
        student_id: student.id,
        status: existing.status,
        method: "qr_scan",
        arrived_at: existing.arrivedAt,
      },
    };
  }

  const arrivedAt = new Date().toISOString();
  session.attendance.set(student.id, { status: "present", arrivedAt });
  return {
    status: "success",
    student: scanStudent,
    record: {
      id: student.id,
      session_id: sessionId,
      student_id: student.id,
      status: "present",
      method: "qr_scan",
      arrived_at: arrivedAt,
    },
  };
}
