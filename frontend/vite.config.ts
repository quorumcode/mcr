import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import viteSSR from "vite-ssr/plugin.js";
import ViteRadar from "vite-plugin-radar";
import viteCompression from 'vite-plugin-compression';
import removePreloads from './src/removePreloads';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteSSR(),
    vue(),
    ViteRadar({
      enableDev: true,
      analytics: {
        id: process.env.VITE_GOOGLE_ANALYTICS_KEY || "KEY-NO-FOUND",
      },
    }),
    viteCompression(),
    removePreloads(),
  ],
  server: {
    port: parseInt(process.env.FRONTEND_INTERNAL_PORT),
  },
  resolve: {
    alias: [
      {
        find: "@backend",
        replacement: path.resolve(__dirname, "../backend"),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
    mainFields: ["main", "module"],
  },
});
