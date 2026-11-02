import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService.js";
import { getToken, setToken } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true while we check a saved token when the page first opens
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;

    authService
      .fetchMe()
      .then(setUser)
      .catch((err) => {
        // expired or invalid token: forget it. (Network errors keep the token.)
        if (err.status === 401) setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const u = await authService.login(credentials);
    setUser(u);
    return u;
  }

  async function register(details) {
    const u = await authService.register(details);
    setUser(u);
    return u;
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}