import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Local dev talks to the backend through this proxy, so VITE_API_BASE_URL can stay empty.
    // On Vercel it is set to the Render URL instead (docs/DEPLOYMENT.md).
    proxy: { '/api': 'http://localhost:8000' },
  },
});
