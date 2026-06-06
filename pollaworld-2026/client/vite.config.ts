import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          vendor: ["react", "react-dom", "react-router-dom"],
          // PDF generation (heavy)
          pdf: ["@react-pdf/renderer"],
          // Notifications
          ui: ["sonner"],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
