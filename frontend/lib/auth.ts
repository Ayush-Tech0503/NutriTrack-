const TOKEN_KEY = "nutritrack_token";
const THEME_KEY = "nutritrack_theme";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getTheme() {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(THEME_KEY) || "light";
}

export function setTheme(theme: "light" | "dark") {
  window.localStorage.setItem(THEME_KEY, theme);
}

