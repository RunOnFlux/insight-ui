import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Dev proxies target the production explorer so the app runs against real chain data.
const DEV_API_TARGET = 'https://explorer.runonflux.io';

export default defineConfig({
  // Relative asset URLs — resolved against the <base href> the bitcore-node
  // service injects, so the app works under any routePrefix.
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: DEV_API_TARGET,
        changeOrigin: true,
      },
      '/socket.io': {
        target: DEV_API_TARGET,
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
