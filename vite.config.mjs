import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const isDev = mode === 'development';
  
  return {
    // BULLETPROOF BUILD CONFIGURATION
    build: {
      outDir: "dist",
      emptyOutDir: true,
      chunkSizeWarningLimit: 10000, // Prevent chunk warnings
      sourcemap: false, // Disable sourcemaps for speed
      minify: isProd ? 'esbuild' : false, // Conditional minification
      cssCodeSplit: false, // Single CSS bundle for reliability
      target: ['es2020', 'chrome60', 'firefox60', 'safari11'], // Broader compatibility
      rollupOptions: {
        output: {
          manualChunks: undefined, // No manual chunks to prevent issues
          inlineDynamicImports: true, // Inline imports for simpler build
        },
        treeshake: false, // Disable tree shaking to prevent build issues
        external: [], // No external dependencies
      },
      reportCompressedSize: false, // Skip reporting for speed
      cssMinify: isProd ? 'esbuild' : false,
    },
    
    // Environment variable definitions (with fallbacks to prevent undefined errors)
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE || ''),
      'import.meta.env.VITE_MEDIA_API_BASE': JSON.stringify(process.env.VITE_MEDIA_API_BASE || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev'),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev'),
    },
    
    // MINIMAL PLUGIN CONFIGURATION FOR STABILITY
    plugins: [
      react({
        fastRefresh: isDev,
        babel: {
          plugins: [], // No babel plugins to prevent issues
        },
      }),
    ].filter(Boolean),
    
    // DEPENDENCY OPTIMIZATION
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom'
      ],
      exclude: [],
      force: true, // Always force fresh optimization
    },
    
    // PATH RESOLUTION
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'components': path.resolve(__dirname, './src/components'),
        'pages': path.resolve(__dirname, './src/pages'),
        'utils': path.resolve(__dirname, './src/utils'),
        'lib': path.resolve(__dirname, './src/lib'),
        'contexts': path.resolve(__dirname, './src/contexts'),
      },
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