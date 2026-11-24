import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    // Node 25+ ships its own global localStorage, undefined without
    // --localstorage-file, and it shadows the one jsdom provides.
    execArgv: ["--no-experimental-webstorage"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "out"],
  },
  resolve: {
    // Reads the `@/*` alias straight out of tsconfig.json rather than restating
    // it here, so the two cannot drift apart. Native since Vite 7 — this
    // replaces the `vite-tsconfig-paths` plugin.
    tsconfigPaths: true,
  },
});
