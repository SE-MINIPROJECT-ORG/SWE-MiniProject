import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Browser support (EVT-NF-006): the last two versions of Chrome, Firefox and Edge
  // all handle this JavaScript level.
  build: {
    target: ['chrome120', 'firefox120', 'edge120'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
    },
  },
  test: {
    environment: 'node',
  },
});
