import { api } from "./api";
import type { ClassInfo } from "../data/classes";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiClass = {
  id: number;
  name: string;
  qr_token: string;
};

export async function fetchClasses(): Promise<ClassInfo[]> {
  const response = await api.get<ApiEnvelope<ApiClass[]>>("/classes");
  return response.data.data.map((c) => ({
    id: String(c.id),
    qrCode: c.qr_token,
    name: c.name,
    roster: [],
  }));
}
