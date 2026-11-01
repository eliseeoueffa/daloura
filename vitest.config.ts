import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

// Les tests tournent dans le runtime Workers (Miniflare), avec une vraie base D1 locale
// à laquelle on applique migrations/ avant chaque fichier de test.
export default defineConfig(async () => {
  const migrations = await readD1Migrations("./migrations");
  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: { bindings: { TEST_MIGRATIONS: migrations, MAKISEND_API_KEY: "mk_test" } },
      }),
    ],
    test: { include: ["worker/test/**/*.test.ts"], setupFiles: ["./worker/test/setup.ts"] },
  };
});
