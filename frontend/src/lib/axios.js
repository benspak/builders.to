import axios from 'axios';

// Get the API URL from environment variables
// In production: Set to the backend service URL (e.g., https://builders-backend.onrender.com)
// In development: Empty string uses Next.js rewrites or relative paths
let API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// If API_URL is provided but doesn't include protocol, prepend https://
if (API_URL && !API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
  API_URL = `https://${API_URL}`;
}

// Configure axios to use the API URL when provided
// In production with separate services: Use full backend URL
// In development: Use relative paths which work with Next.js rewrites
if (API_URL && process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = API_URL;
} else {
  // No baseURL means requests will be relative to current origin
  // In development, Next.js rewrites handle /api routes
  axios.defaults.baseURL = '';
}

// Add request interceptor to attach auth token from localStorage on every request
axios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear auth data on 401
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
