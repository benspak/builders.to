import axios from 'axios';

// Get the API URL from environment variables
// In production, this will be set to the backend service URL
// In development, the proxy in vite.config.js handles /api routes
const API_URL = import.meta.env.VITE_API_URL || '';

// Configure axios to use the API URL when in production
if (API_URL) {
  axios.defaults.baseURL = API_URL;
}

export default axios;
