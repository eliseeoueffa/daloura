import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { BASE, creerClient, INSCRIPTION } from "./helpers";

describe("protections générales de l'API", () => {
  it("refuse une requête venant d'un autre site (CSRF)", async () => {
    const c = creerClient();
    const r = await c.appeler("POST", "/api/auth/inscription", INSCRIPTION, { origin: "https://pirate.example" });
    expect(r.status).toBe(403);
    expect(r.body.error).toBe("origine_refusee");
  });

  it("refuse un corps qui n'est pas du JSON (formulaire HTML)", async () => {
    const c = creerClient();
    const r = await c.appeler("POST", "/api/auth/connexion", undefined, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    expect(r.status).toBe(415);
  });

  it("refuse un JSON cassé ou qui n'est pas un objet", async () => {
    const { handleApi } = await import("../../worker/app");
    const { env } = await import("cloudflare:test");
    const deps = { db: env.DB, mailer: { send: async () => {} }, now: Date.now, appUrl: BASE, waitUntil: () => {} };
    for (const body of ["{", "[]", "null", '"x"']) {
      const res = await handleApi(
        new Request(`${BASE}/api/auth/connexion`, { method: "POST", headers: { "content-type": "application/json" }, body }),
        deps,
      );
      expect(res.status).toBe(400);
    }
  });

  it("répond 405 à une mauvaise méthode et 404 à une route inconnue", async () => {
    const c = creerClient();
    expect((await c.appeler("GET", "/api/auth/connexion")).status).toBe(405);
    expect((await c.appeler("GET", "/api/rien")).status).toBe(404);
  });

  it("ne met jamais les réponses de l'API en cache", async () => {
    const c = creerClient();
    const r = await c.appeler("GET", "/api/auth/session");
    expect(r.headers.get("cache-control")).toBe("no-store");
  });
});

describe("Worker complet", () => {
  it("/api/health répond", async () => {
    const res = await exports.default.fetch(`${BASE}/api/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, service: "daloura" });
  });

  it("les routes de comptes passent par le Worker avec la vraie base", async () => {
    const res = await exports.default.fetch(`${BASE}/api/auth/session`);
    expect(res.status).toBe(401);
  });
});
