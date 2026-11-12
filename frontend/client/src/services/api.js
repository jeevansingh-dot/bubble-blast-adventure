
import axios from "axios";

const API = axios.create({
  baseURL: "https://bubble-blast-adventure-4f4h.onrender.com/api",
});

// Automatically attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const apiRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url,
    };

    if (method.toUpperCase() === "GET") {
      config.params = data;
    } else {
      config.data = data;
    }

    const response = await API(config);
    return response.data;
  } catch (error) {
    console.error(
      `API Error [${method} ${url}]:`,
      error.response?.data || error.message
    );

    const apiError = new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong"
    );

    apiError.status = error.response?.status || 0;
    apiError.data = error.response?.data || null;

    throw apiError;
  }
};
