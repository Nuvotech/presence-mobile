import { api } from "./api";
import type { RosterStudent } from "../data/classes";

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

const AVATAR_COLORS = [
  "bg-secondary-container",
  "bg-tertiary-fixed",
  "bg-secondary-fixed-dim",
  "bg-error-container",
];

const initialsFor = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

export async function fetchStudentsForClass(
  classId: string,
): Promise<RosterStudent[]> {
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
  }));
}
