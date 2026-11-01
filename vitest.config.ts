import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

// Deux projets : « worker » tourne dans le vrai runtime Workers (workerd) avec une base D1
// locale ; « web » teste la logique de l'appli dans un faux navigateur (jsdom).
export default defineConfig(async () => {
  const migrations = await readD1Migrations("migrations");
  return {
    test: {
      projects: [
        {
          plugins: [
            cloudflareTest({
              wrangler: { configPath: "./wrangler.jsonc" },
              miniflare: { bindings: { TEST_MIGRATIONS: migrations } },
            }),
          ],
          test: {
            name: "worker",
            include: ["test/worker/**/*.test.ts", "test/shared/**/*.test.ts"],
            setupFiles: ["test/worker/setup.ts"],
          },
        },
        {
          test: {
            name: "web",
            environment: "jsdom",
            include: ["test/web/**/*.test.{ts,tsx}"],
            setupFiles: ["test/web/setup.ts"],
          },
        },
      ],
    },
  };
});
