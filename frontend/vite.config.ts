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
          // Vendor chunks
          if (id.includes('node_modules')) {
            // Heavy libraries for desktop
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-desktop';
            }
            // Note: recharts temporarily removed to fix React compatibility issues
            // if (id.includes('recharts')) {
            //   return 'charts-desktop';
            // }
            if (id.includes('katex')) {
              return 'math-rendering';
            }
            if (id.includes('docx')) {
              return 'document-generation';
            }
            // Core React libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Router and query libraries
            if (id.includes('react-router') || id.includes('react-query')) {
              return 'routing-state';
            }
            // UI and animation libraries
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'ui-animations';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'forms';
            }
            // Other vendor libraries
            return 'vendor';
          }
          
          // Application chunks based on features
          if (id.includes('/pages/')) {
            if (id.includes('auth/')) return 'auth-pages';
            if (id.includes('dashboard/')) return 'dashboard-pages';
            if (id.includes('chat/')) return 'chat-pages';
            return 'pages';
          }
          
          // Component chunks
          if (id.includes('/components/')) {
            if (id.includes('math/')) return 'math-components';
            if (id.includes('chat/')) return 'chat-components';
            if (id.includes('dashboard/')) return 'dashboard-components';
            if (id.includes('ui/')) return 'ui-components';
            if (id.includes('performance/')) return 'performance-components';
            return 'components';
          }
          
          // Utility chunks
          if (id.includes('/hooks/') || id.includes('/utils/')) {
            return 'utilities';
          }
          
          // Services and API
          if (id.includes('/services/')) {
            return 'services';
          }
        },
      },
    },
    chunkSizeWarningLimit: 900,
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