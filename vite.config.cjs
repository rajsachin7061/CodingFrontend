const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");

module.exports = defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
