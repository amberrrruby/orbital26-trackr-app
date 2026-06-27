import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./lib/tests/setup.ts",
    include: ["app/tests/unit/**/*.test.ts", "app/tests/unit/**/*.test.tsx"],
  },
});
