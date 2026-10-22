import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, Vite runs on port 5173 and forwards backend requests to Express (port 5000).
// The browser only talks to port 5173, so cookies and sessions work without CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
       proxy: {
     '/api': 'http://localhost:5001',
     '/order-confirmation': 'http://localhost:5001'
   }
  }
});
