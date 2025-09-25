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
      minify: false,
      cssCodeSplit: true
    },
    // Only enable the heavy tagger plugin in development to reduce build memory
    plugins: [tsconfigPaths(), react(), ...(isProd ? [] : [tagger()])],
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