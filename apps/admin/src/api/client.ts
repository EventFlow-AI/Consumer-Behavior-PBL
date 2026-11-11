const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

const TOKEN_STORAGE_KEY = "eventflow_admin_token";
const USER_STORAGE_KEY = "eventflow_admin_user";

export const AUTH_UNAUTHORIZED_EVENT = "eventflow:admin-unauthorized";

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getStoredUserJson() {
  return localStorage.getItem(USER_STORAGE_KEY);
}

export function setStoredUserJson(value: string) {
  localStorage.setItem(USER_STORAGE_KEY, value);
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      `Unable to reach the API server (${API_BASE_URL}). Verify the backend is running.`,
    );
  }

  const rawBody = await response.text();
  let data: { message?: string } | null = null;

  if (rawBody) {
    try {
      data = JSON.parse(rawBody) as { message?: string };
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && endpoint !== "/auth/login") {
      clearToken();
      window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
    }

    throw new Error(
      data?.message ?? `Request failed (${response.status} ${response.statusText})`,
    );
  }

  return data as T;
}
