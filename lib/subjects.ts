import { api } from "./api";
import type { Subject } from "../data/subjects";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiSubject = {
  id: number;
  name: string;
};

export async function fetchMySubjects(): Promise<Subject[]> {
  const response = await api.get<ApiEnvelope<ApiSubject[]>>("/me/subjects");
  return response.data.data.map((s) => ({
    code: String(s.id),
    label: s.name,
  }));
}
