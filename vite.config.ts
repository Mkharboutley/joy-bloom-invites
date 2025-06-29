import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/zoko': {
        target: 'https://api.zoko.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zoko/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ZokoProxy/1.0)'
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure static files are served correctly
  publicDir: 'public',
  build: {
    // Ensure proper asset handling
    assetsDir: 'assets',
  }
}));