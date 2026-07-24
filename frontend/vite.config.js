import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash]-v4.js',
        chunkFileNames: 'assets/[name]-[hash]-v4.js',
        assetFileNames: 'assets/[name]-[hash]-v4.[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor'
            }
            if (id.includes('lucide-react')) {
              return 'icons'
            }
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
});
