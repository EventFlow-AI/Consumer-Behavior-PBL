import {
  apiRequest,
  clearToken,
  setToken,
} from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    token: string;
  };
}

export async function login(
  email: string,
  password: string,
) {
  const response = await apiRequest<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  setToken(response.data.token);

  return response.data.user;
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const response = await apiRequest<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

  setToken(response.data.token);

  return response.data.user;
}

export function logout() {
  clearToken();
}