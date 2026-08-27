import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import path from "path";

export default defineConfig(({ command }) => ({
  server: {
    port: 8080,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  ssr: {
    // In dev mode ('serve'), allow Node.js to load CommonJS packages (like React) natively.
    // In production build ('build'), bundle dependencies for the Vercel standalone function.
    noExternal: command === "build" ? true : undefined,
  },
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
  ],
}));
