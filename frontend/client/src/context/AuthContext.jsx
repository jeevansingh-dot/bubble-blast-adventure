
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import axios from "axios";

const AuthContext = createContext();

const API_URL =
  "https://bubble-blast-adventure-4f4h.onrender.com/api";

const authAPI = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to requests
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  // CURRENT USER
  const fetchCurrentUser = async () => {
    try {
      const res = await authAPI.get("/auth/me");
      setUser(res.data.user);
    } catch (err) {
      console.error(
        "Session expired or invalid token:",
        err.response?.data || err.message
      );

      logout();
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const login = async (email, password) => {
    try {
      const payload = {
        email: String(email || "").trim(),
        password: String(password || ""),
      };

      const res = await authAPI.post(
        "/auth/login",
        payload
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
      }

      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed";

      throw new Error(message);
    }
  };

  // REGISTER
  // Registration will NOT automatically log in the user.
  const register = async ({
    name,
    email,
    password,
    confirmPassword,
  } = {}) => {
    try {
      const payload = {
        name: String(name || "").trim(),
        email: String(email || "").trim(),
        password: String(password || ""),
        confirmPassword: String(confirmPassword || ""),
      };

      const res = await authAPI.post(
        "/auth/register",
        payload
      );

      // Do not save registration token.
      // User must log in manually.
      localStorage.removeItem("token");
      setUser(null);

      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to create account";

      throw new Error(message);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
