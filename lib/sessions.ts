import { api } from "./api";
import { USE_MOCK_DATA } from "./mockConfig";
import { mockOpenSession, mockMarkAttendance, mockScanStudent } from "./mock/db";
import { mockDelay } from "./mock/delay";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiSession = {
  id: number;
  class_id: number;
  teacher_id: number;
  date: string;
};

export async function openSession(classId: string): Promise<number> {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return mockOpenSession(classId);
  }

  const response = await api.post<ApiEnvelope<ApiSession>>("/sessions", {
    class_id: Number(classId),
  });
  return response.data.data.id;
}

export type AttendanceStatus = "present" | "absent";

export async function markAttendance(
  sessionId: number,
  studentId: number,
  status: AttendanceStatus,
): Promise<void> {
  if (USE_MOCK_DATA) {
    await mockDelay();
    mockMarkAttendance(sessionId, studentId, status);
    return;
  }

  await api.patch(`/sessions/${sessionId}/attendance/${studentId}`, {
    status,
  });
}

export type ScanStudent = {
  id: number;
  class_id: number;
  name: string;
  guardian_name: string;
  guardian_whatsapp: string;
  qr_token: string;
  photo_url: string | null;
};

export type ScanRecord = {
  id: number;
  session_id: number;
  student_id: number;
  status: AttendanceStatus;
  method: "qr_scan" | "manual";
  arrived_at: string | null;
};

export type ScanResult = {
  status: "success" | "duplicate" | "not_found";
  student: ScanStudent | null;
  record: ScanRecord | null;
};

export async function scanStudent(
  sessionId: number,
  qrToken: string,
): Promise<ScanResult> {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return mockScanStudent(sessionId, qrToken);
  }

  const response = await api.post<ApiEnvelope<ScanResult>>(
    `/sessions/${sessionId}/scan`,
    { qr_token: qrToken },
  );
  return response.data.data;
}
