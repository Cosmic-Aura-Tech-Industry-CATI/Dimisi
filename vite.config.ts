import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import path from "path";

export default defineConfig(({ command }) => ({
  envPrefix: ["VITE_", "GOOGLE_"],
  server: {
    port: 8080,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@admin": path.resolve(import.meta.dirname, "./dimisi-admin"),
    },
  },
  ssr: {
    ...(command === "build" ? { noExternal: true } : {}),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three") || id.includes("@react-three")) {
              return "vendor-three";
            }
            if (id.includes("@tanstack/react-router") || id.includes("@tanstack/react-query")) {
              return "vendor-tanstack";
            }
            if (id.includes("lucide-react")) {
              return "vendor-lucide";
            }
            if (id.includes("lenis")) {
              return "vendor-lenis";
            }
          }
          if (id.includes("dimisi-admin")) {
            return "admin-module";
          }
        },
      },
    },
  },
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
  ],
}));
