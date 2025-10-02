import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// LEAN BUILD CONFIGURATION - Maximum Performance  
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  
  return {
    // Fix path resolution
    resolve: {
      alias: {
        'components': path.resolve('./src/components'),
        'pages': path.resolve('./src/pages'), 
        'utils': path.resolve('./src/utils'),
        'lib': path.resolve('./src/lib'),
        'contexts': path.resolve('./src/contexts'),
      }
    },
    // Ultra-fast build configuration
    build: {
      outDir: "dist",
      chunkSizeWarningLimit: 10000, // Disable chunk warnings
      sourcemap: false, // No sourcemaps
      minify: false, // Skip minification for speed
      cssCodeSplit: false, // Single CSS bundle
      target: 'esnext', // Modern browsers only
      rollupOptions: {
        output: {
          manualChunks: undefined, // No code splitting
          inlineDynamicImports: true, // Inline everything
        },
        treeshake: false, // Skip tree shaking for speed
      },
      reportCompressedSize: false, // Skip reporting
      cssMinify: false, // Skip CSS minification
      emptyOutDir: true,
    },
    
    // Minimal environment variables
    define: {
      'import.meta.env.VITE_API_BASE_URL': '"https://strivetrack-media-api.iamhollywoodpro.workers.dev"',
      'import.meta.env.VITE_MEDIA_API_BASE': '"https://strivetrack-media-api.iamhollywoodpro.workers.dev"',
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    
    // Minimal plugins - ONLY React
    plugins: [
      react({
        fastRefresh: false, // Disable fast refresh for build speed
        babel: false, // Disable babel transformation
      }),
    ],
    
    // Aggressive dependency optimization
    optimizeDeps: {
      include: ['react', 'react-dom'], // Only essential deps
      exclude: [
        '@dhiwise/component-tagger',
        'next',
        '@next/env',
        '@next/swc-linux-x64-gnu',
        'lucide-react', // Heavy icon library
        'framer-motion', // Heavy animation library
        'recharts', // Heavy chart library
        'd3', // Heavy data viz
      ],
      force: true, // Force re-optimization
    },
    
    // Minimal cache
    cacheDir: '.vite-lean',
    
    // Basic server config
    server: {
      port: 3000,
      host: "0.0.0.0",
      strictPort: true,
    }
  }
});