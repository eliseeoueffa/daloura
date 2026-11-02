import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import worker from "../index";
import { COUT_GENERATION, PERLES_BIENVENUE } from "../../src/lib/perles";
import { INACTIVITE_MAX, PHOTOS_APPAREIL_MAX, VOTES_MAX, purger } from "../purge";

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 2, 3]);
const JPEG2 = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 9, 9, 9, 9]);
const appareilAleatoire = () => crypto.randomUUID().replace(/-/g, "");

type Opts = { cookie?: string; appareil?: string; methode?: string; corps?: unknown; brut?: BodyInit; envAutre?: object };
async function appel(chemin: string, o: Opts = {}) {
  const headers = new Headers();
  if (o.cookie) headers.set("cookie", o.cookie);
  if (o.appareil) headers.set("x-daloura-appareil", o.appareil);
  if (o.corps !== undefined) headers.set("content-type", "application/json");
  const req = new Request(`https://daloura.test${chemin}`, {
    method: o.methode ?? (o.corps !== undefined ? "POST" : "GET"),
    headers,
    body: o.corps !== undefined ? JSON.stringify(o.corps) : o.brut,
  });
  const ctx = createExecutionContext();
  const r = await worker.fetch(req as Request<unknown, IncomingRequestCfProperties>, { ...env, ...o.envAutre } as never, ctx);
  await waitOnExecutionContext(ctx); // attend la génération lancée en arrière-plan
  return r;
}
const cookieDe = (r: Response) =>
  r.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");

/** Compte connecté, avec consentement, selfie et inspirations envoyés. */
async function prete(perlesEnPlus = 0, inspirations = ["knotless", "fulani", "locks"]) {
  const appareil = appareilAleatoire();
  const email = `${crypto.randomUUID().slice(0, 8)}@test.daloura`;
  const r = await appel("/api/compte/inscription", { corps: { email, code: "2580" }, appareil });
  const cookie = cookieDe(r);
  const { id } = (await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first<{ id: string }>())!;
  if (perlesEnPlus) {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO perle_ledger (id, user_id, delta, reason, created_at) VALUES (?, ?, ?, 'admin', ?)").bind(
        crypto.randomUUID(),
        id,
        perlesEnPlus,
        Date.now(),
      ),
      env.DB.prepare("UPDATE users SET perles = perles + ? WHERE id = ?").bind(perlesEnPlus, id),
    ]);
  }
  await appel("/api/compte/consentement", { cookie, corps: {} });
  await appel("/api/photos/selfie", { cookie, appareil, methode: "PUT", brut: JPEG });
  for (const c of inspirations) await appel(`/api/photos/inspirations/${c}`, { cookie, appareil, methode: "PUT", brut: JPEG2 });
  return { cookie, appareil, id, email };
}
const solde = async (id: string) =>
  (await env.DB.prepare("SELECT perles FROM users WHERE id = ?").bind(id).first<{ perles: number }>())!.perles;

describe("photos rattachées au compte", () => {
  it("connectée : les photos vont dans le dossier du compte, et celles du téléphone sont vidées", async () => {
    const appareil = appareilAleatoire();
    await appel("/api/photos/selfie", { appareil, methode: "PUT", brut: JPEG }); // avant le compte
    const r = await appel("/api/compte/inscription", { corps: { email: `${appareil.slice(0, 8)}@t.daloura`, code: "1470" }, appareil });
    const cookie = cookieDe(r);
    expect(await (await appel("/api/photos", { cookie, appareil })).json()).toEqual({ selfie: null, inspirations: [] });
    expect((await env.MEDIA.list({ prefix: "appareils/" })).objects.some((o) => o.key.includes(appareil))).toBe(false);
    await appel("/api/photos/selfie", { cookie, appareil, methode: "PUT", brut: JPEG });
    const { id } = (await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(`${appareil.slice(0, 8)}@t.daloura`).first<{ id: string }>())!;
    expect(await env.MEDIA.head(`comptes/${id}/selfie.jpg`)).not.toBeNull();
  });
});

describe("essais", () => {
  it("bienvenue : 1 coiffure, 3 perles débitées, aperçu prêt et lisible", async () => {
    const { cookie, id } = await prete();
    expect(await solde(id)).toBe(PERLES_BIENVENUE);
    const r = await appel("/api/essais", { cookie, corps: { coiffures: ["knotless"] } });
    expect(r.status).toBe(201);
    const { essai, cout } = (await r.json()) as { essai: string; cout: number };
    expect(cout).toBe(COUT_GENERATION);
    expect(await solde(id)).toBe(PERLES_BIENVENUE - COUT_GENERATION);
    const e = (await (await appel(`/api/essais/${essai}`, { cookie })).json()) as {
      statut: string;
      provisoire: boolean;
      apercus: { id: string; coiffure: string; statut: string }[];
    };
    expect(e).toMatchObject({ statut: "ready", provisoire: true });
    expect(e.apercus).toEqual([{ id: expect.any(String), coiffure: "knotless", statut: "ready" }]);
    const img = await appel(`/api/essais/${essai}/apercus/${e.apercus[0].id}`, { cookie });
    expect(img.status).toBe(200);
    expect(img.headers.get("content-type")).toBe("image/jpeg");
  });

  it("3 coiffures : 9 perles, 3 aperçus", async () => {
    const { cookie, id } = await prete(18);
    const r = await appel("/api/essais", { cookie, corps: { coiffures: ["knotless", "fulani", "locks"] } });
    const { essai } = (await r.json()) as { essai: string };
    expect(await solde(id)).toBe(PERLES_BIENVENUE + 18 - 3 * COUT_GENERATION);
    const e = (await (await appel(`/api/essais/${essai}`, { cookie })).json()) as { apercus: { statut: string }[] };
    expect(e.apercus.map((a) => a.statut)).toEqual(["ready", "ready", "ready"]);
  });

  it("solde insuffisant : 402 avec le manque, rien débité", async () => {
    const { cookie, id } = await prete();
    const r = await appel("/api/essais", { cookie, corps: { coiffures: ["knotless", "fulani"] } });
    expect(r.status).toBe(402);
    expect(await r.json()).toMatchObject({ manque: 2 * COUT_GENERATION - PERLES_BIENVENUE });
    expect(await solde(id)).toBe(PERLES_BIENVENUE);
  });

  it("génération ratée : aperçu en échec et perles rendues", async () => {
    const { cookie, id } = await prete();
    const r = await appel("/api/essais", { cookie, corps: { coiffures: ["knotless"] }, envAutre: { GENERATEUR: "echec-test" } });
    const { essai } = (await r.json()) as { essai: string };
    const e = (await (await appel(`/api/essais/${essai}`, { cookie })).json()) as { statut: string; apercus: { statut: string }[] };
    expect(e.statut).toBe("failed");
    expect(e.apercus[0].statut).toBe("failed");
    expect(await solde(id)).toBe(PERLES_BIENVENUE);
  });

  it("refus : sans connexion, sans consentement, photos manquantes, coiffure inconnue ou en double", async () => {
    expect((await appel("/api/essais", { corps: { coiffures: ["knotless"] } })).status).toBe(401);
    const { cookie } = await prete(30, ["knotless"]);
    const r = await appel("/api/essais", { cookie, corps: { coiffures: ["knotless", "fulani"] } });
    expect(r.status).toBe(409);
    expect(await r.json()).toMatchObject({ manquantes: ["fulani"] });
    expect((await appel("/api/essais", { cookie, corps: { coiffures: ["mohawk"] } })).status).toBe(400);
    expect((await appel("/api/essais", { cookie, corps: { coiffures: ["knotless", "knotless"] } })).status).toBe(400);
    expect((await appel("/api/essais", { cookie, corps: { coiffures: ["a", "b", "c", "d"] } })).status).toBe(400);

    const appareil = appareilAleatoire();
    const sans = cookieDe(await appel("/api/compte/inscription", { corps: { email: `${appareil.slice(0, 8)}@s.daloura`, code: "1234" }, appareil }));
    expect((await appel("/api/essais", { cookie: sans, corps: { coiffures: ["knotless"] } })).status).toBe(403);
  });

  it("on ne voit pas les essais d'une autre", async () => {
    const a = await prete();
    const { essai } = (await (await appel("/api/essais", { cookie: a.cookie, corps: { coiffures: ["knotless"] } })).json()) as { essai: string };
    const b = await prete();
    expect((await appel(`/api/essais/${essai}`, { cookie: b.cookie })).status).toBe(404);
  });

  it("changer d'inspiration après le lancement ne change pas l'essai (copie figée)", async () => {
    const { cookie, appareil, id } = await prete();
    const { essai } = (await (await appel("/api/essais", { cookie, corps: { coiffures: ["knotless"] } })).json()) as { essai: string };
    await appel("/api/photos/inspirations/knotless", { cookie, appareil, methode: "DELETE" });
    expect(await env.MEDIA.head(`comptes/${id}/essais/${essai}/inspiration-knotless.jpg`)).not.toBeNull();
  });
});

describe("suppressions automatiques", () => {
  it("compte inactif depuis 2 ans : supprimé avec ses photos, paiements archivés sans lien", async () => {
    const { cookie, id } = await prete();
    await appel("/api/essais", { cookie, corps: { coiffures: ["knotless"] } });
    await env.DB.prepare(
      "INSERT INTO payments (id, user_id, sachet_id, amount_xof, perles, status, provider_ref, created_at, paid_at) VALUES (?, ?, 'hair-era', 1000, 21, 'paid', ?, ?, ?)",
    )
      .bind(`p-${id}`, id, `itaja-${id}`, Date.now(), Date.now())
      .run();
    const bientot = Date.now() + INACTIVITE_MAX + 1000;
    await purger(env, bientot);
    expect(await env.DB.prepare("SELECT 1 FROM users WHERE id = ?").bind(id).first()).toBeNull();
    expect(await env.DB.prepare("SELECT 1 FROM auth_user WHERE id = ?").bind(id).first()).toBeNull();
    expect(await env.DB.prepare("SELECT 1 FROM trials WHERE user_id = ?").bind(id).first()).toBeNull();
    expect((await env.MEDIA.list({ prefix: `comptes/${id}/` })).objects).toHaveLength(0);
    const archive = await env.DB.prepare("SELECT * FROM paiements_archives WHERE id = ?").bind(`p-${id}`).first();
    expect(archive).toMatchObject({ amount_xof: 1000, provider_ref: `itaja-${id}` });
    expect(JSON.stringify(archive)).not.toContain(id.slice(0, 8) + "@");
  });

  it("compte actif : gardé", async () => {
    const { id } = await prete();
    await purger(env, Date.now() + INACTIVITE_MAX - 60_000);
    expect(await env.DB.prepare("SELECT 1 FROM users WHERE id = ?").bind(id).first()).not.toBeNull();
  });

  it("votes 12 mois après la fermeture, photos de téléphone jamais rattachées après 30 jours", async () => {
    const { cookie, id } = await prete(30);
    const { essai } = (await (await appel("/api/essais", { cookie, corps: { coiffures: ["knotless", "fulani"] } })).json()) as { essai: string };
    const p = await env.DB.prepare("SELECT id FROM previews WHERE trial_id = ? LIMIT 1").bind(essai).first<{ id: string }>();
    await env.DB.prepare("UPDATE trials SET vote_closes_at = ? WHERE id = ?").bind(Date.now(), essai).run();
    await env.DB.prepare("INSERT INTO votes (id, trial_id, preview_id, voter_id, created_at) VALUES (?, ?, ?, 'v1', ?)")
      .bind(crypto.randomUUID(), essai, p!.id, Date.now())
      .run();
    const app = appareilAleatoire();
    await appel("/api/photos/selfie", { appareil: app, methode: "PUT", brut: JPEG });

    const b1 = await purger(env, Date.now() + 1000);
    expect(b1.votes).toBe(0);
    const b2 = await purger(env, Date.now() + Math.max(VOTES_MAX, PHOTOS_APPAREIL_MAX) + 1000);
    expect(await env.DB.prepare("SELECT 1 FROM votes WHERE trial_id = ?").bind(essai).first()).toBeNull();
    expect(b2.photosAppareils).toBeGreaterThan(0);
    expect(id).toBeTruthy();
  });
});
