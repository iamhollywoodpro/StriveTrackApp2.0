import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const isDev = mode === 'development';
  
  return {
    // Build optimization for faster builds
    build: {
      outDir: "dist",
      chunkSizeWarningLimit: 5000, // Increase limit to reduce warnings
      sourcemap: false, // Disable sourcemaps for faster builds
      minify: isProd ? 'esbuild' : false, // Fast minification
      cssCodeSplit: false, // Bundle CSS together for faster loading
      target: 'esnext', // Modern browsers only for faster builds
      rollupOptions: {
        output: {
          manualChunks: undefined, // Disable code splitting for simpler builds
        },
        // Reduce bundle analysis time
        treeshake: isProd ? 'smallest' : false,
      },
      // Optimize build performance
      reportCompressedSize: false, // Skip compression reporting to save time
      cssMinify: isProd ? 'esbuild' : false, // Fast CSS minification
      // Set reasonable timeout
      timeout: 60000, // 60 seconds max
    },
    
    // Environment variable definitions (with fallbacks to prevent undefined errors)
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE || ''),
      'import.meta.env.VITE_MEDIA_API_BASE': JSON.stringify(process.env.VITE_MEDIA_API_BASE || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev'),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev'),
    },
    
    // Optimize plugins for build performance - REMOVED @dhiwise/component-tagger for build speed
    plugins: [
      tsconfigPaths(),
      react({
        // Optimize React plugin for faster builds
        fastRefresh: isDev,
        babel: {
          plugins: isProd ? [] : undefined, // Skip babel plugins in production for speed
        },
      }),
      // NOTE: Removed @dhiwise/component-tagger to fix timeout issues
      // If needed, re-add it only in development mode: isDev && tagger()
    ],
    
    // Optimize dependency processing
    optimizeDeps: {
      include: [
        'react',
        'react-dom', 
        'react-router-dom',
        'framer-motion',
        'lucide-react',
        'date-fns',
        'clsx',
        'class-variance-authority',
        'tailwind-merge'
      ],
      exclude: [
        '@dhiwise/component-tagger', // Exclude problematic plugin
      ],
      force: isProd, // Force re-optimization in production
    },
    
    // Improve build performance with caching
    cacheDir: '.vite',
    
    server: {
      port: 3000,
      host: "0.0.0.0",
      strictPort: true,
      allowedHosts: ['.amazonaws.com', '.builtwithrocket.new', '.e2b.dev'],
      // Optimize dev server
      hmr: isDev ? { port: 3001 } : false,
      proxy: {
        // If you want local dev to hit a locally running Worker at 8787
        '/api/media': {
          target: 'http://localhost:8787',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/media/, ''),
        }
      }
    }
  }
});