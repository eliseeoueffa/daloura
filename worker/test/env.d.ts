import type { D1Migration } from "cloudflare:test";

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      MEDIA: R2Bucket;
      MAKISEND_URL: string;
      MAKISEND_API_KEY: string;
      BETTER_AUTH_SECRET: string;
      TEST_MIGRATIONS: D1Migration[];
    }
  }
}
