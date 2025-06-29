
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy Zoko API requests in development
      '/api/zoko': {
        target: 'https://api.zoko.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zoko/, ''),
        headers: {
          'User-Agent': 'ZokoWebhookService/1.0'
        }
      }
    }
  },
  plugins: [
    react(),
    ...(command === 'serve' ? [componentTagger()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
