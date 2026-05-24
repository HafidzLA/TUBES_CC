import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Listen on all network interfaces
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Redirect to backend. Can be overridden in production
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
