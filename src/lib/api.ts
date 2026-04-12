const API_URL = "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("access_token");
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Request failed");
  }

  return data;
}

export const api = {
  login: (email: string, password: string) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signupProfessional: (
    email: string,
    password: string,
    full_name: string
  ) =>
    request("/auth/signup/professional", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    }),

  health: () => request("/health"),
};