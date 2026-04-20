import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";

const rawPort = process.env.MOCKUP_PORT ?? process.env.PORT ?? "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(
    `Invalid mockup port value: "${rawPort}". Set MOCKUP_PORT or PORT to a positive number.`,
  );
}

function normalizeBasePath(value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) return "/";
  return normalized.startsWith("/") ? normalized : "/";
}

const basePath = normalizeBasePath(process.env.MOCKUP_BASE_PATH);

export default defineConfig({
  base: basePath,
  plugins: [
    mockupPreviewPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
