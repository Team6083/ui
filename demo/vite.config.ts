import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"

// The demo imports "@team6083/ui" like an app would, but from src/, so it
// always shows the code on this branch. DEMO_BASE is the path GitHub Pages
// serves it under (/ui/).
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  base: process.env.DEMO_BASE ?? "/",
  resolve: {
    alias: { "@team6083/ui": fileURLToPath(new URL("../src/index.ts", import.meta.url)) },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Chakra alone is most of it; a demo does not need code splitting.
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      // The package's "use client" lines are for Next.js; a Vite bundle drops them.
      onwarn(warning, warn) {
        if (warning.code !== "MODULE_LEVEL_DIRECTIVE") warn(warning)
      },
    },
  },
})
