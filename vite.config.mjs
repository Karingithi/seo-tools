import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  // ✅ REQUIRED for sub-path deployment
  base: "/tools/",

  plugins: [
    react(),
    svgr(),
  ],

  optimizeDeps: {
    exclude: ["react-country-state-fields"],
  },

  // ⚠️ DEV ONLY — safe to keep, ignored in build
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5173",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
