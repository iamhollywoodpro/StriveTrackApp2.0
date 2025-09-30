import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  return {
    build: {
      outDir: "dist",
      chunkSizeWarningLimit: 2000,
      sourcemap: false,
      minify: isProd ? 'esbuild' : false,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE || ''),
      'import.meta.env.VITE_MEDIA_API_BASE': JSON.stringify(process.env.VITE_MEDIA_API_BASE || ''),
    },
    // Optimize plugins for build performance
    plugins: [tsconfigPaths(), react()],
    server: {
      port: 3000,
      host: "0.0.0.0",
      strictPort: true,
      allowedHosts: ['.amazonaws.com', '.builtwithrocket.new'],
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