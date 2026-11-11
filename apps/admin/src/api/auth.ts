import {
  apiRequest,
  clearToken,
  getStoredUserJson,
  setStoredUserJson,
  setToken,
} from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    token: string;
  };
}

interface MeResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
  };
}

function persistAdminUser(user: AuthUser) {
  setStoredUserJson(JSON.stringify(user));
}

export function getStoredAdminUser(): AuthUser | null {
  const raw = getStoredUserJson();
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed?.role === "ADMIN" ? parsed : null;
  } catch {
    return null;
  }
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  if (response.data.user.role !== "ADMIN") {
    clearToken();
    throw new Error(
      "This account does not have administrator access. Use an ADMIN account.",
    );
  }

  setToken(response.data.token);
  persistAdminUser(response.data.user);

  return response.data.user;
}

export async function fetchCurrentAdmin(): Promise<AuthUser> {
  const response = await apiRequest<MeResponse>("/auth/me");

  if (response.data.user.role !== "ADMIN") {
    clearToken();
    throw new Error("Administrator privileges are required");
  }

  persistAdminUser(response.data.user);
  return response.data.user;
}

export function logoutAdmin() {
  clearToken();
}
