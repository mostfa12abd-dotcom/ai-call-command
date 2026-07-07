import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";

const port = Number(process.env.PORT) || 5173;
const basePath = process.env.BASE_PATH || "/";

// Explicitly surface VITE_ secrets from process.env into import.meta.env
// (required for Replit Secrets to reach Vite 8 / OXC transform)
const replitEnvDefines = Object.fromEntries(
  Object.entries(process.env)
    .filter(([k]) => k.startsWith("VITE_"))
    .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v ?? "")])
);

export default defineConfig({
  base: basePath,
  define: replitEnvDefines,
  plugins: [
    react(),
    runtimeErrorOverlay(),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
