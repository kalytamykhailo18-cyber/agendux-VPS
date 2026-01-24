import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ============================================
// VITE PRODUCTION BUILD CONFIGURATION
// Section 12.1: Speed - Fast page load times
// Section 12.3: Scalability - Optimized for growth
// ============================================

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build optimizations for production
  build: {
    // Output directly to nginx web root
    outDir: '/var/www/agendux/frontend/dist',
    emptyOutDir: true,

    // Target modern browsers for smaller bundle sizes
    target: 'es2020',

    // Enable minification (default: esbuild, fastest)
    minify: 'esbuild',

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Disable source maps for production (reduces bundle size significantly)
    sourcemap: false,

    // Chunk size warning limit (500KB)
    chunkSizeWarningLimit: 500,

    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Simple vendor chunk - all node_modules together to avoid load order issues
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        // Optimize chunk file names for caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          const info = assetInfo.name || '';
          if (/\.(gif|jpe?g|png|svg|webp|ico)$/.test(info)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.css$/.test(info)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(info)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },

  // Development server optimizations
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: true
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    // Include dependencies that are commonly used
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'axios'
    ]
  },

  // Preview server (for testing production builds)
  preview: {
    // Enable gzip compression
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
})
