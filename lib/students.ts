import { api } from "./api";
import type { RosterStudent } from "../data/classes";
import { AVATAR_COLORS, initialsFor } from "./avatar";
import { USE_MOCK_DATA } from "./mockConfig";
import { MOCK_STUDENTS } from "./mock/data";
import { mockDelay } from "./mock/delay";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiStudent = {
  id: number;
  class_id: number;
  name: string;
  guardian_name: string;
  guardian_whatsapp: string;
  qr_token: string;
  photo_url: string | null;
};

export const studentIdFor = (id: number) => `SC-2024-88${String(id).padStart(2, "0")}`;

export async function fetchStudentsForClass(
  classId: string,
): Promise<RosterStudent[]> {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return MOCK_STUDENTS[classId] ?? [];
  }

  const response = await api.get<ApiEnvelope<ApiStudent[]>>(
    `/classes/${classId}/students`,
  );

  return response.data.data.map((student, index) => ({
    id: student.id,
    name: student.name,
    initials: initialsFor(student.name),
    color: AVATAR_COLORS[index % AVATAR_COLORS.length],
    img: student.photo_url ?? undefined,
    qrToken: student.qr_token,
    guardianName: student.guardian_name || undefined,
    guardianContact: student.guardian_whatsapp || undefined,
  }));
}
