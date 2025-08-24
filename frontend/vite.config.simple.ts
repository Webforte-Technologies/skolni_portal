import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simplified Vite config for testing
export default defineConfig({
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Simplified chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
        },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  esbuild: {
    define: {
      global: 'globalThis',
    },
  },
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        const apiUrl = process.env.VITE_API_URL || 
                      process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';
        
        return html.replace(/%VITE_API_URL%/g, apiUrl);
      },
    },
  ],
})
