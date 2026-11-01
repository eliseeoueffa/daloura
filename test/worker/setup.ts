import { applyD1Migrations, env } from "cloudflare:test";
import { beforeEach } from "vitest";

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);

// Chaque test part d'une base vide.
beforeEach(async () => {
  await env.DB.batch(
    ["sessions", "reset_tokens", "email_verifications", "rate_limits", "users"].map((t) =>
      env.DB.prepare(`DELETE FROM ${t}`),
    ),
  );
});
