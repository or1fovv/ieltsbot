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
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash]-v5.js',
        chunkFileNames: 'assets/[name]-[hash]-v5.js',
        assetFileNames: 'assets/[name]-[hash]-v5.[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React — always needed
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('scheduler')) {
              return 'vendor-react'
            }
            // Supabase — heavy, lazy-loaded
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'vendor-supabase'
            }
            // Charts — only Progress page
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'vendor-charts'
            }
            // Icons — tree-shaken but still chunked
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            // TWA SDK
            if (id.includes('@twa-dev')) {
              return 'vendor-twa'
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
