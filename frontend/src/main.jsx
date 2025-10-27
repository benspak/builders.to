import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import './index.css';
import axios from 'axios';
import theme from './theme';

// Suppress known harmless browser extension errors
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    // Ignore known browser extension errors
    if (
      message.includes('MutationObserver') ||
      message.includes('web-client-content-script') ||
      (message.includes('ERR_NAME_NOT_RESOLVED') && message.includes('stripe.com'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

// Configure axios for production
// In development, Vite proxy handles /api routes
// In production, use the backend service URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || '';
if (API_URL) {
  axios.defaults.baseURL = API_URL;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
