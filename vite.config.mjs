import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  plugins: [
    react(),
    svgr(), // This enables ?react SVG imports
  ],

  // Prevent Vite from pre-bundling the optional package that requires core-js.
  // This avoids esbuild failing to resolve `core-js/modules/...` during optimize.
  optimizeDeps: {
    exclude: ["react-country-state-fields"],
  },

  // 🔥 ADD THIS:
  server: {
    proxy: {
      // Forward all /api/* requests to your Node/Express backend
      "/api": {
        target: "http://localhost:5173", // Your backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
