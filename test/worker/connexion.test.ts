import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { creerClient, INSCRIPTION, MINUTE } from "./helpers";

async function inscrite() {
  const c = creerClient();
  await c.appeler("POST", "/api/auth/inscription", INSCRIPTION);
  c.oublierCookies();
  return c;
}

const essai = (c: ReturnType<typeof creerClient>, code: string, email = INSCRIPTION.email) =>
  c.appeler("POST", "/api/auth/connexion", { email, code });

describe("POST /api/auth/connexion", () => {
  it("connecte avec le bon email et le bon code", async () => {
    const c = await inscrite();
    const r = await essai(c, "2468", "  awa.k@GMAIL.com");
    expect(r.status).toBe(200);
    expect(r.body.utilisatrice.prenom).toBe("Awa");
    expect(c.cookies["__Host-daloura_session"]).toBeTruthy();
  });

  it("compte les essais restants après un code faux", async () => {
    const c = await inscrite();
    const r = await essai(c, "1357");
    expect(r.status).toBe(401);
    expect(r.body).toEqual({ error: "code_incorrect", essaisRestants: 4 });
    expect((await essai(c, "1357")).body.essaisRestants).toBe(3);
    expect(c.cookies["__Host-daloura_session"]).toBeUndefined();
  });

  it("répond code_incorrect pour un email inconnu, sans compteur", async () => {
    const c = creerClient();
    const r = await essai(c, "2468", "inconnue@b.co");
    expect(r.status).toBe(401);
    expect(r.body).toEqual({ error: "code_incorrect" });
  });

  it("bloque 2 minutes à la 5e erreur, même avec le bon code", async () => {
    const c = await inscrite();
    for (let i = 0; i < 4; i++) expect((await essai(c, "1357")).status).toBe(401);
    const cinquieme = await essai(c, "1357");
    expect(cinquieme.status).toBe(423);
    expect(cinquieme.body).toEqual({ error: "bloquee", jusqua: c.horloge.now + 2 * MINUTE });

    const pendant = await essai(c, "2468");
    expect(pendant.status).toBe(423);
    expect(pendant.body.jusqua).toBe(cinquieme.body.jusqua);

    c.avancer(2 * MINUTE);
    expect((await essai(c, "2468")).status).toBe(200);
  });

  it("double la durée à chaque nouveau blocage, puis repart de zéro après un succès", async () => {
    const c = await inscrite();
    const bloquerUneFois = async () => {
      let r;
      for (let i = 0; i < 5; i++) r = await essai(c, "1357");
      return r!.body.jusqua - c.horloge.now;
    };
    expect(await bloquerUneFois()).toBe(2 * MINUTE);
    c.avancer(2 * MINUTE);
    expect(await bloquerUneFois()).toBe(4 * MINUTE);
    c.avancer(4 * MINUTE);
    expect(await bloquerUneFois()).toBe(8 * MINUTE);
    c.avancer(8 * MINUTE);

    expect((await essai(c, "2468")).status).toBe(200);
    expect(await bloquerUneFois()).toBe(2 * MINUTE);
  });

  it("plafonne le blocage à 1 heure", async () => {
    const c = await inscrite();
    await env.DB.prepare("UPDATE users SET lock_count = 20").run();
    let r;
    for (let i = 0; i < 5; i++) r = await essai(c, "1357");
    expect(r!.body.jusqua - c.horloge.now).toBe(60 * MINUTE);
  });

  it("une connexion réussie remet le compteur d'erreurs à zéro", async () => {
    const c = await inscrite();
    for (let i = 0; i < 4; i++) await essai(c, "1357");
    await essai(c, "2468");
    expect((await essai(c, "1357")).body.essaisRestants).toBe(4);
  });

  it("100 essais envoyés en même temps ne testent que 5 codes", async () => {
    const c = await inscrite();
    // Le bon code est dans le lot : il ne doit passer que s'il fait partie des 5 premiers réservés.
    const codes = Array.from({ length: 100 }, (_, i) => String(1000 + i * 7).padStart(4, "0"));
    const reponses = await Promise.all(
      codes.map((code, i) => c.appeler("POST", "/api/auth/connexion", { email: INSCRIPTION.email, code }, { ip: `10.1.${i}.1` })),
    );
    const evalues = reponses.filter((r) => r.status === 401 || (r.status === 423 && r.body.jusqua) || r.status === 200);
    expect(reponses.filter((r) => r.status === 401).length).toBeLessThanOrEqual(4);
    expect(evalues.length).toBeLessThanOrEqual(5);
    expect(reponses.filter((r) => r.status === 423).length).toBeGreaterThanOrEqual(95);
  });

  it("limite à 30 tentatives par heure et par IP, tous emails confondus", async () => {
    const c = creerClient();
    for (let i = 0; i < 30; i++) await essai(c, "2468", `x${i}@b.co`);
    expect((await essai(c, "2468", "y@b.co")).status).toBe(429);
  });

  it.each([{ code: "12" }, { code: 2468 }, { email: "pas-un-email" }])("refuse %o", async (champ) => {
    const c = await inscrite();
    const r = await c.appeler("POST", "/api/auth/connexion", { email: INSCRIPTION.email, code: "2468", ...champ });
    expect(r.status).toBe(400);
  });
});

describe("session", () => {
  it("GET /api/auth/session renvoie l'utilisatrice connectée", async () => {
    const c = await inscrite();
    await essai(c, "2468");
    const r = await c.appeler("GET", "/api/auth/session");
    expect(r.status).toBe(200);
    expect(r.body.utilisatrice.email).toBe("awa.k@gmail.com");
    expect(JSON.stringify(r.body)).not.toMatch(/hash|salt|id"/);
  });

  it("répond 401 sans session, et dit si un compte a déjà été ouvert sur ce téléphone", async () => {
    const c = creerClient();
    expect((await c.appeler("GET", "/api/auth/session")).body).toEqual({ error: "non_connectee", appareilConnu: false });
    await c.appeler("POST", "/api/auth/inscription", INSCRIPTION);
    await c.appeler("POST", "/api/auth/deconnexion", {});
    expect((await c.appeler("GET", "/api/auth/session")).body).toEqual({ error: "non_connectee", appareilConnu: true });
  });

  it("refuse un cookie de session inventé", async () => {
    const c = creerClient();
    const r = await c.appeler("GET", "/api/auth/session", undefined, {
      headers: { cookie: "__Host-daloura_session=invente" },
    });
    expect(r.status).toBe(401);
  });

  it("dure 90 jours et se prolonge quand elle sert", async () => {
    const c = await inscrite();
    await essai(c, "2468");
    c.avancer(60 * 86_400_000);
    const r = await c.appeler("GET", "/api/auth/session");
    expect(r.status).toBe(200);
    expect(r.headers.getSetCookie()[0]).toMatch(/Max-Age=7776000/);
    c.avancer(60 * 86_400_000); // 120 jours après la connexion, mais 60 après la dernière visite
    expect((await c.appeler("GET", "/api/auth/session")).status).toBe(200);
    c.avancer(91 * 86_400_000);
    expect((await c.appeler("GET", "/api/auth/session")).status).toBe(401);
  });

  it("POST /api/auth/deconnexion supprime la session et efface le cookie", async () => {
    const c = await inscrite();
    await essai(c, "2468");
    const jeton = c.cookies["__Host-daloura_session"];
    const r = await c.appeler("POST", "/api/auth/deconnexion", {});
    expect(r.status).toBe(204);
    expect(r.headers.getSetCookie()[0]).toMatch(/Max-Age=0/);
    // Il reste seulement la session ouverte à l'inscription (autre « téléphone »).
    expect(await env.DB.prepare("SELECT count(*) AS n FROM sessions").first("n")).toBe(1);
    // Même en rejouant l'ancien cookie, la session n'existe plus.
    const rejoue = await c.appeler("GET", "/api/auth/session", undefined, {
      headers: { cookie: `__Host-daloura_session=${jeton}` },
    });
    expect(rejoue.status).toBe(401);
  });

  it("en local (http), le cookie n'a ni Secure ni préfixe __Host-", async () => {
    const { handleApi } = await import("../../worker/app");
    const res = await handleApi(
      new Request("http://localhost:8787/api/auth/inscription", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(INSCRIPTION),
      }),
      { db: env.DB, mailer: { send: async () => {} }, now: Date.now, appUrl: "http://localhost:5173", waitUntil: () => {} },
    );
    const session = res.headers.getSetCookie().find((s) => s.startsWith("daloura_session="))!;
    expect(session).toBeTruthy();
    expect(session).not.toMatch(/Secure/);
  });
});
