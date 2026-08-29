import { api } from "./api";
import type { ClassInfo } from "../data/classes";
import { USE_MOCK_DATA } from "./mockConfig";
import { MOCK_CLASSES } from "./mock/data";
import { mockDelay } from "./mock/delay";

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
  if (USE_MOCK_DATA) {
    await mockDelay();
    return MOCK_CLASSES;
  }

  const response = await api.get<ApiEnvelope<ApiClass[]>>("/classes");
  return response.data.data.map((c) => ({
    id: String(c.id),
    qrCode: c.qr_token,
    name: c.name,
    roster: [],
  }));
}
