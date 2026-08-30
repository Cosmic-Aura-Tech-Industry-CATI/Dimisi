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
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
  ],
}));
