import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    target: ["es2019", "safari13"],
    // Client build only: split the React stack into a vendor chunk so
    // content-only deploys don't invalidate the library cache. (The SSR
    // prerender bundle must stay single-file.)
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            manualChunks: {
              vendor: ["react", "react-dom", "react-router-dom"],
            },
          },
        },
  },
}));
