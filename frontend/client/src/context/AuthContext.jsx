
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'https://bubble-blast-adventure-4f4h.onrender.com/api';

const authAPI = axios.create({
  baseURL: API_URL,
});

authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await authAPI.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.error('Session expired or invalid token:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const payload = {
      email: String(email || '').trim(),
      password: String(password || ''),
    };

    const res = await authAPI.post('/auth/login', payload);

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    }

    return res.data;
  };

  const register = async (name, email, password, confirmPassword) => {
    const payload = {
      name: String(name || '').trim(),
      email: String(email || '').trim(),
      password: String(password || ''),
      confirmPassword: String(confirmPassword || ''),
    };

    const res = await authAPI.post('/auth/register', payload);

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    }

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
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
