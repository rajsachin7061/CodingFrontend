import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "https://codingbackend-rdyv.onrender.com",
        changeOrigin: true,
      },
    },
  },
})
