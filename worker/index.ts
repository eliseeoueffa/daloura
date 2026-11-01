// API de Daloura (Cloudflare Worker). Les fichiers de l'appli sont servis par le binding ASSETS ;
// le Worker ne répond qu'aux routes /api/* (voir run_worker_first dans wrangler.jsonc).
import { handleApi } from "./app";
import { ConsoleMailer, MakiSendMailer, type Mailer } from "./email/mailer";
import type { Env } from "./env";

export type { Env };

function mailerDe(env: Env, url: URL): Mailer {
  if (!env.MAKISEND_URL || !env.MAKISEND_API_KEY) {
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return new ConsoleMailer(!local);
  }
  return new MakiSendMailer({
    url: env.MAKISEND_URL.replace(/\/+$/, ""),
    apiKey: env.MAKISEND_API_KEY,
    templates: {
      verification: env.MAKISEND_TEMPLATE_VERIFICATION ?? "verification",
      reinitialisation:
        env.MAKISEND_TEMPLATE_REINITIALISATION ?? "reinitialisation",
      code_change: env.MAKISEND_TEMPLATE_CODE_CHANGE ?? "code-change",
    },
  });
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, {
        db: env.DB,
        mailer: mailerDe(env, url),
        now: Date.now,
        appUrl: (env.APP_URL ?? url.origin).replace(/\/+$/, ""),
        waitUntil: (p) => ctx.waitUntil(p),
      });
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
