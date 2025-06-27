// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy MessageBird API requests to avoid CORS issues in development
      "/messagebird-api": {
        target: "https://rest.messagebird.com",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/messagebird-api/, ""),
        secure: true,
        headers: {
          "User-Agent": "Wedding-App/1.0"
        }
      },
      // Proxy MessageBird Push API requests to avoid CORS issues in development
      "/messagebird-push-api": {
        target: "https://push.messagebird.com/v1",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/messagebird-push-api/, ""),
        secure: true,
        headers: {
          "User-Agent": "Wedding-App/1.0"
        }
      }
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  // Ensure static files are served correctly
  publicDir: "public",
  build: {
    // Ensure proper asset handling
    assetsDir: "assets",
    rollupOptions: {
      // Don't bundle the wedding.html file
      external: ["/wedding.html"]
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIHByb3h5OiB7XG4gICAgICAvLyBQcm94eSBNZXNzYWdlQmlyZCBBUEkgcmVxdWVzdHMgdG8gYXZvaWQgQ09SUyBpc3N1ZXMgaW4gZGV2ZWxvcG1lbnRcbiAgICAgICcvbWVzc2FnZWJpcmQtYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL3Jlc3QubWVzc2FnZWJpcmQuY29tJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvbWVzc2FnZWJpcmQtYXBpLywgJycpLFxuICAgICAgICBzZWN1cmU6IHRydWUsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnVXNlci1BZ2VudCc6ICdXZWRkaW5nLUFwcC8xLjAnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyBQcm94eSBNZXNzYWdlQmlyZCBQdXNoIEFQSSByZXF1ZXN0cyB0byBhdm9pZCBDT1JTIGlzc3VlcyBpbiBkZXZlbG9wbWVudFxuICAgICAgJy9tZXNzYWdlYmlyZC1wdXNoLWFwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9wdXNoLm1lc3NhZ2ViaXJkLmNvbS92MScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL21lc3NhZ2ViaXJkLXB1c2gtYXBpLywgJycpLFxuICAgICAgICBzZWN1cmU6IHRydWUsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnVXNlci1BZ2VudCc6ICdXZWRkaW5nLUFwcC8xLjAnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgLy8gRW5zdXJlIHN0YXRpYyBmaWxlcyBhcmUgc2VydmVkIGNvcnJlY3RseVxuICBwdWJsaWNEaXI6ICdwdWJsaWMnLFxuICBidWlsZDoge1xuICAgIC8vIEVuc3VyZSBwcm9wZXIgYXNzZXQgaGFuZGxpbmdcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIC8vIERvbid0IGJ1bmRsZSB0aGUgd2VkZGluZy5odG1sIGZpbGVcbiAgICAgIGV4dGVybmFsOiBbJy93ZWRkaW5nLmh0bWwnXVxuICAgIH1cbiAgfVxufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQTtBQUFBLE1BRUwsb0JBQW9CO0FBQUEsUUFDbEIsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDQSxVQUFTQSxNQUFLLFFBQVEsc0JBQXNCLEVBQUU7QUFBQSxRQUN4RCxRQUFRO0FBQUEsUUFDUixTQUFTO0FBQUEsVUFDUCxjQUFjO0FBQUEsUUFDaEI7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLDJCQUEyQixFQUFFO0FBQUEsUUFDN0QsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLFVBQ1AsY0FBYztBQUFBLFFBQ2hCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUNULGdCQUFnQjtBQUFBLEVBQ2xCLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFFQSxXQUFXO0FBQUEsRUFDWCxPQUFPO0FBQUE7QUFBQSxJQUVMLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQTtBQUFBLE1BRWIsVUFBVSxDQUFDLGVBQWU7QUFBQSxJQUM1QjtBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
