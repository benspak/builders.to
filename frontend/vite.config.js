import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5555',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 3000,
    strictPort: true,
    // Serve the built files correctly for SPA routing
    headers: {
      'Cache-Control': 'no-cache'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    publicDir: 'public',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
      }
    },
    // Copy public files including _redirects
    copyPublicDir: true
  },
  define: {
    // Ensure environment variables are available at build time
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || ''),
  }
});
