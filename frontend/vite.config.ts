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
      output: {
        manualChunks: (id) => {
          // Vendor chunks - simplified and more stable
          if (id.includes('node_modules')) {
            // Core React libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // UI libraries
            if (id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            // Form and validation libraries
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'vendor-forms';
            }
            // HTTP client
            if (id.includes('axios')) {
              return 'vendor-http';
            }
            // Math rendering
            if (id.includes('katex') || id.includes('mathjax')) {
              return 'vendor-math';
            }
            // PDF generation
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('docx')) {
              return 'vendor-pdf';
            }
            // Other vendor libraries
            return 'vendor';
          }
          
          // Application chunks - simplified
          if (id.includes('/pages/')) {
            if (id.includes('admin/')) return 'pages-admin';
            if (id.includes('auth/')) return 'pages-auth';
            if (id.includes('dashboard/')) return 'pages-dashboard';
            if (id.includes('chat/')) return 'pages-chat';
            if (id.includes('materials/')) return 'pages-materials';
            return 'pages-misc';
          }
          
          // Component chunks - simplified
          if (id.includes('/components/')) {
            if (id.includes('ui/')) return 'components-ui';
            if (id.includes('admin/')) return 'components-admin';
            if (id.includes('chat/')) return 'components-chat';
            if (id.includes('math/')) return 'components-math';
            return 'components-misc';
          }
          
          // Other chunks
          if (id.includes('/contexts/')) return 'contexts';
          if (id.includes('/services/')) return 'services';
          if (id.includes('/hooks/')) return 'hooks';
          if (id.includes('/utils/')) return 'utils';
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  esbuild: {
    define: {
      global: 'globalThis',
    },
  },
  // Replace environment variables in HTML template
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        // Get API URL from environment or use fallback
        const apiUrl = process.env.VITE_API_URL || 
                      process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';
        
        return html.replace(/%VITE_API_URL%/g, apiUrl);
      },
    },
  ],
}) 