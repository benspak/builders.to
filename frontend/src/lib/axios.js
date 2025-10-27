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

export default axios;
