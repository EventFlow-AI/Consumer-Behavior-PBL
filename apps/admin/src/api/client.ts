const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

export function getToken() {
  return localStorage.getItem("eventflow_admin_token");
}

export function setToken(token: string) {
  localStorage.setItem("eventflow_admin_token", token);
}

export function clearToken() {
  localStorage.removeItem("eventflow_admin_token");
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }

  return data as T;
}