import { api } from "./api";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiSession = {
  id: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  date: string;
};

export async function openSession(
  classId: string,
  subjectId: string,
): Promise<number> {
  const response = await api.post<ApiEnvelope<ApiSession>>("/sessions", {
    class_id: Number(classId),
    subject_id: Number(subjectId),
  });
  return response.data.data.id;
}

export type AttendanceStatus = "present" | "absent";

export async function markAttendance(
  sessionId: number,
  studentId: number,
  status: AttendanceStatus,
): Promise<void> {
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
  const response = await api.post<ApiEnvelope<ScanResult>>(
    `/sessions/${sessionId}/scan`,
    { qr_token: qrToken },
  );
  return response.data.data;
}
