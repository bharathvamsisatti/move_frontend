// src/authClient.js
const TOKEN_KEY = "token";
export const API_BASE =
  import.meta.env.VITE_API_URL;
  

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export class AuthError extends Error {
  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    throw new AuthError("Session expired or unauthorized", 401);
  }

  return res;
}

export function handleAuthError(err, navigate) {
  if (err instanceof AuthError && err.status === 401) {
    clearToken();
    navigate("/login?expired=true", { replace: true });
  }
}
