import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  // Replace environment variables in HTML template
  esbuild: {
    define: {
      global: 'globalThis',
    },
  },
  // Custom plugin to replace environment variables in HTML
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(/%VITE_API_URL%/g, process.env.VITE_API_URL || '');
      },
    },
  ],
}) 