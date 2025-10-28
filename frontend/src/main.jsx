import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import App from './App';
import './index.css';
// Import axios configuration from lib/axios.js (configures baseURL)
import './lib/axios';
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
