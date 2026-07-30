import { clearToken, getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = typeof window !== "undefined" ? getToken() : null;
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });
    if (response.status === 401) {
      if (typeof window !== "undefined") clearToken();
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || `Request failed with status ${response.status}`);
    }
    if (response.status === 204) return null;
    return await response.json();
  } catch (err: any) {
    console.warn(`[apiFetch] Request to ${path} failed:`, err?.message || err);
    if (typeof window === "undefined") {
      return null;
    }
    throw err;
  }
}
