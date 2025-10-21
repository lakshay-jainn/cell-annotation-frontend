import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   proxy: {
  //     // Example: all requests starting with /api will be proxied to localhost:8000
  //     "/api": {
  //       target: "http://localhost:8000",
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
});
