import axios from 'axios';

const API = axios.create({
  // Last mein /api lagana zaroori hai!
  baseURL: 'https://bubble-blast-adventure-4f4h.onrender.com/api',
});

// Automatically attach token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiRequest = async (method, url, data = null) => {
  try {
    const config = { method, url };
    if (method.toUpperCase() === 'GET') {
      config.params = data;
    } else {
      config.data = data;
    }

    const response = await API(config);
    return response.data;
  } catch (error) {
    console.error(`API Error [${method} ${url}]:`, error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};