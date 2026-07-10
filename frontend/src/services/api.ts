import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-powered-url-shortener-dashoard.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure simple interceptors for auth tokens or logs if needed in the future
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log standard errors to console
    console.error('[API Error]:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
