import { apiRequest, setToken } from "./api.js";

export async function register({ name, email, password, confirmPassword }) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: { name, email, password, confirmPassword },
    auth: false,
  });
  setToken(data.token);
  return data.user;
}

export async function login({ email, password }) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setToken(data.token);
  return data.user;
}

// Who is logged in? (uses the saved token)
export async function fetchMe() {
  const data = await apiRequest("/auth/me");
  return data.user;
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    // even if the server can't be reached we still log out locally
  }
  setToken(null);
}