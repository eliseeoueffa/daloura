// API de Daloura (Cloudflare Worker). Les fichiers de l'appli sont servis par le binding ASSETS ;
// le Worker ne répond qu'aux routes /api/* (voir run_worker_first dans wrangler.jsonc).
export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
}

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "cache-control": "no-store" } });

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      const db = await env.DB.prepare("SELECT COUNT(*) AS n FROM styles")
        .first<{ n: number }>()
        .then((r) => (r ? "ok" : "vide"))
        .catch(() => "indisponible");
      return json({ ok: db === "ok", service: "daloura", version: "0.1.0", db }, db === "ok" ? 200 : 503);
    }
    if (url.pathname.startsWith("/api/")) {
      return json({ error: "not_found" }, 404);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
