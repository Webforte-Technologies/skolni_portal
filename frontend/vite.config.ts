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
          // Vendor chunks - split more granularly to reduce chunk sizes
          if (id.includes('node_modules')) {
            // Heavy libraries for desktop - split these further
            if (id.includes('jspdf')) {
              return 'pdf-jspdf';
            }
            if (id.includes('html2canvas')) {
              return 'pdf-html2canvas';
            }
            if (id.includes('docx')) {
              return 'document-generation';
            }
            if (id.includes('katex')) {
              return 'math-rendering';
            }
            
            // Core React libraries - separate them
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            if (id.includes('react')) {
              return 'react';
            }
            
            // Router libraries
            if (id.includes('react-router')) {
              return 'routing';
            }
            if (id.includes('react-query')) {
              return 'state-management';
            }
            
            // UI libraries - split further
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            
            // Form libraries
            if (id.includes('react-hook-form')) {
              return 'form-lib';
            }
            if (id.includes('zod')) {
              return 'validation';
            }
            
            // Other utility libraries
            if (id.includes('axios')) {
              return 'http-client';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'styling-utils';
            }
            
            // Other vendor libraries
            return 'vendor';
          }
          
          // Application chunks based on features - split more granularly
          if (id.includes('/pages/')) {
            if (id.includes('auth/')) return 'auth-pages';
            if (id.includes('dashboard/')) return 'dashboard-pages';
            if (id.includes('chat/')) return 'chat-pages';
            if (id.includes('admin/')) return 'admin-pages';
            if (id.includes('materials/')) return 'materials-pages';
            return 'misc-pages';
          }
          
          // Component chunks - more granular splitting
          if (id.includes('/components/')) {
            if (id.includes('math/')) return 'math-components';
            if (id.includes('chat/')) return 'chat-components';
            if (id.includes('dashboard/')) return 'dashboard-components';
            if (id.includes('admin/')) return 'admin-components';
            if (id.includes('ui/')) return 'ui-components';
            if (id.includes('performance/')) return 'performance-components';
            if (id.includes('accessibility/')) return 'accessibility-components';
            return 'misc-components';
          }
          
          // Testing utilities - separate chunk
          if (id.includes('/utils/testing/')) {
            return 'testing-utils';
          }
          
          // Other utility chunks
          if (id.includes('/hooks/')) {
            return 'hooks';
          }
          if (id.includes('/utils/')) {
            return 'utilities';
          }
          
          // Services and API
          if (id.includes('/services/')) {
            return 'services';
          }
          
          // Contexts
          if (id.includes('/contexts/')) {
            return 'contexts';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1200,
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
        return html.replace(/%VITE_API_URL%/g, process.env.VITE_API_URL || '/api');
      },
    },
  ],
}) 