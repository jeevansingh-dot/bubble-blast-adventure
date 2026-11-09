import axios from 'axios';

const API = axios.create({
 
  baseURL: import.meta.env.VITE_API_URL || 'https://your-backend-render-app.onrender.com/api',
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

// Updated apiRequest wrapper to safely handle both body and query data
export const apiRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url,
    };

    // Agar GET request hai toh params mein bhejo, POST/PUT hai toh data (body) mein
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