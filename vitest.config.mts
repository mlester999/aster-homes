import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const serverOnlyStub = fileURLToPath(new URL("./tests/server-only.ts", import.meta.url));
const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: { alias: { "@": projectRoot, "server-only": serverOnlyStub } },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
