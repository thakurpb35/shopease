import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 5174 / 5002 so ShopEase can run next to TaskFlow (5173 / 5001)
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, proxy: { "/api": "http://localhost:5002" } },
});
