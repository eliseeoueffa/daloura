// API de Daloura (Cloudflare Worker). Les fichiers de l'appli sont servis par le binding ASSETS ;
// le Worker ne répond qu'aux routes /api/* (voir run_worker_first dans wrangler.jsonc).
import { routeComptes } from "./comptes";
import { routeEssais } from "./essais";
import { purger } from "./purge";
import { routePhotos } from "./photos";

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  MEDIA: R2Bucket;
  MAKISEND_URL: string;
  /** Secrets du Worker (Cloudflare → daloura → Paramètres → Variables et secrets). */
  MAKISEND_API_KEY?: string;
  BETTER_AUTH_SECRET?: string;
  /** Générateur d'aperçus (worker/generation.ts) ; vide = provisoire, sans IA. */
  GENERATEUR?: string;
}

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "cache-control": "no-store" } });

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      const db = await env.DB.prepare("SELECT COUNT(*) AS n FROM styles")
        .first<{ n: number }>()
        .then((r) => (r ? "ok" : "vide"))
        .catch(() => "indisponible");
      const media = await env.MEDIA.head("sante")
        .then(() => "ok")
        .catch(() => "indisponible");
      const ok = db === "ok" && media === "ok";
      return json(
        { ok, service: "daloura", version: "0.1.0", db, media },
        ok ? 200 : 503,
      );
    }
    if (url.pathname === "/api/essais" || url.pathname.startsWith("/api/essais/")) {
      return routeEssais(request, env, ctx, url.pathname.slice("/api/essais".length));
    }
    if (url.pathname.startsWith("/api/compte/")) {
      return routeComptes(request, env, url.pathname.slice("/api/compte".length));
    }
    if (
      url.pathname === "/api/photos" ||
      url.pathname.startsWith("/api/photos/")
    ) {
      return routePhotos(
        request,
        env,
        url.pathname.slice("/api/photos".length),
      );
    }
    if (url.pathname.startsWith("/api/")) {
      return json({ error: "not_found" }, 404);
    }
    return env.ASSETS.fetch(request);
  },
  // Une fois par jour : suppressions automatiques promises dans la politique de confidentialité.
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(purger(env));
  },
} satisfies ExportedHandler<Env>;
