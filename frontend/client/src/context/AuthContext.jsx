import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      setUser(res.data.user);
    } catch (err) {
      console.error('Session expired or invalid token:', err);
      logout(); // Invalid token hone par cleanly logout kar dega
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const payload = {
      email: String(email || '').trim(),
      password: String(password || '')
    };

    const res = await axios.post(`${API_URL}/auth/login`, payload);
    
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password, confirmPassword) => {
    const payload = {
      name: String(name || '').trim(),
      email: String(email || '').trim(),
      password: String(password || ''),
      confirmPassword: String(confirmPassword || '')
    };

    const res = await axios.post(`${API_URL}/auth/register`, payload);

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);