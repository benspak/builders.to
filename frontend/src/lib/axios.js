import axios from 'axios';

// Get the API URL from environment variables
// In production, this will be set to the backend service URL
// In development, the proxy in vite.config.js handles /api routes
let API_URL = import.meta.env.VITE_API_URL || '';

// If API_URL is provided but doesn't include protocol, prepend https://
// This handles Render's host property which only provides hostname
if (API_URL && !API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
  API_URL = `https://${API_URL}`;
}

// Configure axios to use the API URL when in production
if (API_URL) {
  axios.defaults.baseURL = API_URL;
}

// Add request interceptor to attach auth token from localStorage on every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Clear auth data on 401
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export default axios;
