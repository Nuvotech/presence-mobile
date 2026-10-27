import { api, clearToken, setToken } from "./api";
import { AuthError } from "./auth";

export type Guardian = {
  id: number;
  name: string;
  phone: string;
  must_change_password: boolean;
  school?: { id: number; name: string } | null;
};

export type TodayStatus = "present" | "absent" | "not_recorded";

export type Child = {
  id: number;
  name: string;
  class_name: string | null;
  photo_url: string | null;
  today_status?: TodayStatus;
  arrived_at?: string | null;
};

export type ParentNotification = {
  id: number;
  message: string;
  student: { id: number; name: string };
  created_at: string | null;
  read_at: string | null;
};

export type ChildAttendance = {
  id: number;
  date: string;
  subject: string | null;
  status: "present" | "absent";
  arrived_at: string | null;
};

type ApiEnvelope<T, M = undefined> = {
  success: boolean;
  message: string;
  data: T;
  meta: M;
};

type PageMeta = { current_page: number; last_page: number; total: number };

export type NotificationsPage = {
  notifications: ParentNotification[];
  unreadCount: number;
  hasMore: boolean;
};

export type AttendancePage = {
  child: Child;
  records: ChildAttendance[];
  present: number;
  absent: number;
  hasMore: boolean;
};

export class PasswordChangeError extends Error {
  field: "current_password" | "password" | "network";

  constructor(field: PasswordChangeError["field"], message: string) {
    super(message);
    this.field = field;
  }
}

function statusOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } })?.response?.status;
}

export async function parentLogin(
  phone: string,
  password: string,
): Promise<Guardian> {
  try {
    const response = await api.post<
      ApiEnvelope<{ token: string; guardian: Guardian }>
    >("/parent/login", { phone, password });

    await setToken(response.data.data.token);
    return response.data.data.guardian;
  } catch (error) {
    throw new AuthError(
      statusOf(error) === 422 ? "invalid_credentials" : "network",
    );
  }
}

export async function fetchGuardian(): Promise<Guardian> {
  const response = await api.get<ApiEnvelope<Guardian>>("/parent/me");
  return response.data.data;
}

export async function changePassword(
  currentPassword: string,
  password: string,
): Promise<Guardian> {
  try {
    const response = await api.put<ApiEnvelope<Guardian>>("/parent/password", {
      current_password: currentPassword,
      password,
      password_confirmation: password,
    });
    return response.data.data;
  } catch (error) {
    const errors = (
      error as { response?: { data?: { errors?: Record<string, string[]> } } }
    )?.response?.data?.errors;

    if (statusOf(error) === 422 && errors) {
      const field = errors.current_password ? "current_password" : "password";
      throw new PasswordChangeError(field, errors[field]?.[0] ?? "");
    }
    throw new PasswordChangeError("network", "");
  }
}

export async function fetchChildren(): Promise<Child[]> {
  const response = await api.get<ApiEnvelope<Child[]>>("/parent/children");
  return response.data.data;
}

export async function fetchChildAttendance(
  childId: number,
  page = 1,
): Promise<AttendancePage> {
  const response = await api.get<
    ApiEnvelope<
      ChildAttendance[],
      PageMeta & { child: Child; present: number; absent: number }
    >
  >(`/parent/children/${childId}/attendance`, { params: { page } });

  const { meta, data } = response.data;
  return {
    child: meta.child,
    records: data,
    present: meta.present,
    absent: meta.absent,
    hasMore: meta.current_page < meta.last_page,
  };
}

export async function fetchNotifications(page = 1): Promise<NotificationsPage> {
  const response = await api.get<
    ApiEnvelope<ParentNotification[], PageMeta & { unread_count: number }>
  >("/parent/notifications", { params: { page } });

  const { meta, data } = response.data;
  return {
    notifications: data,
    unreadCount: meta.unread_count,
    hasMore: meta.current_page < meta.last_page,
  };
}

export async function markNotificationsRead(ids?: number[]): Promise<number> {
  const response = await api.post<ApiEnvelope<{ unread_count: number }>>(
    "/parent/notifications/read",
    ids ? { ids } : {},
  );
  return response.data.data.unread_count;
}

export async function registerPushToken(token: string): Promise<void> {
  await api.post("/parent/push-tokens", { token });
}

export async function parentLogout(pushToken: string | null): Promise<void> {
  try {
    await api.post("/parent/logout", pushToken ? { push_token: pushToken } : {});
  } finally {
    await clearToken();
  }
}
