import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // Explicit alias (matching tsconfig's "@/*") rather than the
      // vite-tsconfig-paths plugin — this environment's filesystem sits
      // behind a path-virtualization junction that plugin's own tsconfig
      // discovery doesn't resolve reliably; a direct alias sidesteps it.
      "@": path.resolve(dirname, "src"),
      // See tests/unit/server-only-shim.ts for why this alias exists.
      "server-only": path.resolve(dirname, "tests/unit/server-only-shim.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    setupFiles: ["tests/unit/setup.ts"],
  },
});
