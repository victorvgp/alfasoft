import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:41083",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:41083",
        changeOrigin: true,
      },
    },
  },
  base: "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
