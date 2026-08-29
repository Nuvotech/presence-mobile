import { api, clearToken, setToken } from "./api";
import { USE_MOCK_DATA } from "./mockConfig";
import { MOCK_TEACHERS } from "./mock/data";
import { mockDelay } from "./mock/delay";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "teacher" | "admin";
  school?: { id: number; name: string } | null;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AuthErrorCode = "invalid_credentials" | "network";

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.code = code;
  }
}

let mockCurrentUser: AuthUser | null = null;

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  if (USE_MOCK_DATA) {
    await mockDelay();
    const teacher = MOCK_TEACHERS.find(
      (t) => t.email.toLowerCase() === email.trim().toLowerCase() && t.password === password,
    );
    if (!teacher) {
      throw new AuthError("invalid_credentials");
    }
    mockCurrentUser = teacher.user;
    return teacher.user;
  }

  try {
    const response = await api.post<
      ApiEnvelope<{ token: string; user: AuthUser }>
    >("/login", { email, password });

    await setToken(response.data.data.token);
    return response.data.data.user;
  } catch (error) {
    if (axiosIsValidationError(error)) {
      throw new AuthError("invalid_credentials");
    }
    throw new AuthError("network");
  }
}

export async function fetchMe(): Promise<AuthUser> {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return mockCurrentUser ?? MOCK_TEACHERS[0].user;
  }

  const response =
    await api.get<ApiEnvelope<AuthUser>>("/me");
  return response.data.data;
}

export async function logout(): Promise<void> {
  if (USE_MOCK_DATA) {
    mockCurrentUser = null;
    return;
  }

  try {
    await api.post("/logout");
  } finally {
    await clearToken();
  }
}

function axiosIsValidationError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === 422
  );
}
