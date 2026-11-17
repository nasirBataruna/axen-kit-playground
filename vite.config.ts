import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite's SPA fallback serves deep-linked scenario routes during dev and preview.
export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0' },
  preview: { host: '0.0.0.0' }
});
