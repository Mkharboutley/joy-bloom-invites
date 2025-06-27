import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy MessageBird API requests to avoid CORS issues in development
      '/messagebird-api': {
        target: 'https://rest.messagebird.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/messagebird-api/, ''),
        secure: true,
        headers: {
          'User-Agent': 'Wedding-App/1.0'
        }
      },
      // Proxy MessageBird Push API requests to avoid CORS issues in development
      '/messagebird-push-api': {
        target: 'https://push.messagebird.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/messagebird-push-api/, ''),
        secure: true,
        headers: {
          'User-Agent': 'Wedding-App/1.0'
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
    rollupOptions: {
      // Don't bundle the wedding.html file
      external: ['/wedding.html']
    }
  }
}));