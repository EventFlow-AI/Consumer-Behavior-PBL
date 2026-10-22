import { apiRequest, clearToken, setToken } from "./client";

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

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (response.data.user.role !== "ADMIN") {
    clearToken();
    throw new Error("This account does not have admin access");
  }

  setToken(response.data.token);

  return response.data.user;
}

export function logoutAdmin() {
  clearToken();
}